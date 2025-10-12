import { prisma } from "../prisma"

export const getAllSpells = async () => {
  try {
    return await prisma.spell.findMany({ orderBy: { price: "asc" } })
  } catch (e: any) {
    return []
  }
}
