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

import { Router } from "express";
console.log("hello ")
import prismaClient from "../lib/prisma";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

if (!WALLET_ADDRESS) {
  throw new Error("WALLET_ADDRESS is missing in .env");
}

router.post("/signin", async (req, res) => {
  try {
    const existingUser = await prismaClient.user.findFirst({
      where: {
        address: WALLET_ADDRESS,
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
        address: WALLET_ADDRESS,
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