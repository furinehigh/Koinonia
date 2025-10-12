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

export const getUser = async (username: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username
            },
            include: {
                mana: true,
                spells: true
            }
        })
        return user;
    } catch (e: any) {
        return e.message
    }
}

export const getUserCommunities = async (username: string) => {
    try {
        const communities = await prisma.community.findMany({
            where: {
                creator: {
                    username
                }
            },
            include: {
                _count: {
                    select: { members: true },
                },
            }
        })
        return communities
    } catch (e: any) {
        return e.message
    }
}