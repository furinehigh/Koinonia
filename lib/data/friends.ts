import { prisma } from "../prisma"


export const getAllUsersFriends = async (userId: string) => {
    try {
        const friends = await prisma.friends.findMany({
            where: {
                receiverId: userId
            },
            include: {
                requester: true
            }
        })

        return friends
    } catch (e: any) {
        return []
    }
}