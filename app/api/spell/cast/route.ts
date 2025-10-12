import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const session = await getServerSession(authOptions)
    const { spellType, targetType, targetId } = body
    if (!session || !session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id

    if (!["post", "community"].includes(targetType))
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 })
    if (!["rage", "boost"].includes(spellType))
      return NextResponse.json({ error: "Invalid spell type" }, { status: 400 })

    const spell = await prisma.spell.findFirst({
      where: { name: { equals: spellType, mode: "insensitive" } },
    })
    if (!spell) return NextResponse.json({ error: "Spell not found" }, { status: 404 })

    const target =
      targetType === "post"
        ? await prisma.post.findUnique({ where: { id: targetId } })
        : await prisma.community.findUnique({ where: { id: targetId } })
    if (!target) return NextResponse.json({ error: `${targetType} not found` }, { status: 404 })

    // Apply spell effect
    let effectSummary = ""
    if (spellType === "rage") {
      if (targetType === "post") {
        await prisma.post.update({ where: { id: targetId }, data: { votes: { increment: 5 } } })
        effectSummary = "+5 votes"
      } else {
        await prisma.community.update({ where: { id: targetId }, data: { updatedAt: new Date() } })
        effectSummary = "Community empowered"
      }
    } else if (spellType === "boost") {
      if (targetType === "post") {
        await prisma.post.update({ where: { id: targetId }, data: { views: { increment: 10 } } })
        effectSummary = "+10 views"
      } else {
        await prisma.community.update({ where: { id: targetId }, data: { updatedAt: new Date() } })
        effectSummary = "Community boosted"
      }
    }

    await prisma.mana.update({
      where: { userId },
      data: { mana: { decrement: 5 } },
    })

    await prisma.castSpell.create({
      data: {
        userId,
        spellId: spell.id,
        postId: targetType === "post" ? targetId : null,
        communityId: targetType === "community" ? targetId : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Casted ${spellType} spell on ${targetType} (${effectSummary})`,
      spellUsed: spellType,
      targetType,
      effect: effectSummary,
    })
  } catch (e) {
    console.error("Error casting spell:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
