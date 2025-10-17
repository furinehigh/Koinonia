'use client'
import React, { useEffect, useState } from 'react'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { SignalHigh, SignalLow } from 'lucide-react'
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


    let serverAction;

    let delta = 0

    if (current === 'up' && newVote === null) {
      serverAction = 'undo-upvote'
      delta = -1
    } else if (current === 'down' && newVote === null) {
      serverAction = 'undo-downvote'
      delta = +1
    } else if (current === 'up' && newVote === 'down') {
      serverAction = 'up-downvote'
      delta = -2
    } else if (current === 'down' && newVote === 'up') {
      serverAction = 'down-upvote'
      delta = +2
    } else if (current === null && newVote === 'up') {
      serverAction = 'upvote'
      delta = +1
    } else if (current === null && newVote === 'down') {
      serverAction = 'downvote'
      delta = -1
    }


    setLocalPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, votes: p.votes + delta } : p))
    )

    const updatedVotes = { ...userVotes, [postId]: newVote }
    saveVotes(updatedVotes)

    try {

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
        <h1 className='font-semibold text-xl'>All Signals</h1>

        {localPosts.length === 0 && <div>No signals found on Koinonia.</div>}

        {localPosts.map(p => (
          <Card key={p.id} className='rounded shadow-none m-3'>
            <CardHeader>
              <CardTitle>
                <div className='flex justify-between items-center'>
                  <div className='flex flex-col space-y-1'>
                    {p.community && (
                      <Link href={`/n/${p.community.slug}`} className='flex items-center space-x-1'>
                        <span className='text-sm font-medium hover:underline'>n/{p.community.name}</span>
                      </Link>
                    )}
                    <div className='flex items-center space-x-2 relative'>
                      {/* Community avatar behind author */}
                      {p.community && (
                        <div className='absolute -left-2 top-0 h-10 w-10 rounded border overflow-hidden'>
                          <img src={p.community.avatarUrl || 'logo.png'} alt='community' />
                        </div>
                      )}

                      <Link href={'/u/' + p.author.username} className='relative z-10 flex items-center space-x-2 group'>
                        <div className='h-10 w-10 rounded border overflow-hidden'>
                          <img src={p.author.image || 'logo.png'} alt='author' />
                        </div>
                        <div>
                          <div className='font-medium group-hover:underline underline-offset-2'>{p.author.name}</div>
                          <div className='text-xs text-muted-foreground'>
                            {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className='text-gray-500'>
                    {p.votes == 0 ? <div>no signal</div> : p.votes < 0 ? <div>signal fading</div> : (p.votes > 0 && p.votes < 3) ? <SignalLow /> : (p.votes > 2 && p.votes < 6) ? <SignalHigh /> : <Signal />}
                  </div>
                </div>
              </CardTitle>

              <Link href={'/n/' + p.community?.slug + '/post/' + p.id} className='font-semibold text-lg mt-2'>{p.title}</Link>
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

                  <SignalHigh
                    onClick={() => handleVote(p.id, 'upvote')}
                    className={`cursor-pointer border p-0.5 rounded transition duration-200 text-green-600 ${userVotes[p.id] === 'up'
                      ? 'bg-gray-200'
                      : 'hover:bg-gray-200'
                      }`}
                  />

                  <SignalLow
                    onClick={() => handleVote(p.id, 'downvote')}
                    className={`cursor-pointer border p-0.5 rounded transition duration-200 text-red-600 ${userVotes[p.id] === 'down'
                      ? 'bg-gray-200'
                      : 'hover:bg-gray-200'
                      }`}
                  />
                </div>

                <div>
                  <span>{p.views}</span> signal strength
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
