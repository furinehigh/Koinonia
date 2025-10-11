import { prisma } from "../prisma"


export const getUserMana = async (userId: string) => {
    try {
        const data = await prisma.koin.findFirst({
            where: {
                userId
            }
        })

        return data
    } catch (e: any) {
        return e.message
    }
}