"use client"
import React, { useEffect, useState } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, MoreVerticalIcon, Reply, SignalHigh, SignalLow } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from 'next-auth/react'
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
import { toast } from 'sonner'
import FrameworkPanel from '@/components/framework/panel'

function Comments({ comments, postId, isDeleted }: { comments: any[], postId: string, isDeleted: boolean }) {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [replyError, setReplyError] = useState('')
  const [content, setContent] = useState('')
  const [commentVotes, setCommentVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({})
  const [localComments, setLocalComments] = useState(comments)
  const [replying, setReplying] = useState({ parentId: '', content: '' })
  const [replyLoading, setReplyLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editComment, setEditComment] = useState<any>()
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('commentVotes') || '{}')
      setCommentVotes(saved)
    } catch {
      localStorage.removeItem('commentVotes')
    }
  }, [])

  const saveVotes = (votes: typeof commentVotes) => {
    setCommentVotes(votes)
    localStorage.setItem('commentVotes', JSON.stringify(votes))
  }

  const handleVote = async (commentId: string, action: 'upvote' | 'downvote') => {
    const isUp = action === 'upvote'
    const current = commentVotes[commentId] ?? null
    const newVote = current === (isUp ? 'up' : 'down') ? null : isUp ? 'up' : 'down'
    let serverAction = ''
    let delta = 0

    if (current === 'up' && newVote === null) { serverAction = 'undo-upvote'; delta = -1 }
    else if (current === 'down' && newVote === null) { serverAction = 'undo-downvote'; delta = +1 }
    else if (current === 'up' && newVote === 'down') { serverAction = 'up-downvote'; delta = -2 }
    else if (current === 'down' && newVote === 'up') { serverAction = 'down-upvote'; delta = +2 }
    else if (current === null && newVote === 'up') { serverAction = 'upvote'; delta = +1 }
    else if (current === null && newVote === 'down') { serverAction = 'downvote'; delta = -1 }

    setLocalComments(prev => prev.map(c => c.id === commentId ? { ...c, votes: (c.votes ?? 0) + delta } : c))
    saveVotes({ ...commentVotes, [commentId]: newVote })

    try {
      await fetch('/api/comment/actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, action: serverAction }),
      })
      router.refresh()
    } catch {}
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    if (isDeleted) return

    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, postId })
      })
      const data = await res.json()
      if (data.error) return setError(data.error)

      setContent('')
      setLocalComments(prev => [data.data, ...prev])
    } finally {
      setLoading(false)
    }
  }

  const handleReplySubmit = async () => {
    setReplyLoading(true)
    setReplyError('')
    if (isDeleted) return

    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replying.content, postId, parentId: replying.parentId })
      })
      const data = await res.json()
      if (data.error) return setReplyError(data.error)

      setLocalComments(prev =>
        prev.map(c =>
          c.id === replying.parentId
            ? { ...c, replies: [...(c.replies || []), data.data] }
            : c
        )
      )
      setReplying({ parentId: '', content: '' })

    } finally {
      setReplyLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    try {
      setEditLoading(true)
      const res = await fetch('/api/comment/edit', {
        headers: { "Content-Type": 'application/json' },
        method: 'PUT',
        body: JSON.stringify(editComment)
      })

      const data = await res.json()
      if (!res.ok || data.error) return setEditError(data.error)

      setShowEditDialog(false)
      setLocalComments(prev =>
        prev.map(c => c.id === editComment.id ? { ...c, content: editComment.content, edited: true, editedAt: new Date() } : c)
      )

    } finally {
      setEditLoading(false)
    }
  }

  const handleCommentDelete = async (commentId: string) => {
    try {
      setDeleteLoading(true)
      const res = await fetch('/api/comment/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      })

      const data = await res.json()
      if (!res.ok || data.error) return toast.error(data.error)

      setLocalComments(prev => prev.map(c => (c.id === commentId ? { ...c, isDeleted: true } : c)))
      setShowDeleteDialog(false)

    } finally {
      setDeleteLoading(false)
    }
  }

  // ---------- Framework Thread UI ----------

  const renderComment = (comment: any, depth = 0) => (
    <div key={comment.id} className={`pl-${depth * 4} border-l ${depth ? 'border-neutral-300' : ''} pt-3`}>
      
      <div className="flex gap-2">

        {/* Avatar */}
        <img src={comment.user.image || '/logo.png'} className="h-7 w-7 border object-cover" />

        <div className="flex-1">

          {/* Header */}
          <div className="flex justify-between items-start border-b pb-1 mb-2">
            <Link href={`/u/${comment.user.username}`} className="text-xs font-medium hover:underline">
              {comment.user.name}
            </Link>

            {comment.user.id === session?.user.id && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="opacity-60 hover:opacity-100">
                    <MoreVerticalIcon size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 text-xs">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => {
                      setEditComment(comment)
                      setShowEditDialog(true)
                    }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      setEditComment(comment)
                      setShowDeleteDialog(true)
                    }} className='text-red-500'>Delete</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Body */}
          <p className="text-xs opacity-80">
            {comment.isDeleted ? <i>(deleted)</i> : comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2 text-xs">

            <span>{comment.votes}</span>

            <SignalHigh
              size={16}
              onClick={() => handleVote(comment.id, 'upvote')}
              className={`cursor-pointer border p-0.5 ${commentVotes[comment.id] === 'up' ? 'bg-neutral-200' : ''}`}
            />

            <SignalLow
              size={16}
              onClick={() => handleVote(comment.id, 'downvote')}
              className={`cursor-pointer border p-0.5 ${commentVotes[comment.id] === 'down' ? 'bg-neutral-200' : ''}`}
            />

            <Reply
              size={15}
              className="cursor-pointer border p-0.5 ml-3"
              onClick={() => {
                if (!session) return toast.error("Login to reply")
                if (!comment.isDeleted) setReplying({ parentId: comment.id, content: '' })
              }}
            />
          </div>

          {/* Reply Input */}
          {replying.parentId === comment.id && (
            <div className="mt-2 space-y-2">
              <Textarea value={replying.content} disabled={isDeleted} onChange={e => setReplying(prev => ({ ...prev, content: e.target.value }))} />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setReplying({ parentId: '', content: '' })}>Cancel</Button>
                <Button disabled={!replying.content || isDeleted} onClick={handleReplySubmit}>
                  {replyLoading ? <Loader2 className='animate-spin' size={14} /> : 'Reply'}
                </Button>
              </div>
              <p className='text-xs text-red-500'>{replyError}</p>
            </div>
          )}

          {/* Replies */}
          {comment.replies?.map((r: any) => renderComment(r, depth + 1))}

        </div>
      </div>
    </div>
  )

  return (
    <div className="mt-8">

      {/* Comment input */}
      <FrameworkPanel>
        <h2 className="text-xs uppercase tracking-wide opacity-60">Create Echo</h2>

        <Textarea className="mt-2" value={content} disabled={isDeleted} onChange={e => setContent(e.target.value)} />

        <div className="mt-2 flex gap-2 items-center">
          <Button disabled={!content || loading || isDeleted} onClick={handleSubmit}>
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Submit"}
          </Button>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </FrameworkPanel>

      {/* Thread */}
      <div className="mt-5 flex flex-col gap-4">
        {localComments.map(c => renderComment(c))}
      </div>


      {/* ---------- Dialogs (unchanged logic) ---------- */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Comment</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Content</FieldLabel>
              <Textarea value={editComment?.content} onChange={e => setEditComment(prev => ({ ...prev, content: e.target.value }))} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button disabled={!editComment?.content || editLoading} onClick={handleEditSubmit}>
              {editLoading ? <Loader2 className="animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose><Button variant="outline">Cancel</Button></DialogClose>
            <Button disabled={deleteLoading} variant="destructive" onClick={() => handleCommentDelete(editComment.id)}>
              {deleteLoading ? <Loader2 className="animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default Comments
