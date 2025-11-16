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

        const { friendshipId } = await req.json()

        const friends = await prisma.friends.findUnique({
            where: {
                id: friendshipId
            }
        })

        if (!friends) {
            return NextResponse.json({ error: "Friendship with this id doesn't exists" }, { status: 400 })
        }

        const alreadyExists = await prisma.dM.findUnique({
            where: {
                friendshipId
            }
        })

        if (alreadyExists){
            return NextResponse.json({message: 'DM for this friendship already exists...', data: alreadyExists})
        }

        const data = await prisma.dM.create({
            data: {
                friendshipId
            }
        })

        return NextResponse.json({ success: true, data }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}