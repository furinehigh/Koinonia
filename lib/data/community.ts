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


export const rankAllCommunities = async (crrPage = 1, limit = 10) => {
  try {
    const skip = (crrPage - 1) * limit

    // count total communities for pagination
    const totalCommunities = await prisma.community.count()

    // rank communities
    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
        creator: true
      },
      orderBy: [
        { members: { _count: 'desc' } },
        { posts: { _count: 'desc' } },
      ],
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(totalCommunities / limit)

    return { totalPages, communities }
  } catch (e: any) {
    console.error("Error ranking communities:", e)
    return { totalPages: 0, communities: [] }
  }
}


export const getRecentCommunities = async (userId: string, limit = 10) => {
  try {
    if (!userId){
      return []
    }
    const activities = await prisma.recentActivity.findMany({
      where: {
        userId,
        communityId: { not: '' }
      },
      include: {
        community: true
      },
      distinct: ['communityId'],
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return activities.map(a => a.community).filter(Boolean)
  } catch (error) {
    console.error('⚠️ Failed to fetch recent communities:', error)
    throw new Error('Could not fetch recent communities.')
  }
}
