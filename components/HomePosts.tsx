'use client'
import React, { useEffect, useState } from 'react'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Ban, MessageSquare, Signal, SignalHigh, SignalLow } from 'lucide-react'
import { Post } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import SignalConstellation from './SignalConstellation'
import { Button } from './ui/button'
import UserPopup from './user/UserPopup'

function HomePosts({ posts }: { posts: Post[] }) {
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({})
  const [localPosts, setLocalPosts] = useState(posts)
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards')

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
      <div className='flex justify-between '>
        <h1 className='font-semibold text-xl'>All Signals</h1>
        {/* <Button className='mr-2' variant={'outline'} onClick={() => {
          if (viewMode == 'cards') setViewMode('grid')
          else setViewMode('cards')
        }}>{viewMode == 'cards' ? 'Space' : 'Cards'}</Button> */}
      </div>
      {viewMode == 'grid' ? <SignalConstellation posts={posts} />
        : (
          <div className='my-5'>


            {localPosts.length === 0 && <div>No signals found on Koinonia.</div>}

            {localPosts.map(p => (
              <Card
                key={p.id}
                className="border border-neutral-300 bg-white rounded-none p-0 transition-all hover:border-neutral-600"
              >
                <CardHeader className="border-b border-neutral-200 px-4 py-3">
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-1">
                      {p.community && (
                        <Link
                          href={`/n/${p.community.slug}`}
                          className="text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-800"
                        >
                          n/{p.community.name}
                        </Link>
                      )}

                      <div className="flex items-center gap-2">
                        <UserPopup user={p.isDeleted ? {} : p.author}>
                          <Link
                            href={p.isDeleted ? '#' : '/u/' + p.author.username}
                            className="group flex items-center gap-2"
                          >
                            <img
                              src={p.author.image || "logo.png"}
                              className="h-8 w-8 border border-neutral-300 object-cover"
                            />

                            <span className="text-sm font-medium group-hover:underline">
                              {p.author.name}
                            </span>
                          </Link>
                        </UserPopup>

                        <span className="text-xs opacity-50">
                          {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="text-neutral-600">
                      {p.votes == 0 ? "—" :
                        p.votes < 0 ? "↓ weak" :
                          p.votes < 3 ? "↗ stable" :
                            p.votes < 6 ? "↑ strong" : "⬆︎ signal"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 py-4">
                  <Link
                    href={`/n/${p.community?.slug}/post/${p.id}`}
                    className="font-semibold tracking-tight text-lg hover:opacity-80"
                  >
                    {p.title}
                  </Link>

                  <p className="text-sm text-neutral-600 mt-1">
                    {p.content}
                  </p>

                  {p.imageUrl && !p.isDeleted && (
                    <Link href={`/n/${p.community?.slug}/post/${p.id}`}>
                      <img
                        src={p.imageUrl}
                        className="mt-3 border border-neutral-300 max-h-[40vh] object-cover"
                      />
                    </Link>
                  )}
                </CardContent>

                <CardFooter className="border-t border-neutral-200 px-4 py-3 text-xs flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{p.votes}</span>

                    <SignalHigh
                      onClick={() => !p.isDeleted && handleVote(p.id, 'upvote')}
                      className={`cursor-pointer h-5 w-5 p-0.5 border border-neutral-300 hover:border-neutral-800 transition 
          ${userVotes[p.id] === 'up' ? 'bg-neutral-200' : ''}`}
                    />

                    <SignalLow
                      onClick={() => !p.isDeleted && handleVote(p.id, 'downvote')}
                      className={`cursor-pointer h-5 w-5 p-0.5 border border-neutral-300 hover:border-neutral-800 transition
          ${userVotes[p.id] === 'down' ? 'bg-neutral-200' : ''}`}
                    />
                  </div>

                  <div className="opacity-60">{p.views} viewed</div>

                  <div className="flex gap-1 items-center opacity-60">
                    <MessageSquare size={14} />
                    {p._count.comments}
                  </div>
                </CardFooter>
              </Card>

            ))}
          </div>
        )}

    </div>
  )
}

export default HomePosts
