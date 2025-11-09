import { authOptions } from "@/lib/auth";
import { getUserNotifications } from "@/lib/data/user";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { action, contentId, notificationId } = await req.json()

        await prisma.comment.update({
            where: {
                id: contentId
            },
            data: {
                isApproved: action == 'approve',
                isRemoved: action == 'reject'
            }
        })

        await prisma.notification.delete({
            where: {
                id: notificationId
            }
        })

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}