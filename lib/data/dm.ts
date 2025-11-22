import { prisma } from "../prisma"

export const getAllDMs = async (userId: string) => {
  try {
    const dms = await prisma.dM.findMany({
      where: {
        friendship: {
          OR: [
            { receiverId: userId },
            { requesterId: userId }
          ]
        }
      },
      include: {
        friendship: {
          include: {
            requester: true,
            receiver: true
          }
        },
        messages: {
            orderBy: {createdAt: 'desc'},
            take: 1
        }
      }

    })

    console.log(dms[0].messages)

    return dms.map(dm => ({
      ...dm,
      otherUser:
        dm.friendship.requesterId === userId
          ? dm.friendship.receiver
          : dm.friendship.requester,
      isRequester: dm.friendship.requesterId === userId
    }))
  } catch {
    return []
  }
}


export const getDMDetails = async (userId: string, dmId: string) => {
  try {
    const dm = await prisma.dM.findUnique({
      where: { id: dmId,
        OR: [
          {friendship: {
            requesterId: userId
          }},
          {friendship: {
            receiverId: userId
          }}
        ]
       },
      include: {
        friendship: {
          include: {
            requester: true,
            receiver: true
          }
        }
      }
    })

    if (!dm) return null

    const isRequester = dm.friendship.requesterId === userId

    return {
      ...dm,
      otherUser: isRequester
        ? dm.friendship.receiver
        : dm.friendship.requester,
      isRequester
    }
  } catch {
    return null
  }
}


export const getAllMessages = async (dmId: string) => {
  try {
    return await prisma.messages.findMany({
      where: { dmId },
      orderBy: { createdAt: "asc" }
    })
  } catch {
    return []
  }
}
