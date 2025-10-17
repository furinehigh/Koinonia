import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  const body = await req.json()
  const session = await getServerSession(authOptions)

  const { action, postId } = body

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const authorId = post.author.id

    let updatedPost
    let manaChange = 0

    switch (action) {
      case "upvote":
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { votes: { increment: 1 } },
        })
        manaChange = 1
        break

      case "downvote":
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { votes: { decrement: 1 } },
        })
        manaChange = -1
        break

      case "undo-upvote":
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { votes: { decrement: 1 } },
        })
        manaChange = -1
        break

      case "undo-downvote":
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { votes: { increment: 1 } },
        })
        manaChange = 1
        break
      case "down-upvote":
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { votes: { increment: 2 } },
        })
        manaChange = 2
        break
      case "up-downvote":
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { votes: { decrement: 2 } },
        })
        manaChange = -2
        break

      case "views":
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { views: { increment: 1 } },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Only adjust coins if action affects votes
    if (manaChange !== 0) {
      await prisma.mana.update({
        where: { userId: authorId },
        data: { mana: { increment: manaChange } },
      })
    }

    return NextResponse.json(updatedPost)
  } catch (e) {
    console.error("Error in post action:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
