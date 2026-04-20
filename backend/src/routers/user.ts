
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


const DEFAULT_TITLE = "Select the most clickable thumbnail";


const router = Router();


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

router.get("/task", authMiddleware, async (req, res) => {
  //@ts-ignore
  const taskId: String = req.query.taskId;
  //@ts-ignore
  const userId: String = req.userId;


  console.log({
    user_id: Number(userId),
    id: Number(taskId)
  })

  const taskDetails = await prismaClient.task.findFirst({
    where: {
      user_id: Number(userId),
      id: Number(taskId)
    }, 
    include: {
      options: true
    }
  })

  if(!taskDetails){
    return res.status(411).json({
      message: "You don't have access to this task"
    })
  }

  const respones = await prismaClient.submission.findMany({
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

  taskDetails.options.forEach(option => {
    result[option.id] = {
        count: 1,
        option: {
          imageUrl: option.image_url
        }
      }
  })

  respones.forEach(r => {
    result[r.option_id].count++;
    
  });

  res.json({
    result
  })

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
        amount: 1 * TOTAL_DECIMALS,
        signature: parseData.data.signature,
        user_id: userId
      }
    });

    // console.log(parseData.data.options.map(x => ({
    //   image_url: x.imageUrl,
    //   task_id: respone.id
    // })))

    await tx.option.createMany({
      data: parseData.data.options.map(x => ({
        image_url: x.imageUrl,
        task_id: respone.id
      }))
    })

    return respone

  }, {
    timeout: 10000,      // 10 seconds (default is 5000ms)
    maxWait: 5000        // max time to wait for a connection
  })

  res.json({
    id: respone.id
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