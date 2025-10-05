'use client'
import React, { useEffect, useState } from 'react'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { Post } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

function HomePosts({ posts }: { posts: Post[] }) {
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({})
  const [localPosts, setLocalPosts] = useState(posts)

  useEffect(() => {
    const saved = localStorage.getItem('userVotes')
    if (saved) setUserVotes(JSON.parse(saved))
  }, [])

  const saveVotes = (votes: typeof userVotes) => {
    setUserVotes(votes)
    localStorage.setItem('userVotes', JSON.stringify(votes))
  }

  const handleVote = async (postId: string, action: 'upvote' | 'downvote') => {
    const isUp = action === 'upvote'
    const current = userVotes[postId] ?? null
    const newVote =
      current === (isUp ? 'up' : 'down') ? null : isUp ? 'up' : 'down'

    const delta =
      current === 'up' && newVote === null ? -1 :
        current === 'down' && newVote === null ? +1 :
          current === 'up' && newVote === 'down' ? -2 :
            current === 'down' && newVote === 'up' ? +2 :
              current === null && newVote === 'up' ? +1 :
                current === null && newVote === 'down' ? -1 :
                  0

    setLocalPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, votes: p.votes + delta } : p)
    )

    const updatedVotes = { ...userVotes, [postId]: newVote }
    saveVotes(updatedVotes)

    try {
      const serverAction = newVote
        ? action
        : current === 'up'
          ? 'undo-upvote'
          : 'undo-downvote'

      await fetch('/api/post/actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: serverAction }),
      })
    } catch (e) {
      console.error('vote error', e)
    }
  }

  return (
    <div className='flex flex-col'>
      <div className='my-5'>
        <h1 className='font-semibold text-xl'>All Posts</h1>

        {localPosts.length === 0 && <div>No posts found on Koinonia.</div>}

        {localPosts.map(p => (
          <Card key={p.id} className='rounded shadow-none m-3'>
            <CardHeader>
              <CardTitle>
                <div className='flex justify-between items-center'>
                  <div className='flex flex-col space-y-1'>
                    {p.community && (
                      <Link href={`/c/${p.community.slug}`} className='flex items-center space-x-1'>
                        <span className='text-sm font-medium hover:underline'>c/{p.community.name}</span>
                      </Link>
                    )}
                    <div className='flex items-center space-x-2 relative'>
                      {/* Community avatar behind author */}
                      {p.community && (
                        <div className='absolute -left-2 top-0 h-10 w-10 rounded border overflow-hidden'>
                          <img src={p.community.avatarUrl || 'logo.png'} alt='community' />
                        </div>
                      )}

                      <div className='relative z-10 flex items-center space-x-2'>
                        <div className='h-10 w-10 rounded border overflow-hidden'>
                          <img src={p.author.image || 'logo.png'} alt='author' />
                        </div>
                        <div>
                          <div className='font-medium'>{p.author.name}</div>
                          <div className='text-xs text-muted-foreground'>
                            {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardTitle>

              <h1 className='font-semibold text-lg mt-2'>{p.title}</h1>
              <CardDescription>{p.content}</CardDescription>
            </CardHeader>

            <CardContent>
              {p.imageUrl && (
                <div className='border rounded h-fit w-fit overflow-hidden'>
                  <img src={p.imageUrl} alt='post' />
                </div>
              )}
            </CardContent>

            <CardFooter>
              <div className='flex justify-between w-full'>
                <div className='flex items-center space-x-1'>
                  <span>{p.votes}</span>

                  <ArrowBigUp
                    onClick={() => handleVote(p.id, 'upvote')}
                    className={`cursor-pointer transition duration-200 text-green-600 ${userVotes[p.id] === 'up' ? 'fill-green-600' : 'hover:fill-green-600'}`}
                  />
                  <ArrowBigDown
                    onClick={() => handleVote(p.id, 'downvote')}
                    className={`cursor-pointer transition duration-200 text-red-600 ${userVotes[p.id] === 'down' ? 'fill-red-600' : 'hover:fill-red-600'}`}
                  />
                </div>

                <div>
                  <span>{p.views}</span> views
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default HomePosts
