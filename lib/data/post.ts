import { Post } from "@/types"
import { prisma } from "../prisma"

export const getAllPosts = async (slug: string) => {
  try {
    const data = await prisma.post.findMany({
      where: { 
        community: { slug }
      },
      include: {
        author: true,
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
      include: {
        author: true,
        community: true
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
