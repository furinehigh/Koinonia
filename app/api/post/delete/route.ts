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

        const { postId } = await req.json()

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        if (post.authorId !== session.user.id){
            return NextResponse.json({error: 'You are not authorized to delete this signal/post.'})
        }

        const res = await prisma.post.update({
            where: {
                id: postId
            },
            data: {
                isDeleted: true
            },
            include: {
                community: true
            }
        })

        await prisma.recentActivity.create({
            data: {
                userId: session.user.id,
                type: 'post_deleted',
                title: `Deleted a signal`,
                description: `You've successfully deleted a signal.`,
                slug: `/n/${res.community.slug}/post/${res.id}`,
                postId: res.id
            }
        })

        return NextResponse.json({ message: 'Post deleted successfully', res }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}