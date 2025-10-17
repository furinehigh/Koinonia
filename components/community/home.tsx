'use client'
import React, { useEffect, useState } from 'react'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Signal, SignalHigh, SignalLow, SignalZero, Sparkles } from 'lucide-react'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import '@/styles/flamebutton.scss'

function CommHome({ posts }: { posts: Post[] }) {
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
      current === (isUp ? 'up' : 'down')
        ? null
        : isUp
          ? 'up'
          : 'down'
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

  const castSpell = async (postId: string, spellName: string) => {
    try {
      const res = await fetch('/api/spell/cast', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'post',
          targetId: postId,
          spellName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      console.log('✨ Post spell success:', data)
    } catch (err: any) {
      console.error('Post spell error:', err.message)
    }
  }

  return (
    <div className='flex flex-col'>
      <div className='my-5'>
        <h1 className='font-semibold'>Announcements</h1>
        <Card className='rounded shadow-none w-xs m-3'>
          <CardHeader>
            <CardTitle>Welcome!!</CardTitle>
            <CardDescription>
              We are very happy to see you here in this network, start new posts and keep earning Mana and trust.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className='my-5'>
        <h1 className='font-semibold'>Signals</h1>

        {localPosts.length === 0 && <div>No signals found in this network.</div>}

        {localPosts.map(p => (
          <Card key={p.id} className='rounded shadow-none m-3'>
            <CardHeader>
              <CardTitle>
                <div className='flex justify-between'>
                  <Link href={'/u/' + p.author.username} className='flex items-center space-x-2 group'>
                    <div className='h-10 w-10 rounded border overflow-hidden'>
                      <img src={p.author.image || 'logo.png'} alt='user' />
                    </div>
                    <div>
                      <div className='font-semibold group-hover:underline underline-offset-2'>{p.author.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger className='cursor-pointer'>
                      <div className='flex space-x-2'>
                        <Button variant='outline' size='sm' className='flame-button'>
                          <Sparkles className='h-4 w-4 mr-1' /> Cast Spell
                        </Button>
                        <div className='text-gray-500'>
                          {p.votes == 0 ? <div>no signal</div> : p.votes < 0 ? <div>signal fading</div> : (p.votes > 0 && p.votes < 3) ? <SignalLow /> : (p.votes > 2 && p.votes < 6) ? <SignalHigh /> : <Signal />}
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Choose a spell</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => castSpell(p.id, 'rage')}>Rage Spell</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => castSpell(p.id, 'heal')}>Heal Spell</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardTitle>
              <Link href={'/n/' + p.community?.slug + '/post/' + p.id} className='font-semibold'>{p.title}</Link>
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

export default CommHome
