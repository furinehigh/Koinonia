import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const session = await getServerSession(authOptions)
    const { spellName: spellType, targetType, targetId } = body

    if (!session || !session.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id

    if (!["post", "community"].includes(targetType))
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 })

    // find the spell
    const spell = await prisma.spell.findFirst({
      where: { name: { equals: spellType, mode: "insensitive" } },
    })
    if (!spell) return NextResponse.json({ error: "Spell not found" }, { status: 404 })

    // check user spell inventory
    const userSpell = await prisma.userSpell.findFirst({
      where: { userId, spellId: spell.id },
    })
    if (!userSpell || !userSpell.spellId)
      return NextResponse.json({ error: "No remaining uses for this spell" }, { status: 400 })

    // get target
    const target =
      targetType === "post"
        ? await prisma.post.findUnique({ where: { id: targetId } })
        : await prisma.community.findUnique({ where: { id: targetId } })

    if (!target)
      return NextResponse.json({ error: `${targetType} not found` }, { status: 404 })

    let effectSummary = ""

    // spell casting logic
    switch (spellType) {
      case "Rage Spell":
        if (targetType === "post") {
          await prisma.post.update({
            where: { id: targetId },
            data: { votes: { increment: 5 } },
          })
          effectSummary = "+5 votes"
        } else {
          const comm = await prisma.community.findUnique({
            where: { id: targetId },
            select: { members: true },
          })

          // increment mana for all members
          await prisma.mana.updateMany({
            where: {
              userId: { in: comm?.members.map(m => m.id) },
            },
            data: { mana: { increment: 5 } },
          })

          effectSummary = `Community raged (+5 mana to ${comm?.members.length} members)`
        }
        break

      case "Boost Spell":
        if (targetType === "post") {
          await prisma.post.update({
            where: { id: targetId },
            data: { views: { increment: 10 } },
          })
          effectSummary = "+10 views"
        } else {
          await prisma.community.update({
            where: { id: targetId },
            data: { updatedAt: new Date() },
          })
          effectSummary = "Community boosted"
        }
        break

      case "Heal Spell":
        if (targetType === "post") {
          await prisma.post.update({
            where: { id: targetId },
            data: { votes: { increment: 3 } },
          })
          effectSummary = "Post healed (+3 votes)"
        } else {
          const comm = await prisma.community.findUnique({
            where: { id: targetId },
            select: { members: true },
          })

          // increment mana for all members
          await prisma.mana.updateMany({
            where: {
              userId: { in: comm?.members.map(m => m.id) },
            },
            data: { mana: { increment: 2 } },
          })

          effectSummary = `Community healed (+2 mana to ${comm?.members.length} members)`
        }
        break
    }

    // record the cast
    await prisma.castSpell.create({
      data: {
        userId,
        spellId: spell.id,
        postId: targetType === "post" ? targetId : null,
        communityId: targetType === "community" ? targetId : null,
      },
    })

    // reduce spell count instead of draining mana
    const uSpell = await prisma.userSpell.findFirst({
      where: { userId, spellId: spell.id },
    })

    await prisma.userSpell.delete({
      where: {
        id: uSpell?.id
      }
    })

    return NextResponse.json({
      success: true,
      message: `Casted ${spellType} spell on ${targetType} (${effectSummary})`,
      spellUsed: spellType,
      targetType,
      effect: effectSummary
    })
  } catch (e) {
    console.error("Error casting spell:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
