import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, slug, bannerUrl, avatarUrl } = body

    const data = await prisma.community.create({
      data: {
        name,
        description,
        slug,
        creator: { connect: { id: session.user.id } },
        members: { connect: [{ id: session.user.id }] },
        moderators: { connect: [{ id: session.user.id }] },
        bannerUrl,
        avatarUrl,
      },
    })

    await prisma.recentActivity.create({
      data: {
        userId: session.user.id,
        type: 'community_created',
        title: `Created ${name}`,
        description: `You've successfully created a new network called ${name}.`,
        slug: `/n/${slug}`,
        communityId: data.id
      }
    })

    await prisma.communityMod.create({
      data: {
        communityId: data.id
      }
    })

    return NextResponse.json({ message: "Community created", data }, { status: 200 })
  } catch (err: any) {
    console.error("POST error:", err)
    return NextResponse.json({ error: "Community creation failed", description: err.message }, { status: 400 })
  }
}