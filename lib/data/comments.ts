import { prisma } from "../prisma"

export const getAllPostComments = async (postId: string) => {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                postId
            },
            include: {
                user: true,
                replies: true
            },
            orderBy: [
                { votes: 'desc' },
                { createdAt: 'desc' },
            ],
        })
        return comments
    } catch (e: any) {
        return e.message
    }
}

export const getAllUserComments = async (userId: string) => {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                userId
            },
            include: {
                post: {
                    include: {
                        community: true
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ]
        })
        return comments
    } catch (e: any) {
        return e.message
    }
}