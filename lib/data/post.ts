import { Post } from "@/types"
import { prisma } from "../prisma"

export const getAllPosts = async (slug: string, userId: string) => {
  try {
    const data = await prisma.post.findMany({
      where: {
        community: { slug },
        isRemoved: false,
        OR: [
          { isApproved: true },
          {
            AND: [
              { isApproved: false },
              {
                OR: [
                  { authorId: userId },
                  {
                    community: {
                      moderators: {
                        some: {
                          id: userId
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      include: {
        author: true,
        community: true,
        _count: {
          select: {
            comments: {
              where: {
                isApproved: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })


    return data
  } catch (e) {
    console.error("Error fetching community posts:", e)
    return []
  }
}


export const recentPosts = async () => {
  try {
    const data = await prisma.post.findMany({
      where: {
        isRemoved: false,
        isApproved: true
      },
      include: {
        author: true,
        community: true,
        _count: {
          select: {
            comments: {
              where: {
                isApproved: true,
              }
            }
          }
        }
      },
      orderBy: [
        { votes: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return data
  } catch (e) {
    console.error("Error fetching community posts:", e)
    return []
  }
}

export const getPost = async (id: string, userId: string) => {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id,
        OR: [
          { isApproved: true },
          {
            AND: [
              { isApproved: false },
              {
                OR: [
                  { authorId: userId },
                  {
                    community: {
                      moderators: {
                        some: {
                          id: userId
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      include: {
        author: true,
        community: true,
        _count: {
          select: {
            comments: {
              where: {
                isApproved: true,
              }
            }
          }
        }
      }
    })
    return post
  } catch (e: any) {
    return e.message
  }
}