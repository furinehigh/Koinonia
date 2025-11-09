import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { commentId } = await req.json()

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId
            }
        })

        if (!comment) {
            return NextResponse.json({ error: 'comment not found' }, { status: 404 })
        }

        if (comment.userId !== session.user.id){
            return NextResponse.json({error: 'You are not authorized to delete this signal/comment.'})
        }

        const res = await prisma.comment.update({
            where: {
                id: commentId
            },
            data: {
                isDeleted: true
            },
            include: {
                post: {
                    include: {
                        community: true
                    }
                }
            }
        })

        await prisma.recentActivity.create({
            data: {
                userId: session.user.id,
                type: 'comment_deleted',
                title: `Deleted an echo`,
                description: `You've successfully deleted an echo.`,
                slug: `/n/${res.post.community.slug}/comment/${res.post.id}`,
                postId: res.post.id
            }
        })

        return NextResponse.json({ message: 'comment deleted successfully', res }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}