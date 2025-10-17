import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { spellId } = await req.json()
    if (!spellId)
      return NextResponse.json({ error: "Invalid spell" }, { status: 400 })

    const spell = await prisma.spell.findUnique({ where: { id: spellId } })
    if (!spell)
      return NextResponse.json({ error: "Spell not found" }, { status: 404 })

    const mana = await prisma.mana.findUnique({
      where: { userId: session.user.id },
    })
    if (!mana || mana.mana < spell.price)
      return NextResponse.json({ error: "Not enough mana" }, { status: 400 })

    await prisma.userSpell.create({
      data: {
        userId: session.user.id,
        spellId: spell.id,
      },
    })

    return NextResponse.json({ success: true, spell })
  } catch (e) {
    console.error("Buy spell error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
