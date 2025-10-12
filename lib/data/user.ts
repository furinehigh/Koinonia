import { prisma } from "../prisma"


export const getUserMana = async (userId: string) => {
    try {
        const data = await prisma.mana.findFirst({
            where: {
                userId
            }
        })

        return data
    } catch (e: any) {
        return e.message
    }
}

export const getUser = (username: string) => {
    try {
        const user = await prisma.user.findUnique
    }
}