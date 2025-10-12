import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const session = await getServerSession(authOptions)

    const { spellType, targetType, targetId } = body
    // spellType: "rage" | "boost"
    // targetType: "post" | "community"

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Validate target type
    if (!["post", "community"].includes(targetType))
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 })

    // Validate spell type
    if (!["rage", "boost"].includes(spellType))
      return NextResponse.json({ error: "Invalid spell type" }, { status: 400 })

    const userSpells = await prisma.userSpells.findUnique({
      where: { userId },
    })

    if (!userSpells) {
      return NextResponse.json({ error: "User has no spells" }, { status: 400 })
    }

    // Check available spells
    if (spellType === "rage" && userSpells.rageSpell <= 0)
      return NextResponse.json({ error: "No Rage spells left" }, { status: 400 })
    if (spellType === "boost" && userSpells.boostSpell <= 0)
      return NextResponse.json({ error: "No Boost spells left" }, { status: 400 })

    // Find the target entity
    const target =
      targetType === "post"
        ? await prisma.post.findUnique({ where: { id: targetId } })
        : await prisma.community.findUnique({ where: { id: targetId } })

    if (!target) {
      return NextResponse.json({ error: `${targetType} not found` }, { status: 404 })
    }

    // Apply spell effect
    let effectSummary = ""
    switch (spellType) {
      case "rage":
        if (targetType === "post") {
          await prisma.post.update({
            where: { id: targetId },
            data: { votes: { increment: 5 } },
          })
          effectSummary = "+5 votes"
        } else {
          await prisma.community.update({
            where: { id: targetId },
            data: { updatedAt: new Date() },
          })
          effectSummary = "Community empowered"
        }
        break

      case "boost":
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
    }

    // Deduct spell
    await prisma.userSpells.update({
      where: { userId },
      data:
        spellType === "rage"
          ? { rageSpell: { decrement: 1 } }
          : { boostSpell: { decrement: 1 } },
    })

    // Optional: cost or mana reward logic
    await prisma.mana.update({
      where: { userId },
      data: { mana: { decrement: 5 } }, // casting costs 5 mana
    })

    // Get Spell record (for logging)
    const spell = await prisma.spell.findFirst({
      where: { name: { equals: spellType, mode: "insensitive" } },
    })

    // Log the cast
    await prisma.castSpell.create({
      data: {
        userId,
        spellId: spell?.id ?? "unknown",
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
