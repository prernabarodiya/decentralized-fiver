import nacl from "tweetnacl";
import { Router } from "express";
console.log("hello ")
import prismaClient from "../lib/prisma";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "../middleware";
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { createTaskInput } from "../types";
import { JWT_SECRET, TOTAL_DECIMALS  } from "../config";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";



const DEFAULT_TITLE = "Select the most clickable thumbnail";


const router = Router();


const WALLET_ADDRESS = process.env.WALLET_ADDRESS! ?? "";

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY!;
const PARENT_WALLET_ADDRESS = "8LiJKH4b16Sy74vdHcgjcawjDPKkoA4NSvGMtpv3r79B";

const connection = new Connection(process.env.RPC_URL!);



if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

if (!WALLET_ADDRESS) {
  throw new Error("WALLET_ADDRESS is missing in .env");
}

const s3Client = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  },
  region: "eu-north-1"
})
router.get("/task", authMiddleware, async (req, res) => {
  //@ts-ignore
  const taskId: string = req.query.taskId;

  //@ts-ignore
  const userId: string = req.userId;

  console.log({
    user_id: Number(userId),
    id: Number(taskId)
  });

  const taskDetails = await prismaClient.task.findFirst({
    where: {
      user_id: Number(userId),
      id: Number(taskId)
    },
    include: {
      options: true
    }
  });

  if (!taskDetails) {
    return res.status(411).json({
      message: "You don't have access to this task"
    });
  }

  const responses = await prismaClient.submission.findMany({
    where: {
      task_id: Number(taskId)
    },
    include: {
      option: true
    }
  });

  const result: Record<string, {
    count: number;
    option: {
      imageUrl: string
    }
  }> = {};

  // initialize counts
  taskDetails.options.forEach(option => {
    result[option.id] = {
      count: 0,
      option: {
        imageUrl: option.image_url
      }
    };
  });

  // count submissions
  responses.forEach(r => {
    if (result[r.option_id]) {
      result[r.option_id].count++;
    }
  });

  res.json({
    task: {
      id: taskDetails.id,
      title: taskDetails.title,
      amount: taskDetails.amount,
      done: taskDetails.done
    },
    result
  });
});

// router.get("/task", authMiddleware, async (req, res) => {
//   //@ts-ignore
//   const taskId: String = req.query.taskId;
//   //@ts-ignore
//   const userId: String = req.userId;


//   console.log({
//     user_id: Number(userId),
//     id: Number(taskId)
//   })

//   const taskDetails = await prismaClient.task.findFirst({
//     where: {
//       user_id: Number(userId),
//       id: Number(taskId)
//     }, 
//     include: {
//       options: true
//     }
//   })

//   if(!taskDetails){
//     return res.status(411).json({
//       message: "You don't have access to this task"
//     })
//   }

//   const respones = await prismaClient.submission.findMany({
//     where: {
//       task_id: Number(taskId)
//     }, 
//     include: {
//       option: true
//     }
//   });

//   const result: Record<string, {
//     count: number;
//     option: {
//       imageUrl: string
//     }
//   }> = {};

//   taskDetails.options.forEach(option => {
//     result[option.id] = {
//         count: 1,
//         option: {
//           imageUrl: option.image_url
//         }
//       }
//   })

//   respones.forEach(r => {
//     result[r.option_id].count++;
    
//   });

//   res.json({
//     result
//   })

// })

router.post("/task", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const body = req.body;

  const parseData = createTaskInput.safeParse(body);

  if (!parseData.success) {
    return res.status(411).json({
      message: "Invalid input",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: { id: userId },
  });

  const transaction = await connection.getTransaction(
    parseData.data.signature,
    {
      maxSupportedTransactionVersion: 1,
    }
  );

  if (!transaction) {
    return res.status(411).json({
      message: "Transaction not found",
    });
  }

  const keys = transaction.transaction.message.getAccountKeys();

  const from = keys.get(0)?.toString();
  const to = keys.get(1)?.toString();

  // ✅ validate sender
  if (from !== user?.address) {
    return res.status(411).json({
      message: "Wrong sender",
    });
  }

  // ✅ validate receiver
  if (to !== PARENT_WALLET_ADDRESS) {
    return res.status(411).json({
      message: "Wrong recipient",
    });
  }

  // ✅ validate amount
  const pre = transaction.meta?.preBalances[1] ?? 0;
  const post = transaction.meta?.postBalances[1] ?? 0;

  if (post - pre !== 100000000) {
    return res.status(411).json({
      message: "Incorrect amount",
    });
  }

  const response = await prismaClient.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: parseData.data.title,
        amount: 0.1 * TOTAL_DECIMALS,
        signature: parseData.data.signature,
        user_id: userId,
      },
    });

    await tx.option.createMany({
      data: parseData.data.options.map((x) => ({
        image_url: x.imageUrl,
        task_id: task.id,
      })),
    });

    return task;
  });

  res.json({ id: response.id });
});

