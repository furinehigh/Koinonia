import { Community } from "@/types"
import { prisma } from "../prisma"

export const communityData = async (slug: string): Promise<Community | null> => {
    try {
        const data = await prisma.community.findFirst({
            where: {
                slug
            }
        })

        return data
    } catch (e: any) {
        return e.message
    }
}