import nacl from "tweetnacl";


import { Router } from "express";
import prismaClient from "../lib/prisma";
import jwt from "jsonwebtoken";
import { workerMiddleware } from "../middleware";
import { WORKER_JWT_SECRET, TOTAL_DECIMALS } from "../config";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { privateKey } from "../privateKey";
import { decode } from "bs58";

const connection = new Connection(process.env.RPC_URL!);

const TOTAL_SUBMISSIONS = 100;


const WALLET_ADDRESS_WORKER = process.env.WALLET_ADDRESS_WORKER! ?? "";

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY!;

const router = Router();

// router.post("/payout", workerMiddleware, async (req, res) => {
//     // @ts-ignore
//     const userId: string = req.userId;
//     const worker = await prismaClient.worker.findFirst({
//         where: { id: Number(userId) }
//     })

//     if (!worker) {
//         return res.status(403).json({
//             message: "User not found"
//         })
//     }

//     const transaction = new Transaction().add(
//         SystemProgram.transfer({
//             fromPubkey: new PublicKey("8LiJKH4b16Sy74vdHcgjcawjDPKkoA4NSvGMtpv3r79B"),
//             toPubkey: new PublicKey(worker.address),
//             lamports: 1000_000_000 * worker.pending_amount / TOTAL_DECIMALS,
//         })
//     );

//     // const address = worker.address;
//     // const txnId = "0x12312312"

//     console.log(worker.address);

//     const keypair = Keypair.fromSecretKey(decode(privateKey));

//     const signature = await sendAndConfirmTransaction(
//             connection,
//             transaction,
//             [keypair],
//         );
//         console.log("*******************************************************")
//         console.log(transaction);
//         console.log(signature);
    


//     // We should add a lock here
//     await prismaClient.$transaction(async tx => {
//         await tx.worker.update({
//             where: {
//                 id: Number(userId)
//             },
//             data: {
//                 pending_amount: {
//                     decrement: worker.pending_amount
//                 },
//                 locked_amount: {
//                     increment: worker.pending_amount
//                 }
//             }
//         })

//         await tx.payouts.create({
//             data: {
//                 user_id: Number(userId),
//                 amount: worker.pending_amount,
//                 status: "Processing",
//                 signature: signature
//             }
//         })
//     })

//     res.json({
//         message: "Processing payout",
//         amount: worker.pending_amount
//     })


// })

