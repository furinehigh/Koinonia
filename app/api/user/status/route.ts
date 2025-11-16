import { authOptions } from "@/lib/auth";
import { redisPub } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { status } = await req.json()

        await redisPub.publish("user_status", JSON.stringify({ userId: session.user.id, status }))

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}