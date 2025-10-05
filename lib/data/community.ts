import { Community } from "@/types"
import { prisma } from "../prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"

export const communityData = async (slug: string, userId?: string): Promise<Community | null> => {
  try {
    const data = await prisma.community.findUnique({
      where: { slug },
      include: {
        moderators: true,
        _count: {
          select: { members: true },
        },
        members: {
            where: {
                id: userId
            }
        }
      },
    })

    if (!data) return null

    return {
      ...data,
      membersCount: data._count.members,
      member: data.members[0]
    } as Community & { membersCount: number }
  } catch (e: any) {
    console.error("Error fetching community data:", e)
    return null
  }
}

export const handleJoinCommunity = async (communityId: string, userId: string) => {
  try {
    const existing = await prisma.community.findFirst({
      where: {
        id: communityId,
        members: {
          some: { id: userId },
        },
      },
    })

    if (existing) {
      return "Already a member of this community"
    }

    await prisma.community.update({
      where: { id: communityId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
    })

    return "Joined successfully"
  } catch (e) {
    console.error("Error joining the community:", e)
    return "Something went wrong"
  }
}


export const handleLeaveCommunity = async (communityId: string, userId: string) => {
  try {
    const isCreatorOrMod = await prisma.community.findFirst({
      where: {
        id: communityId,
        OR: [
          { creatorId: userId },
          { moderators: { some: { id: userId } } },
        ],
      },
    })

    if (isCreatorOrMod) {
      return "Creator or moderator cannot leave the community, sorry:)"
    }

    await prisma.community.update({
      where: { id: communityId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    })

    return "Left successfully"
  } catch (e) {
    console.error("Error leaving the community:", e)
    return "Something went wrong"
  }
}


