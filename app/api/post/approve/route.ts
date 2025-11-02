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
        const { approve, id } = body

        if (!approve || !id) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400})
        }

        const res = await prisma.post.update({
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
            data: {
                isApproved: approve
            },
            include:{
                community: {
                    include: {
                        moderators: true
                    }
                }
            }
        })

        if (res.community.moderators.some(m => m.id !== session.user.id)){
            return NextResponse.json({error: "You are not a moderator to approve this post"}, {status: 400})
        }

        return NextResponse.json({ message: "Post approved", res }, { status: 200 })
    } catch (err) {
        console.error("POST error:", err)
        return NextResponse.json({ error: "Post approval failed" }, { status: 400 })
    }
}
