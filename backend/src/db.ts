import prismaClient from "./lib/prisma";

export const getNextTask = async (userId: number) => {
    const task = await prismaClient.task.findFirst({
        where: {
            done: false,
            submissions: {
                none: {
                    worker_id: userId
                }
            }
        },
        select: {
            id: true,
            amount: true,
            title: true,
            options: true
        }
    })

    return task
}