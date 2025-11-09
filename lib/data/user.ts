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

export const getRecentPosts = async (username: string, limit = 10) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        author: {
          username,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        community: true
      },
    })
    return posts
  } catch (e: any) {
    console.error("Error fetching posts:", e)
    return []
  }
}

export const getUserActivities = async (userId: string) => {
    try {
        const data = await prisma.recentActivity.findMany({
            where: {
                userId
            },
            include: {
                post: {
                    include: {
                        author: true
                    }
                },
                community: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return data
    } catch (e: any) {
        return e.message
    }
}

export const getUserNotifications = async (userId: string) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId
            }
        })
        return notifications
    } catch (e: any) {
        return []
    }
}