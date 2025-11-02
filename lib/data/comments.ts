import { prisma } from "../prisma"

export const getAllPostComments = async (postId: string) => {
  try {
    const all = await prisma.comment.findMany({
      where: {
        postId
      },
      include: {
        user: true
      },
      orderBy: [
        { votes: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    const map = new Map<string, any>()
    all.forEach(c => map.set(c.id, { ...c, replies: [] }))

    const roots: any[] = []
    map.forEach(c => {
      if (c.parentId) {
        map.get(c.parentId)?.replies.push(c)
      } else {
        roots.push(c)
      }
    })


    return roots
  } catch (e: any) {
    console.error(e)
    return []
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

export const getModSettings = async (slug: string, modId: string) => {
  try {
    const settings = await prisma.communityMod.findFirst({
      where: {
        community: {
          slug,
          moderators: {
            some: {
              id: modId
            }
          }
        }
      }
    })
    return settings
  } catch (e: any) {
    return {}
  }
}