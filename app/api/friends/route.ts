import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { receiverId } = await req.json()

        const alreadyExists = await prisma.friends.findFirst({
            where: {
                receiverId,
                requesterId: session.user.id
            }
        })

        if (alreadyExists) {
            return NextResponse.json({ error: 'Friend request already sent.' }, { status: 400 })
        }

        await prisma.friends.create({
            data: {
                receiverId,
                requesterId: session.user.id
            }
        })

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}