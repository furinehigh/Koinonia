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
        const { postId, content, parentId } = body

        if (!postId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const moderation = await prisma.communityMod.findFirst({
            where: {
                community: {
                    posts: {
                        some: {
                            id: postId
                        }
                    }
                }
            },
        })

        let { cleanText, isSpam } = sanitizeContent(content, moderation?.restrictedWords.split(','), moderation?.avoidLinks || false)

        const data = await prisma.comment.create({
            data: {
                content: cleanText,
                userId: session?.user.id,
                postId,
                parentId,
                isApproved: moderation?.autoApprovalComment,
                isRemoved: isSpam
            },
            include: {
                post: {
                    include: {
                        community: {
                            include: {
                                moderators: true
                            }
                        }
                    }
                },
                user: true,
                replies: true
            }
        })

        if (!moderation?.autoApprovalComment) {
            data.post.community.moderators.forEach(async (m) => (
                await prisma.notification.create({
                    data: {
                        userId: m.id,
                        title: `New ${parentId ? 'reply on a comment' : 'comment'} in ${data.post.community.name} awaiting your review`,
                        content: parentId ? 'Reply: ' + content : 'Comment: ' + content,
                        contentId: data.id,
                        type: 'comment_review',
                        slug: `/n/${data.post.community.slug}/post/${data.post.id}`,
                    }
                })
            ))
        }

        await prisma.recentActivity.create({
            data: {
                userId: session.user.id,
                type: 'comment_created',
                title: parentId ? `Replied to an echo` : `Echoed on ${data.post.title}`,
                description: parentId ? `You've successfully replied to a comment on a post.` : `You've successfully created a new echo on post ${data.post.title}.`,
                slug: `/n/${data.post.community.slug}/post/${data.post.id}`,
                postId: postId
            }
        })

        return NextResponse.json({ message: "Comment created", data }, { status: 200 })
    } catch (err) {
        console.error("POST error:", err)
        return NextResponse.json({ error: "Comment creation failed" }, { status: 400 })
    }
}