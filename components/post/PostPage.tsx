'use client'
import React, { useEffect, useState } from 'react'
import { Ban, Check, Copy, Loader2, MessageSquare, MoreVerticalIcon, Signal, SignalHigh, SignalLow, Wand } from 'lucide-react'
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

import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useSession } from 'next-auth/react'
import UserPopup from '../user/UserPopup'
import FrameworkPanel from '@/components/framework/panel'

function PostPage({ post, comments }: { post: Post, comments: any[] }) {

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
  const [approvalLoading, setApprovalLoading] = useState(false)

  const { data: session } = useSession()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://koinonia-pk.vercel.app/n/${post.community?.slug}/post/${post.id}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {}
  }

  const increaseViews = async () => {
    try {
      const raw = localStorage.getItem('alreadyViewed')
      const alreadyViewed: Record<string, boolean> = raw ? JSON.parse(raw) : {}

      if (alreadyViewed[post.id]) return

      await fetch('/api/post/actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, action: 'views' }),
      })

      alreadyViewed[post.id] = true
      localStorage.setItem('alreadyViewed', JSON.stringify(alreadyViewed))

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
    const newVote = current === (isUp ? 'up' : 'down') ? null : isUp ? 'up' : 'down'

    let delta = { up: +1, down: -1, resetUp: -1, resetDown: +1, flipUp: +2, flipDown: -2 }
    let serverAction: string = ''

    if (current === 'up' && newVote === null) { serverAction = 'undo-upvote'; setLocalPost(p => ({ ...p, votes: p.votes + delta.resetUp })) }
    else if (current === 'down' && newVote === null) { serverAction = 'undo-downvote'; setLocalPost(p => ({ ...p, votes: p.votes + delta.resetDown })) }
    else if (current === 'up' && newVote === 'down') { serverAction = 'up-downvote'; setLocalPost(p => ({ ...p, votes: p.votes + delta.flipDown })) }
    else if (current === 'down' && newVote === 'up') { serverAction = 'down-upvote'; setLocalPost(p => ({ ...p, votes: p.votes + delta.flipUp })) }
    else if (current === null && newVote === 'up') { serverAction = 'upvote'; setLocalPost(p => ({ ...p, votes: p.votes + 1 })) }
    else if (current === null && newVote === 'down') { serverAction = 'downvote'; setLocalPost(p => ({ ...p, votes: p.votes - 1 })) }

    saveVotes({ ...userVotes, [postId]: newVote })

    try {
      await fetch('/api/post/actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: serverAction }),
      })
    } catch {}
  }

  const castSpell = async (postId: string, spellName: string) => {
    try {
      const res = await fetch('/api/spell/cast', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: postId, spellName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Spell casted: ${spellName}`)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handlePostApproval = async () => {
    try {
      setApprovalLoading(true)
      const res = await fetch('/api/post/approve', {
        method: 'PUT',
        body: JSON.stringify({ approve: true, id: localPost.id })
      })

      const data = await res.json()
      if (data.error) return toast.error(data.error)

      setLocalPost(prev => ({ ...prev, isApproved: true }))

    } finally {
      setApprovalLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    try {
      setEditLoading(true)
      const res = await fetch('/api/post/edit', {
        method: 'PUT',
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify(editPost)
      })

      const data = await res.json()

      if (!res.ok || data.error) return setEditError(data.error)

      setLocalPost({ ...editPost, edited: true, editedAt: new Date() })
      setShowEditDialog(false)

    } finally {
      setEditLoading(false)
    }
  }

  const handlePostDelete = async () => {
    try {
      setDeleteLoading(true)
      const res = await fetch('/api/post/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id })
      })

      const data = await res.json()
      if (!res.ok || data.error) return toast.error(data.error)

      setLocalPost(prev => ({ ...prev, isDeleted: true }))
      setShowDeleteDialog(false)

    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <div className='flex justify-center items-center w-full h-full'><Loader size={96} /></div>

  return (
    <div className='flex flex-col'>
      {!localPost.isApproved && (
        <div className='border border-neutral-300 p-2 text-xs opacity-70'>
          This post isn't approved yet. Visible only to you.
        </div>
      )}

      <FrameworkPanel className='mt-3'>

        {/* Top */}
        <div className='flex justify-between items-start border-b pb-2 mb-3'>

          <UserPopup user={localPost.isDeleted ? {} : localPost.author}>
            <Link href={localPost.isDeleted ? '#' : `/u/${localPost.author.username}`} className='flex items-center gap-2 group'>
              <img src={localPost.author.image || 'logo.png'} className='h-9 w-9 border object-cover' />
              <div>
                <span className='font-medium text-sm group-hover:underline'>
                  {localPost.isDeleted ? "Deleted user" : localPost.author.name}
                </span>
                <div className='text-[10px] opacity-50'>
                  {formatDistanceToNow(new Date(localPost.createdAt), { addSuffix: true })}
                </div>
              </div>
            </Link>
          </UserPopup>

          {!localPost.isApproved ? (
            <Button onClick={handlePostApproval}>{approvalLoading ? <Loader2 className='animate-spin' /> : 'Approve'}</Button>
          ) : (
            <div className='flex gap-2 items-center'>

              {/* Spell Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className='cursor-pointer'>
                  <Button variant='ghost' size='sm'><Wand className='h-4 w-4' /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Spell</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => castSpell(localPost.id, 'Rage Spell')}>Rage Spell</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => castSpell(localPost.id, 'Heal Spell')}>Heal Spell</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Menu */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => setShowShareDialog(true)}>
                      Share
                    </DropdownMenuItem>

                    {localPost.authorId === session?.user.id && (
                      <>
                        <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className='text-red-500' onSelect={() => setShowDeleteDialog(true)}>Delete</DropdownMenuItem>
                      </>
                    )}

                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          )}

        </div>

        {/* Title + Body */}
        {localPost.isDeleted ? (
          <>
            <p className='font-semibold'>Post deleted</p>
            <p className='text-xs opacity-60'>Replies and votes disabled.</p>
          </>
        ) : (
          <>
            <h1 className='text-lg font-semibold tracking-tight'>{localPost.title}</h1>
            <p className='text-sm opacity-70 mt-1'>{localPost.content}</p>
          </>
        )}

        {localPost.imageUrl && !localPost.isDeleted && (
          <img src={localPost.imageUrl} className='mt-3 border object-cover max-h-[45vh]' />
        )}

        {/* Footer */}
        <div className='border-t mt-4 pt-3 flex justify-between text-xs'>
          <div className='flex items-center gap-2'>
            <span>{localPost.votes}</span>

            <SignalHigh
              onClick={() => !localPost.isDeleted && handleVote(localPost.id, 'upvote')}
              className='cursor-pointer border p-0.5'
            />

            <SignalLow
              onClick={() => !localPost.isDeleted && handleVote(localPost.id, 'downvote')}
              className='cursor-pointer border p-0.5'
            />
          </div>

          <div className='opacity-60 flex gap-1 items-center'>
            <MessageSquare size={14} />
            {localPost._count.comments}
          </div>
        </div>

      </FrameworkPanel>

      <Comments comments={comments} postId={localPost.id} isDeleted={post.isDeleted} />


      {/* Dialogs preserved untouched */}
      {/* Edit */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Modify the content below.</DialogDescription>
          </DialogHeader>
          <div className="pb-3 space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={editPost.title} onChange={e => setEditPost(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={editPost.content} onChange={e => setEditPost(prev => ({ ...prev, content: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit} disabled={editLoading || editPost.title === '' || editPost.content === ''}>{editLoading ? <Loader2 className='animate-spin' /> : 'Update'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button onClick={handlePostDelete} variant='destructive' disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className='animate-spin' /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>Copy the link below:</DialogDescription>
          </DialogHeader>

          <div className='flex gap-2 mt-3'>
            <Input value={`https://koinonia-pk.vercel.app/n/${post.community?.slug}/post/${post.id}`} disabled />
            <Button variant='outline' onClick={handleCopy}>{copied ? <Check /> : <Copy />}</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default PostPage
