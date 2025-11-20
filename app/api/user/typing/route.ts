import { redisPub } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
    try {
        const { typing, dmId, userId } = await req.json()

        await redisPub.publish("user-typing", JSON.stringify({ userId, typing, dmId }))

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}