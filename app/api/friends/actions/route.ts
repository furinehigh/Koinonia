import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
    const body = await req.json()
    const session = await getServerSession(authOptions)

    const { action, id } = body

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const friendship = await prisma.friends.findUnique({
            where: { id }
        })

        if (!friendship) {
            return NextResponse.json({ error: "Friendship not found" }, { status: 404 })
        }

        switch (action) {
            case "accept":
                await prisma.friends.update({
                    where: { id },
                    data: { status: 'accepted' },
                })
                break

            case "block":
                await prisma.friends.update({
                    where: { id },
                    data: { status: 'blocked' },
                })
                break

            case "undo":
                await prisma.friends.update({
                    where: { id },
                    data: { status: 'accepted' },
                })
                break

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (e) {
        console.error("Error in friendship action:", e)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
