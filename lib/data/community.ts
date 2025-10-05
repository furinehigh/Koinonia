import { Community } from "@/types"
import { prisma } from "../prisma"

export const communityData = async (slug: string): Promise<Community | null> => {
  try {
    const data = await prisma.community.findUnique({
      where: { slug },
      include: {
        moderators: true,
        _count: {
          select: { members: true },
        },
      },
    })

    if (!data) return null

    return {
      ...data,
      membersCount: data._count.members,
    } as Community & { membersCount: number }
  } catch (e: any) {
    console.error("Error fetching community data:", e)
    return null
  }
}
