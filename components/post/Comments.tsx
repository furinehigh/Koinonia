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
  const [selectedComment, setSelectedComment] = useState()

  const router = useRouter()
  const { data: session, status } = useSession()

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
    } catch (e) {
      console.error('vote error', e)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    if (isDeleted) {
      return;
    }
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
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReplySubmit = async () => {
    setReplyLoading(true)
    setReplyError('')
    if (isDeleted) {
      return;
    }
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
    } catch (e: any) {
      setReplyError(e.message)
    } finally {
      setReplyLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    try {
      setEditLoading(true)
      const res = await fetch('/api/comment/edit', {
        headers: {
          "Content-Type": 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(editComment)
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setEditError(data.error)
        return;
      }

      setShowEditDialog(false)
      setLocalComments(prev =>
        prev.map(c =>
          c.id === editComment.id
            ? { ...c, content: editComment.content, edited: true, editedAt: new Date() }
            : c
        )
      )
    } catch (e: any) {
      setEditError(e.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleCommentDelete = async (commentId: string) => {
    try {
      setDeleteLoading(true)
      const res = await fetch('/api/comment/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commentId })
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error('Error deleting post :(', { description: data.error })
        return;
      }

      setLocalComments(prev => prev.map(c => (c.id == commentId ? { ...c, isDeleted: true } : c)))
      setShowDeleteDialog(false)
    } catch (e: any) {
      toast.error('Error deleting post :(', { description: e.message })
    } finally {
      setDeleteLoading(false)
    }
  }

  const renderComment = (comment: any, depth = 0) => (
    <div key={comment.id} className={`relative mt-3 pl-${depth == 0 ? 0 : 4} border-l ${depth > 0 ? 'border-gray-300' : ''}`}>


      <div className='flex space-x-2 group'>
        <div className='h-8 w-8 rounded border overflow-hidden'>
          <img src={comment.user.image || '/logo.png'} alt='user' />
        </div>
        <div className='w-full'>
          <div className='flex justify-between'>
            <div>
              <Link href={`/u/${comment.user.username}`} className='w-fit'>
                <div className='font-semibold text-xs group-hover:underline underline-offset-2'>
                  {comment.user.name}
                </div>
                {comment.edited && (
                  <span className='text-xs opacity-70'>
                    (Edited {formatDistanceToNow(new Date(comment.editedAt), { addSuffix: true })})
                  </span>
                )}
              </Link>
              <div className='text-[10px] text-muted-foreground'>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </div>
            </div>
            {comment.user.id === session?.user.id && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger disabled={comment.isDeleted || comment.isRemoved || !comment.isApproved} asChild>
                  <Button variant="ghost" aria-label="Open menu" size="icon-sm">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => {
                      setEditComment(comment)
                      setShowEditDialog(true)
                    }}>
                      Edit comment
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
          <div className='text-xs mt-1'>
            {comment.isDeleted ? (
              <div className='font-semibold'>
                comment has been deleted...
              </div>
            ) : (
              <>
                {comment.content}
              </>
            )}
          </div>

          <div className='flex items-center space-x-1 mt-2'>
            <span className='text-xs'>{comment.votes}</span>
            <SignalHigh onClick={() => handleVote(comment.id, 'upvote')}
              className={`cursor-pointer border p-0.5 rounded transition text-green-600 ${commentVotes[comment.id] === 'up' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              size={18}
            />
            <SignalLow onClick={() => handleVote(comment.id, 'downvote')}
              className={`cursor-pointer border p-0.5 rounded transition text-red-600 ${commentVotes[comment.id] === 'down' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
              size={18}
            />
            <Reply
              onClick={() => {
                if (!session) return toast.error("Login to reply");
                if (!comment.isDeleted && !comment.isRemoved && comment.isApproved)
                  setReplying({ parentId: comment.id, content: '' })
              }}

              className='cursor-pointer border p-0.5 rounded transition ml-3 hover:bg-gray-100'
              size={18}
            />
          </div>

          {replying.parentId === comment.id && (
            <div className='mt-2 flex flex-col gap-2'>
              <Textarea value={replying.content} disabled={isDeleted} onChange={(e) => setReplying(prev => ({ ...prev, content: e.target.value }))} />
              <div className='flex gap-2'>
                <Button variant='ghost' onClick={() => setReplying({ parentId: '', content: '' })} disabled={replyLoading}>
                  Cancel
                </Button>
                <Button onClick={handleReplySubmit} disabled={!replying.content || replyLoading || isDeleted}>
                  {replyLoading ? <Loader2 className='animate-spin' /> : 'Reply'}
                </Button>
              </div>
              <p className='text-xs text-red-500'>{replyError}</p>
            </div>
          )}

          {Array.isArray(comment.replies) && comment.replies.length > 0 &&
            comment.replies?.map(r => renderComment(r, depth + 1))
          }

        </div>
      </div>


    </div>
  )

  return (
    <div className='p-3'>
      <div className='rounded shadow-none mb-5 flex flex-col gap-2'>
        <h1 className='font-semibold text-sm'>Create Echoes</h1>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={isDeleted} />
        <Button onClick={handleSubmit} disabled={!content || loading || isDeleted}>
          {loading ? <Loader2 className='animate-spin' /> : 'Create'}
        </Button>
        <p className='text-xs text-red-500'>{error}</p>
      </div>

      <div className='flex flex-col gap-4'>
        {localComments.map(c => renderComment(c))}
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
              <FieldLabel htmlFor="description">Content</FieldLabel>
              <Textarea value={editComment?.content} onChange={e => setEditComment(prev => ({ ...prev, content: e.target.value }))} id="description" name="description" />
            </Field>
          </FieldGroup>
          <DialogFooter className='flex justify-between'>
            <p className='text-xs text-red-500'>{editError}</p>
            <div className='flex gap-2'>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit} disabled={
                editLoading ||
                !editComment?.content ||
                editComment?.user.id !== session?.user.id
              }
                type="submit">{editLoading ? <Loader2 className='animate-spin' /> : 'Update'}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete the comment
            </DialogTitle>
            <DialogDescription>
              This will only delete your comment but the replies or parent comments won't get deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant={'outline'}>Cancel</Button>
            </DialogClose>
            <Button onClick={() => handleCommentDelete(editComment.id)} variant={'destructive'} disabled={deleteLoading || editComment?.user.id !== session?.user.id}>{deleteLoading ? <Loader2 className='animate-spin' /> : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Comments