router.post("/payout", workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId;

  try {
    // 1️⃣ Get worker
    const worker = await prismaClient.worker.findUnique({
      where: { id: Number(userId) }
    });

    if (!worker) {
      return res.status(403).json({
        message: "User not found"
      });
    }

    if (worker.pending_amount === 0) {
      return res.json({
        message: "No funds to withdraw",
        amount: 0
      });
    }

    const amountToPay = worker.pending_amount;

    // 2️⃣ 🔒 LOCK FUNDS FIRST (VERY IMPORTANT)
    await prismaClient.worker.update({
      where: { id: worker.id },
      data: {
        pending_amount: {
          decrement: amountToPay
        },
        locked_amount: {
          increment: amountToPay
        }
      }
    });

    // 3️⃣ Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey("8LiJKH4b16Sy74vdHcgjcawjDPKkoA4NSvGMtpv3r79B"),
        toPubkey: new PublicKey(worker.address),
        lamports: Math.floor(
          (amountToPay * 1_000_000_000) / TOTAL_DECIMALS
        ),
      })
    );

    const keypair = Keypair.fromSecretKey(decode(privateKey));

    let signature = "";

    // 4️⃣ 💸 SEND MONEY
    try {
      signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair]
      );
    } catch (err) {
      console.error("Blockchain tx failed:", err);

      // 🔁 ROLLBACK if blockchain fails
      await prismaClient.worker.update({
        where: { id: worker.id },
        data: {
          pending_amount: {
            increment: amountToPay
          },
          locked_amount: {
            decrement: amountToPay
          }
        }
      });

      return res.status(500).json({
        message: "Transaction failed"
      });
    }

    // 5️⃣ Save payout record (NO TRANSACTION NEEDED)
    await prismaClient.payouts.create({
      data: {
        user_id: Number(userId), // ok since you're assuming same account
        amount: amountToPay,
        status: "Processing",
        signature
      }
    });

    return res.json({
      message: "Processing payout",
      amount: amountToPay
    });

  } catch (error) {
    console.error("Payout error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});


router.get("/balance", workerMiddleware, async (req, res) => {
    // @ts-ignore
    const userId: string = req.userId;

    const worker = await prismaClient.worker.findFirst({
        where: {
            id: Number(userId)
        }
    })

    res.json({
        pendingAmount: worker?.pending_amount,
        lockedAmount: worker?.pending_amount,
    })
})

router.post("/submission", workerMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = Number(req.userId);
    const body = req.body;

    const parsedBody = createSubmissionInput.safeParse(body);
    if (!parsedBody.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }

    const taskId = Number(parsedBody.data.taskId);
    const optionId = Number(parsedBody.data.selection);

    // ✅ Check if task exists
    const task = await prismaClient.task.findFirst({
        where: { id: taskId },
        include: { options: true }
    });

    if (!task) {
        return res.status(411).json({
            message: "Task not found"
        });
    }

    // ✅ Validate option belongs to task
    const validOption = task.options.find(o => o.id === optionId);
    if (!validOption) {
        return res.status(411).json({
            message: "Invalid option selected"
        });
    }

    // ✅ Prevent duplicate submissions
    const alreadySubmitted = await prismaClient.submission.findFirst({
        where: {
            worker_id: userId,
            task_id: taskId
        }
    });

    if (alreadySubmitted) {
        return res.status(411).json({
            message: "Task already submitted"
        });
    }

    const amount = Number(task.amount) / TOTAL_SUBMISSIONS;

    await prismaClient.$transaction(async (tx) => {
        await tx.submission.create({
            data: {
                worker_id: userId,
                task_id: taskId,
                option_id: optionId,
                amount
            }
        });

        await tx.worker.update({
            where: { id: userId },
            data: {
                pending_amount: {
                    increment: amount
                }
            }
        });
    });

    // ✅ Get next task AFTER submission
    const nextTask = await getNextTask(userId);

    res.json({
        nextTask: nextTask || null,
        amount
    });
});

// router.post("/submission", workerMiddleware, async (req, res) => {
//     // @ts-ignore
//     const userId = req.userId;
//     const body = req.body;
//     const parsedBody = createSubmissionInput.safeParse(body);

//     if (parsedBody.success) {
//         const task = await getNextTask(Number(userId));
//         if (!task || task?.id !== Number(parsedBody.data.taskId)) {
//             return res.status(411).json({
//                 message: "Incorrect task id"
//             })
//         }

//         const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();
// //check here
//         const submission = await prismaClient.$transaction(async tx => {
//             const submission = await tx.submission.create({
//                 data: {
//                     option_id: Number(parsedBody.data.selection),
//                     worker_id: userId,
//                     task_id: Number(parsedBody.data.taskId),
//                     amount: Number(amount)
//                 }
//             })

//             await tx.worker.update({
//                 where: {
//                     id: userId,
//                 },
//                 data: {
//                     pending_amount: {
//                         increment: Number(amount)
//                     }
//                 }
//             })

//             return submission;
//         })

//         const nextTask = await getNextTask(Number(userId));
//         res.json({
//             nextTask,
//             amount
//         })
        

//     } else {
//         res.status(411).json({
//             message: "Incorrect inputs"
//         })
            
//     }

// })


router.get("/nextTask", workerMiddleware, async (req, res) => {
    // @ts-ignore
    const userId: string = req.userId;
    console.log("here i am here &&&&&&&&&&&&&&&&&&&&&&&&&&&&")
    const task = await getNextTask(Number(userId));

    if (!task) {
        res.status(411).json({   
            message: "No more tasks left for you to review"
        })
    } else {
        res.json({   
            task
        })
    }
})

router.post("/signin", async(req, res) =>{

    const { publicKey, signature} = req.body;
    const signedString = "Sign into Decentralized Fiverr";
    const message = new TextEncoder().encode("Sign into Decentralized Fiverr as a worker");

    const result = nacl.sign.detached.verify(
    message,
    new Uint8Array(signature),
    new PublicKey(publicKey).toBytes(),
    );

    if (!result) {
    return res.status(411).json({
        message: "Incorrect signature"
    })
    }


    try {
    const existingUser = await prismaClient.worker.findFirst({
      where: {
        address: publicKey,
      },
    });

    if (existingUser) {
      const token = jwt.sign(
        { userId: existingUser.id },
        WORKER_JWT_SECRET
      );

      return res.json({ 
        token,
        amount: existingUser.pending_amount / TOTAL_DECIMALS 
    });
    }


    const user = await prismaClient.worker.create({
      data: {
        address: publicKey,
        pending_amount: 0,
        locked_amount: 0
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      WORKER_JWT_SECRET
    );

    res.json({ 
        token,
        amount:0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;