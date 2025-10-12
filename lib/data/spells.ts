import { prisma } from "../prisma"

export const getAllSpells = async () => {
    try {
        const spells = await prisma.spell.findMany({

        })
        return spells
    } catch (e: any) {
        return e.message
    }
}