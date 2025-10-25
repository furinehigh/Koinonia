import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  const body = await req.json()
  const session = await getServerSession(authOptions)

  const { action, commentId } = body

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    const authorId = comment.userId

    let updatedComment
    let manaChange = 0

    switch (action) {
      case "upvote":
        updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: { votes: { increment: 1 } },
        })
        manaChange = 1
        break

      case "downvote":
        updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: { votes: { decrement: 1 } },
        })
        manaChange = -1
        break

      case "undo-upvote":
        updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: { votes: { decrement: 1 } },
        })
        manaChange = -1
        break

      case "undo-downvote":
        updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: { votes: { increment: 1 } },
        })
        manaChange = 1
        break
      case "down-upvote":
        updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: { votes: { increment: 2 } },
        })
        manaChange = 2
        break
      case "up-downvote":
        updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: { votes: { decrement: 2 } },
        })
        manaChange = -2
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

    return NextResponse.json(updatedComment)
  } catch (e) {
    console.error("Error in comment action:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
