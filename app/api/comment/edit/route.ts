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

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { content, id } = body

        if (!content || !id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const moderation = await prisma.communityMod.findFirst({
            where: {
                community: {
                    posts: {
                        some: {
                            id
                        }
                    }
                }
            }
        })

        let { cleanText, isSpam } = sanitizeContent(content, moderation?.restrictedWords.split(','), moderation?.avoidLinks || false)

        if (isSpam) {
            return NextResponse.json({ error: "The content looks spammy..." }, { status: 400 })
        }

        const res = await prisma.comment.update({
            where: {
                id,
                userId: session.user.id
            },
            data: {
                content: cleanText,
                edited: true,
                editedAt: new Date()
            },
            include: {
                post: {
                    include: {
                        community: true
                    }
                }
            }
        })

        if (res.userId !== session.user.id) {
            return NextResponse.json({ error: 'You are not authorized to edit this signal/post.' }, { status: 400 })
        }

        await prisma.recentActivity.create({
            data: {
                userId: session.user.id,
                type: 'comment_edited',
                title: `Edited an echo`,
                description: `You've successfully edited your echo on post: ${res.post.title}.`,
                slug: `/n/${res.post.community.slug}/post/${res.post.id}`,
                postId: res.post.id
            }
        })

        return NextResponse.json({ message: "Post edited", res }, { status: 200 })
    } catch (err) {
        console.error("POST error:", err)
        return NextResponse.json({ error: "Post edition failed" }, { status: 400 })
    }
}
