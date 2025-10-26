"use client"
import React, { useEffect, useState } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, Reply, SignalHigh, SignalLow } from 'lucide-react'

function Comments({ comments, postId, isDeleted }: { comments: any[], postId: string, isDeleted: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [replyError, setReplyError] = useState('')
  const [content, setContent] = useState('')
  const [commentVotes, setCommentVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({})
  const [localComments, setLocalComments] = useState(comments)
  const [replying, setReplying] = useState({ parentId: '', content: '' })
  const [replyLoading, setReplyLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('commentVotes')
    if (saved) setCommentVotes(JSON.parse(saved))
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

  const renderComment = (comment: any, depth = 0) => (
    <div key={comment.id} className={`relative mt-3 pl-${depth == 0 ? 0 : 4} border-l ${depth > 0 ? 'border-gray-300' : ''}`}>
      

      <div className='flex space-x-2 group'>
        <div className='h-8 w-8 rounded border overflow-hidden'>
          <img src={comment.user.image || '/logo.png'} alt='user' />
        </div>
        <div className='w-full'>
          <Link href={`/u/${comment.user.username}`} className='w-fit'>
            <div className='font-semibold text-xs group-hover:underline underline-offset-2'>
              {comment.user.name}
            </div>
          </Link>
          <div className='text-[10px] text-muted-foreground'>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </div>
          <div className='text-xs mt-1'>{comment.content}</div>

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
              onClick={() => setReplying({ parentId: comment.id, content: '' })}
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

          {comment.replies?.map((r: any) => renderComment(r, depth + 1))}
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
    </div>
  )
}

export default Comments
