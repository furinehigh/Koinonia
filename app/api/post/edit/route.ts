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
        const { title, content, id } = body

        if (!title || !content || !id) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400})
        }

        const res = await prisma.post.update({
            where: {
                id
            },
            data: {
                title,
                content,
                edited: true,
                editedAt: new Date()
            },
            include: {
                community: true
            }
        })

        await prisma.recentActivity.create({
            data: {
                userId: session.user.id,
                type: 'post_edited',
                title: `Edited: ${title}`,
                description: `You've successfully edited your signal.`,
                slug: `/n/${res.community.slug}/post/${res.id}`,
                postId: res.id
            }
        })

        return NextResponse.json({ message: "Post edited", res }, { status: 200 })
    } catch (err) {
        console.error("POST error:", err)
        return NextResponse.json({ error: "Post edition failed" }, { status: 400 })
    }
}
