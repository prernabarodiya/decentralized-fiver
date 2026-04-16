"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}
const prisma = new client_1.PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});
exports.default = prisma;
