import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()

    const file = form.get("image") as File | null
    const name = form.get("name") as string
    const expiration = form.get("expiration")?.toString() ?? "0"

    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

    // re-forward FormData to RapidAPI
    const uploadData = new FormData()
    uploadData.append("image", file)
    uploadData.append("name", name)
    uploadData.append("expiration", expiration)

    const res = await fetch(
      "https://upload-images-hosting-get-url.p.rapidapi.com/upload",
      {
        method: "POST",
        headers: {
          "x-rapidapi-host": "upload-images-hosting-get-url.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        },
        body: uploadData,
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Upload failed" }, { status: 502 })
    }

    const data = await res.json()

    // moderation
    const modRes = await fetch(
      `https://api.sightengine.com/1.0/check.json?url=${data.data.url}&models=nudity-2.1,offensive-2.0,text-content,gore-2.0,text,tobacco,self-harm&api_user=31182880&api_secret=${process.env.MOD_API_SECRET}`
    )

    const modJson = await modRes.json()

    const safe =
      modJson.nudity.none > 0.9 &&
      modJson.offensive.middle_finger < 0.09 &&
      modJson.gore.prob < 0.1 &&
      modJson.tobacco.prob < 0.1 &&
      modJson["self-harm"].prob < 0.1

    if (!safe) {
      return NextResponse.json(
        { error: "Image rejected by moderation." },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
