import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redisPub } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || !session.user.id)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { content, dmId, to } = await req.json()

        const data = await prisma.messages.create({
            data: {
                content,
                dmId,
                fromUserId: session.user.id,
                status: 'sent'
            }
        })

        await prisma.notification.create({
            data:{
                title: "You've got new messages.",
                content: `Got DMs from user: ${session.user.username}`,
                userId: to,
                contentId: dmId,
                slug: '/dm/' + dmId,
                type: 'new_dms'
            }
        })

        await redisPub.publish('message-created', JSON.stringify({from: data.fromUserId, to, content, status: data.status, createdAt: data.createdAt }))

        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}