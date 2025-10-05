import { Community } from "@/types"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json() as Community

    const data = await prisma.community.create({
      data: body
    })

    return NextResponse.json({ message: "Community created", data }, { status: 200 })
  } catch (err) {
    console.error("POST error:", err)
    return NextResponse.json({ error: "Community creation failed" }, { status: 400 })
  }
}
