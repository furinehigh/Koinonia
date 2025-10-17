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
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

function PostPage({ post }: {
    post: Post
}) {
    const [userVotes, setUserVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({})
    const [localPost, setLocalPost] = useState(post)


    const increaseViews = async () => {
        try {
            const alreadyViewed = localStorage.getItem('alreadyViewed')
            if (alreadyViewed == 'true') {
                return;
            }
            await fetch('/api/post/actions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: post.id, action: 'views' }),
            })
            localStorage.setItem('alreadyViewed', 'true')
        } catch (e) {
            console.error('vote error', e)
        }
    }


    useEffect(() => {
        const saved = localStorage.getItem('userVotes')
        increaseViews()
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

        setLocalPost(prev => ({
            ...prev,
            votes: prev.votes + delta
        }))


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

            <Card key={localPost.id} className='rounded shadow-none m-3'>
                <CardHeader>
                    <CardTitle>
                        <div className='flex justify-between'>
                            <Link href={'/u/' + localPost.author.username} className='flex items-center space-x-2 group'>
                                <div className='h-10 w-10 rounded border overflow-hidden'>
                                    <img src={localPost.author.image || 'logo.png'} alt='user' />
                                </div>
                                <div>
                                    <div className='font-semibold group-hover:underline underline-offset-2'>{localPost.author.name}</div>
                                    <div className='text-xs text-muted-foreground'>
                                        {formatDistanceToNow(new Date(localPost.createdAt), { addSuffix: true })}
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
                                            {localPost.votes == 0 ? <div>no signal</div> : localPost.votes < 0 ? <div>signal fading</div> : (localPost.votes > 0 && localPost.votes < 3) ? <SignalLow /> : (localPost.votes > 2 && localPost.votes < 6) ? <SignalHigh /> : <Signal />}
                                        </div>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Choose a spell</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => castSpell(localPost.id, 'Rage Spell')}>Rage Spell</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => castSpell(localPost.id, 'Heal Spell')}>Heal Spell</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardTitle>
                    <h1 className='font-semibold'>{localPost.title}</h1>
                    <CardDescription>{localPost.content}</CardDescription>
                </CardHeader>

                <CardContent>
                    {localPost.imageUrl && (
                        <div className='border rounded h-fit w-fit overflow-hidden'>
                            <img src={localPost.imageUrl} alt='post' />
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <div className='flex justify-between w-full'>
                        <div className='flex items-center space-x-1'>
                            <span>{localPost.votes}</span>

                            <SignalHigh
                                onClick={() => handleVote(localPost.id, 'upvote')}
                                className={`cursor-pointer border p-0.5 rounded transition duration-200 text-green-600 ${userVotes[localPost.id] === 'up'
                                    ? 'bg-gray-200'
                                    : 'hover:bg-gray-200'
                                    }`}
                            />

                            <SignalLow
                                onClick={() => handleVote(localPost.id, 'downvote')}
                                className={`cursor-pointer border p-0.5 rounded transition duration-200 text-red-600 ${userVotes[localPost.id] === 'down'
                                    ? 'bg-gray-200'
                                    : 'hover:bg-gray-200'
                                    }`}
                            />
                        </div>

                        <div>
                            <span>{localPost.views}</span> signal strength
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <div className='mt-6 w-full' >
                <div key={localPost.id + 'comments'} className='rounded shadow-none m-3 flex p-2 gap-2 flex-col'>
                    <div className=''>
                        <h1 className='font-semibold '>Create Echoes</h1>
                    </div>
                    <div className='flex space-x-2 items-end justify-between'>
                        <Textarea />
                        <Button>
                            Create
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostPage
