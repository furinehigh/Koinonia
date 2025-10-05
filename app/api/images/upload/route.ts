import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { image, name, expiration = "0" } = await req.json()

    // Create FormData
    const formData = new FormData()
    formData.append("image", image) // base64 string
    formData.append("name", name)
    formData.append("expiration", expiration.toString())

    const res = await fetch(
      "https://upload-images-hosting-get-url.p.rapidapi.com/upload",
      {
        method: "POST",
        headers: {
          "x-rapidapi-host":
            "upload-images-hosting-get-url.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          // Do NOT set Content-Type manually, fetch will set it for FormData
        },
        body: formData,
      }
    )

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
