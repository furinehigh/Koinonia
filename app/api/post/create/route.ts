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
    const { title, content, imageUrl, slug } = body

    const community = await prisma.community.findUnique({
      where: {
        slug
      }
    })

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    const res = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        communityId: community.id,
        authorId: session.user.id
      }
    })

    await prisma.recentActivity.create({
      data: {
        userId: session.user.id,
        type: 'post_created',
        title: `Created: ${title}`,
        description: `You've successfully created a new signal.`,
        slug: `/n/${slug}/post/${res.id}`,
        postId: res.id
      }
    })

    return NextResponse.json({ message: "Post created", res }, { status: 200 })
  } catch (err) {
    console.error("POST error:", err)
    return NextResponse.json({ error: "Post creation failed" }, { status: 400 })
  }
}