// router.post("/task", authMiddleware, async(req, res) => {
//   //@ts-ignore
//   const userId = req.userId;

//   const body = req.body;
//   const parseData = createTaskInput.safeParse(body);

//   const user = await prismaClient.user.findFirst({
//     where: {
//       id: userId
//     }
//   })

//   if(!parseData.success){
//     return res.status(411).json({
//       message: "You've sent the wrong input"
//     })
//   }

//   const transaction = await connection.getTransaction(parseData.data.signature, {
//     maxSupportedTransactionVersion: 1
//   });

//   console.log(transaction);

//   if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== 100000000) {
//     return res.status(411).json({
//       message: "Transaction signature/amount incorrect"
//     })
//   }

//   if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
//     return res.status(411).json({
//       message: "Transaction sent to wrong address"
//     })
//   }

//   if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
//     return res.status(411).json({
//       message: "Transaction sent to wrong address"
//     })
//   }

//   let respone = await prismaClient.$transaction(async tx => {
//     const respone = await tx.task.create({
//       data: {
//         title: parseData.data.title ?? DEFAULT_TITLE,
//         amount: 1 * TOTAL_DECIMALS,
//         signature: parseData.data.signature,
//         user_id: userId
//       }
//     });

//     // console.log(parseData.data.options.map(x => ({
//     //   image_url: x.imageUrl,
//     //   task_id: respone.id
//     // })))

//     await tx.option.createMany({
//       data: parseData.data.options.map(x => ({
//         image_url: x.imageUrl,
//         task_id: respone.id
//       }))
//     })

//     return respone

//   }, {
//     timeout: 10000,      // 10 seconds (default is 5000ms)
//     maxWait: 5000        // max time to wait for a connection
//   })

//   res.json({
//     id: respone.id
//   })

// })

router.get("/presignedUrl", authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: 'prerna-cms',
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
          ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
          
        ],
        Fields:{
          'Content-Type': 'img/jpg',
          // 'Content-Disposition': 'inline',
        },
        Expires: 3600
    })

    console.log({url, fields});

    res.json({
        preSignedUrl: url,
        fields
        
    })
    
})

router.post("/signin", async (req, res) => {

  const { publicKey, signature} = req.body;
  const signedString = "Sign into Decentralized Fiverr";
  const message = new TextEncoder().encode("Sign into Decentralized Fiverr");

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
    const existingUser = await prismaClient.user.findFirst({
      where: {
        address: publicKey,
      },
    });

    if (existingUser) {
      const token = jwt.sign(
        { userId: existingUser.id },
        JWT_SECRET
      );

      return res.json({ token });
    }

    const user = await prismaClient.user.create({
      data: {
        address: publicKey,
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;




// import { Router } from "express";

// import jwt from "jsonwebtoken";
// const JWT_SECRET = ""
// // import { PrismaClient } from "@prisma/client";
// // const prismaClient = new PrismaClient();
// import prismaClient from "../lib/prisma";

// const router = Router();


// router.post("/signin", async (req, res) =>{
//     const hardcodedWalletAddress = "";
//     const existingUser = await prismaClient.user.findFirst({
//         where: {
//             address: hardcodedWalletAddress
//         }
//     })

//     if(existingUser){
//         const token = jwt.sign({
//             userId: existingUser.id
//         }, JWT_SECRET)

//         res.json({
//             token
//         })
//     }else {
//         const user = await prismaClient.user.create({
//             data: {
//                 address: hardcodedWalletAddress
//             }
//         })

//         const token = jwt.sign({
//             userId: user.id
//         }, JWT_SECRET)

//         res.json({
//             token
//         })
//     }
// });

// export default router;