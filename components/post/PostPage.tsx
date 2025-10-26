'use client'
import React, { useEffect, useState } from 'react'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Ban, Check, Copy, Loader2, MoreHorizontalIcon, MoreVerticalIcon, Signal, SignalHigh, SignalLow, SignalZero, Sparkles } from 'lucide-react'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import '@/styles/flamebutton.scss'
import { Textarea } from '../ui/textarea'
import Loader from '../Loader'
import { toast } from 'sonner'
import Comments from './Comments'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from '../ui/input'
import { Label } from '../ui/label'

function PostPage({ post, comments }: {
    post: Post,
    comments: any[]
}) {
    const [userVotes, setUserVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({})
    const [localPost, setLocalPost] = useState(post)
    const [loading, setLoading] = useState(true)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [editPost, setEditPost] = useState(post)
    const [editError, setEditError] = useState('')
    const [editLoading, setEditLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText('https://koinonia-pk.vercel.app/n/' + post.community?.slug + '/post/' + post.id)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Error encountered during copy: ' + e)
        }
    }

    const increaseViews = async () => {
        try {
            const raw = localStorage.getItem('alreadyViewed')
            const alreadyViewed: Record<string, boolean> = raw ? JSON.parse(raw) : {}
            if (alreadyViewed[post.id as string]) {
                return;
            }
            await fetch('/api/post/actions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: post.id, action: 'views' }),
            })
            alreadyViewed[post.id as string] = true
            localStorage.setItem('alreadyViewed', JSON.stringify(alreadyViewed))
        } catch (e) {
            console.error('vote error', e)
        } finally {
            setLoading(false)
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
            toast.success("Spell casted!", { description: `You’ve casted ${spellName}` })
        } catch (err: any) {
            toast.error("Spell cast failed!", { description: err.message })
        }
    }

    const handleEditSubmit = async () => {
        try {
            setEditLoading(true)
            const res = await fetch('/api/post/edit', {
                headers: {
                    "Content-Type": 'application/json'
                },
                method: 'PUT',
                body: JSON.stringify(editPost)
            })

            const data = await res.json()

            if (!res.ok || data.error) {
                setEditError(data.error)
                return;
            }

            setShowEditDialog(false)
            setLocalPost({ ...editPost, edited: true, editedAt: new Date() })
        } catch (e: any) {
            setEditError(e.message)
        } finally {
            setEditLoading(false)
        }
    }

    const handlePostDelete = async () => {
        try {
            setDeleteLoading(true)
            const res = await fetch('/api/post/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId: post.id })
            })

            const data = await res.json()
            if (!res.ok || data.error) {
                toast.error('Error deleting post :(', { description: data.error })
                return;
            }

            setLocalPost(prev => ({ ...prev, isDeleted: true }))
            setShowDeleteDialog(false)
        } catch (e: any) {
            toast.error('Error deleting post :(', { description: e.message })
        } finally {
            setDeleteLoading(false)
        }
    }

    if (loading) {
        return (
            <div className='flex justify-center items-center w-full h-full'><Loader className='' size={96} /></div>
        )
    }

    return (
        <div className='flex flex-col'>

            <Card key={localPost.id} className='rounded shadow-none m-3'>
                <CardHeader>
                    <CardTitle>
                        <div className='flex justify-between'>
                            <Link href={'/u/' + localPost.author.username} className='flex items-center space-x-2 group'>
                                <div className='h-10 w-10 rounded border overflow-hidden'>
                                    {post.isDeleted ? <Ban /> : <img src={localPost.author.image || 'logo.png'} alt='user' />}
                                </div>
                                <div>
                                    <div className='font-semibold group-hover:underline underline-offset-2'>
                                        {post.isDeleted ? (
                                            'Post deleted'
                                        ) : (
                                            <>
                                                {localPost.author.name} {' '}
                                                {localPost.edited && (
                                                    <span className='text-xs opacity-70'>
                                                        (Edited {formatDistanceToNow(new Date(localPost.editedAt), { addSuffix: true })})
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className='text-xs text-muted-foreground'>
                                        {formatDistanceToNow(new Date(localPost.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            </Link>
                            <div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger disabled={localPost.isDeleted} className='cursor-pointer'>
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

                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger disabled={localPost.isDeleted} asChild>
                                        <Button variant="outline" aria-label="Open menu" size="icon-sm">
                                            <MoreVerticalIcon />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-40" align="end">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                                                Edit post
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setShowShareDialog(true)}>
                                                Share post
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className='text-red-500'>Delete</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Edit a post</DialogTitle>
                                        <DialogDescription>
                                            Edit the title and the content of the post.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FieldGroup className="pb-3">
                                        <Field>
                                            <FieldLabel htmlFor="title">Title</FieldLabel>
                                            <Input value={editPost.title} onChange={(e) => setEditPost(prev => ({ ...prev, title: e.target.value }))} id="title" name="title" />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="description">Content</FieldLabel>
                                            <Textarea value={editPost.content} onChange={e => setEditPost(prev => ({ ...prev, content: e.target.value }))} id="description" name="description" />
                                        </Field>
                                    </FieldGroup>
                                    <DialogFooter className='flex justify-between'>
                                        <p className='text-xs text-red-500'>{editError}</p>
                                        <div className='flex gap-2'>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button onClick={handleEditSubmit} disabled={editLoading || editPost.title == '' || editPost.content == ''} type="submit">{editLoading ? <Loader2 className='animate-spin' /> : 'Create'}</Button>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Delete the post
                                        </DialogTitle>
                                        <DialogDescription>
                                            This will only delete your post but the comments or replies won't get deleted.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose>
                                            <Button variant={'outline'}>Cancel</Button>
                                        </DialogClose>
                                        <Button onClick={handlePostDelete} variant={'destructive'} disabled={deleteLoading}>{deleteLoading ? <Loader2 className='animate-spin' /> : 'Confirm'}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Share Post</DialogTitle>
                                        <DialogDescription>
                                            Anyone with the link will be able to view this post.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FieldGroup className="py-3">
                                        <Field >
                                            <Label htmlFor="link">Post Link</Label>
                                            <div className='flex gap-2'>
                                                <Input
                                                    id="link"
                                                    name="link"
                                                    type="text"
                                                    value={'https://koinonia-pk.vercel.app/n/' + post.community?.slug + '/post/' + post.id}
                                                    autoComplete="off"
                                                    disabled
                                                />
                                                <Button variant={'outline'} onClick={handleCopy}>
                                                    {copied ? <Check className='opacity-70' size={20} /> : <Copy className='opacity-70' size={20} />}
                                                </Button>
                                            </div>
                                        </Field>
                                    </FieldGroup>
                                </DialogContent>
                            </Dialog>

                        </div>
                    </CardTitle>
                    {localPost.isDeleted ? (
                        <p>Post has been deleted</p>
                    ) : (
                        <><h1 className='font-semibold'>{localPost.title}</h1><CardDescription>{localPost.content}</CardDescription></>
                    )}
                </CardHeader>

                <CardContent>
                    {(localPost.imageUrl && !localPost.isDeleted) && (
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
                                onClick={() => {
                                    if (!localPost.isDeleted) {

                                        handleVote(localPost.id, 'upvote')
                                    }
                                }
                                }
                                className={`cursor-pointer border p-0.5 rounded transition duration-200 text-green-600 ${userVotes[localPost.id] === 'up'
                                    ? 'bg-gray-200'
                                    : 'hover:bg-gray-200'
                                    }`}


                            />

                            <SignalLow
                                onClick={() => {
                                    if (!localPost.isDeleted) handleVote(localPost.id, 'downvote')
                                }}
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

            <Comments comments={comments} postId={localPost.id} isDeleted={post.isDeleted} />
        </div>
    )
}

export default PostPage
