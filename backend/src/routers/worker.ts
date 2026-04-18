import { Router } from "express";
import prismaClient from "../lib/prisma";
import jwt from "jsonwebtoken";
import { workerMiddleware } from "../middleware";
import { WORKER_JWT_SECRET } from "../config";
import { getNextTask } from "../db";



const WALLET_ADDRESS_WORKER = process.env.WALLET_ADDRESS! ?? "";

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY!;

const router = Router();

router.get("/nextTask", workerMiddleware, async (req, res) => {
    // @ts-ignore
    const userId: string = req.userId;

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
    try {
    const existingUser = await prismaClient.worker.findFirst({
      where: {
        address: WALLET_ADDRESS_WORKER,
      },
    });

    if (existingUser) {
      const token = jwt.sign(
        { userId: existingUser.id },
        WORKER_JWT_SECRET
      );

      return res.json({ token });
    }

    const user = await prismaClient.worker.create({
      data: {
        address: WALLET_ADDRESS_WORKER,
        pending_amount: 0,
        locked_amount: 0
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      WORKER_JWT_SECRET
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