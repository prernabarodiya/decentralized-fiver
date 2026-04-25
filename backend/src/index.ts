import "dotenv/config";

// console.log("ENV CHECK:", process.env.DATABASE_URL);
import express from "express";
const app = express();
import userRouter from "./routers/user"
import workerRouter from "./routers/worker"
import cors from "cors";

app.use(express.json());
app.use(cors());

// console.log("DATABASE_URL:", process.env.DATABASE_URL);
app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

app.listen(5000);
