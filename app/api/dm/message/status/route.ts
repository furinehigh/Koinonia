import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redisPub } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
    try {
        const { messageId, status, dmId } = await req.json()

        await redisPub.publish("message_status", JSON.stringify({ messageId, status, dmId, readAt: status === 'read' ? new Date : null }))

        if (status == 'delivered' || status == 'read') {
            await prisma.messages.update({
                where: {
                    id: messageId
                },
                data: {
                    status,
                    readAt: status === 'read' ? new Date : null
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}