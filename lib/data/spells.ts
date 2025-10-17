import { prisma } from "../prisma"

export const getAllSpells = async () => {
  try {
    return await prisma.spell.findMany({ orderBy: { price: "asc" } })
  } catch (e: any) {
    return []
  }
}

export const getUserSpellsCount = async (userId: string) => {
  try {
    const counts = await prisma.userSpell.groupBy({
      by: ['spellId'],
      where: { userId },
      _count: { spellId: true },
    })

    const withNames = await Promise.all(
      counts.map(async c => {
        const spell = await prisma.spell.findUnique({
          where: { id: c.spellId },
          select: { name: true },
        })
        return {
          spellId: c.spellId,
          spellName: spell?.name,
          count: c._count.spellId
        }
      })
    )

    return withNames
  } catch (e: any) {
    return e.message
  }
}
