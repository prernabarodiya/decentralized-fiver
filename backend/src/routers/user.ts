
import { Router } from "express";
console.log("hello ")
import prismaClient from "../lib/prisma";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "../middleware";
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { createTaskInput } from "../types";

const DEFAULT_TITLE = "Select the most clickable thumbnail";


const router = Router();

const JWT_SECRET = process.env.JWT_SECRET! ?? "";
const WALLET_ADDRESS = process.env.WALLET_ADDRESS! ?? "";

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY!;



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


router.post("/task", authMiddleware, async(req, res) => {
  //@ts-ignore
  const userId = req.userId;

  const body = req.body;
  const parseData = createTaskInput.safeParse(body);

  if(!parseData.success){
    return res.status(411).json({
      message: "You've sent the wrong input"
    })
  }

  let respone = await prismaClient.$transaction(async tx => {
    const respone = await tx.task.create({
      data: {
        title: parseData.data.title ?? DEFAULT_TITLE,
        amount: 1,
        signature: parseData.data.signature,
        user_id: userId
      }
    });

    // await tx.option.createMany({
    //   data: parseData.data.options.map(x => ({
    //     image_url: x.imageUrl,
    //     task_id: respone.id
    //   }))
    // })

    return respone

  })

})

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