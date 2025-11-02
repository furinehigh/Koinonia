import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { postId, content, parentId } = body

        if (!postId || !content) {
            return NextResponse.json({error: 'Missing required fields'}, {status: 400})
        }

        const moderation = await prisma.communityMod.findFirst({
            where: {
                community: {
                    posts: {
                        some: {
                            id: postId
                        }
                    }
                }
            }
        })

        const data = await prisma.comment.create({
            data: {
                content,
                userId: session?.user.id,
                postId,
                parentId,
                isApproved: moderation?.autoApprovalComment
            },
            include: {
                post: {
                    include: {
                        community: true
                    }
                },
                user: true,
                replies: true
            }
        })

        await prisma.recentActivity.create({
            data: {
                userId: session.user.id,
                type: 'comment_created',
                title: parentId ? `Replied to an echo` : `Echoed on ${data.post.title}`,
                description: parentId ? `You've successfully replied to a comment on a post.` : `You've successfully created a new echo on post ${data.post.title}.`,
                slug: `/n/${data.post.community.slug}/post/${data.post.id}`,
                postId: postId
            }
        })

        return NextResponse.json({ message: "Comment created", data }, { status: 200 })
    } catch (err) {
        console.error("POST error:", err)
        return NextResponse.json({ error: "Comment creation failed" }, { status: 400 })
    }
}