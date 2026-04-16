"use strict";
// import { Router } from "express";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import jwt from "jsonwebtoken";
// const JWT_SECRET = "Prerna123"
// // import { PrismaClient } from "@prisma/client";
// // const prismaClient = new PrismaClient();
// import prismaClient from "../lib/prisma";
// const router = Router();
// router.post("/signin", async (req, res) =>{
//     const hardcodedWalletAddress = "5BSMwCaVVaP6U8o1WKBWwSpUySTVeMnk8Vg6F2T8nn2x";
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
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
}
if (!WALLET_ADDRESS) {
    throw new Error("WALLET_ADDRESS is missing in .env");
}
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield prisma_1.default.user.findFirst({
            where: {
                address: WALLET_ADDRESS,
            },
        });
        if (existingUser) {
            const token = jsonwebtoken_1.default.sign({ userId: existingUser.id }, JWT_SECRET);
            return res.json({ token });
        }
        const user = yield prisma_1.default.user.create({
            data: {
                address: WALLET_ADDRESS,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
exports.default = router;
