import { prisma } from "../prisma"

export const getAllUsersFriends = async (userId: string) => {
  try {
    const friends = await prisma.friends.findMany({
      where: {
        OR: [
          { receiverId: userId },
          { requesterId: userId }
        ],
        isDeleted: false
      },
      include: {
        requester: true,
        receiver: true
      }
    })

    return friends.map(f => ({
      ...f,
      otherUser: f.requesterId === userId ? f.receiver : f.requester,
      isRequester: f.requesterId === userId
    }))
  } catch {
    return []
  }
}
