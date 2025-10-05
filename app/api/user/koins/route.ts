import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserKoins } from "@/lib/data/user"

export async function GET() {
  const session = await getServerSession(authOptions)

  const data = await getUserKoins(session?.user.id)


  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const updated = await prisma.koin.update({
    where: { userId: session.user.id },
    data: body,
  })

  return NextResponse.json(updated)
}
