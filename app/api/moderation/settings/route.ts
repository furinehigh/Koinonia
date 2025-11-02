import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { id, ...data } = body

        if (!data) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const res = await prisma.communityMod.update({
            where: {
                id,
                community: {
                    moderators: {
                        some: {
                            id: session.user.id
                        }
                    }
                }
            },
            data,
            include: {
                community: true
            }
        })

        await prisma.recentActivity.create({
            data: {
                userId: session.user.id,
                type: 'comm_moderator_updated',
                title: `Updated for: ${res.community.name}`,
                description: `You've successfully updated the moderations settings.`,
                slug: `/n/${res.community.slug}`,
                communityId: res.community.id
            }
        })

        return NextResponse.json({ message: "Post edited", res }, { status: 200 })
    } catch (err) {
        console.error("POST error:", err)
        return NextResponse.json({ error: "Post edition failed" }, { status: 400 })
    }
}
