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

    if (!res.ok) {
      return NextResponse.json({ error: 'Error occurred while uploading the image' }, { status: 502 })
    }
    const data = await res.json()

    const modAPISecret = process.env.MOD_API_SECRET

    const modRes = await fetch(`https://api.sightengine.com/1.0/check.json?url=${data.data.url}&models=nudity-2.1,offensive-2.0,text-content,gore-2.0,text,tobacco,self-harm&api_user=31182880&api_secret=${modAPISecret}`)

    const modResData = await modRes.json()

    const isImageSafe = modResData.nudity.none > 0.90 && modResData.offensive.middle_finger < 0.09 && modResData.gore.prob < 0.1 && modResData.tobacco.prob < 0.1 && modResData['self-harm'].prob < 0.1

    if (!isImageSafe) {
      return NextResponse.json({ error: 'Uploaded image was not safe for the community.' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
