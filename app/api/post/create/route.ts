import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export function sanitizeContent(
  text: string,
  restrictedWords: string[] = [],
  avoidLinks: boolean,

): { cleanText: string; isSpam: boolean } {
  let cleanText = text;

  // Remove links (URLs)
  if (avoidLinks) {
    cleanText = cleanText.replace(
      /(https?:\/\/[^\s]+)/g,
      '[link removed]'
    );
  }

  // Replace restricted words with asterisks
  restrictedWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanText = cleanText.replace(regex, '*'.repeat(word.length));
  });

  // Basic spam detection (repeated characters or words)
  const isSpam =
    /(.)\1{5,}/.test(text) || // Repeated characters like "!!!!!!" or "aaaaaa"
    /\b(\w+)\s+\1\b/i.test(text); // Repeated words like "hello hello"

  return { cleanText, isSpam };
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, content, imageUrl, slug } = body

    if (!title || !content || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 401 })
    }

    const community = await prisma.community.findUnique({
      where: {
        slug
      }
    })

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    const moderation = await prisma.communityMod.findFirst({
      where: {
        communityId: community.id
      }
    })

    let { cleanText, isSpam } = sanitizeContent(content, moderation?.restrictedWords.split(','), moderation?.avoidLinks || false)

    let { cleanText: cleanTitle, isSpam: spamyTitle } = sanitizeContent(title, moderation?.restrictedWords.split(','), moderation?.avoidLinks || false)

    const res = await prisma.post.create({
      data: {
        title: cleanTitle,
        content: cleanText,
        imageUrl,
        communityId: community.id,
        authorId: session.user.id,
        isApproved: moderation?.autoApprovalPost,
        isRemoved: moderation?.contentModeration ? isSpam || spamyTitle : false
      }
    })

    await prisma.recentActivity.create({
      data: {
        userId: session.user.id,
        type: 'post_created',
        title: `Created: ${cleanTitle}`,
        description: `You've successfully created a new signal.`,
        slug: `/n/${slug}/post/${res.id}`,
        postId: res.id
      }
    })

    return NextResponse.json({ message: "Post created", res }, { status: 200 })
  } catch (err) {
    console.error("POST error:", err)
    return NextResponse.json({ error: "Post creation failed" }, { status: 400 })
  }
}
