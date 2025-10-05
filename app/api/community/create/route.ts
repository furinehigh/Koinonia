import { Community } from "@/types"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json() as Community

    return NextResponse.json({ message: "Request received", data: body }, { status: 200 })
  } catch (err) {
    console.error("POST error:", err)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
