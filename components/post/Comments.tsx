import React, { useEffect, useState } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, SignalHigh, SignalLow } from 'lucide-react'

function Comments({ comments, postId }: {
    comments: any[],
    postId: string
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [content, setContent] = useState('')
    const [commentVotes, setCommentVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({})
    const [localComments, setLocalComments] = useState(comments)
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

        setLocalComments(prev =>
            prev.map(c =>
                c.id === commentId ? { ...c, votes: (c.votes ?? 0) + delta } : c
            )
        )



        const updatedVotes = { ...commentVotes, [commentId]: newVote }
        saveVotes(updatedVotes)

        try {

            const res = await fetch('/api/comment/actions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId, action: serverAction }),
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (e) {
            console.error('vote error', e)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content, postId })
            })
            const data = await res.json()
            if (data.error) {
                setError(data.error)
                return;
            }
            setContent('')
            setLocalComments(prev => [data.data, ...prev])
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const commentCode = (comment: any) => {
        return (
            <div>
                <div className='flex space-x-2 group'>
                    <div className='h-8 w-8 rounded border overflow-hidden'>
                        <img src={comment.user.image || 'logo.png'} alt='user' />
                    </div>
                    <div>
                        <Link href={'/u/' + comment.user.username} >
                            <div className='font-semibold text-xs group-hover:underline underline-offset-2'>{comment.user.name}</div>
                        </Link>
                        <div className='text-[10px]'>
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </div>
                        <div className='text-xs mt-1'>
                            {comment.content}
                        </div>
                        <div className='flex items-center space-x-1 mt-2'>
                            <span className='text-xs'>{comment.votes}</span>

                            <SignalHigh
                                onClick={() => handleVote(comment.id, 'upvote')}
                                className={`cursor-pointer border p-0.5 rounded transition duration-200 text-green-600 ${commentVotes[comment.id] === 'up'
                                    ? 'bg-gray-200'
                                    : 'hover:bg-gray-200'
                                    }`}
                                size={20}
                            />

                            <SignalLow
                                onClick={() => handleVote(comment.id, 'downvote')}
                                className={`cursor-pointer border p-0.5 rounded transition duration-200 text-red-600 ${commentVotes[comment.id] === 'down'
                                    ? 'bg-gray-200'
                                    : 'hover:bg-gray-200'
                                    }`}
                                size={20}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className=' p-2'>
            <div className='mt-6 w-full' >
                <div className='rounded shadow-none m-3 flex gap-2 flex-col'>
                    <div className=''>
                        <h1 className='font-semibold '>Create Echoes</h1>
                    </div>
                    <div className='flex flex-col space-y-2 items-end justify-between'>
                        <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
                        <Button onClick={handleSubmit} disabled={content == ''}>
                            {loading ? <Loader2 className='animate-spin' /> : 'Create'}
                        </Button>
                    </div>
                    <p className='text-xs text-red-500'>{error}</p>
                </div>
            </div>

            <div className='flex flex-col gap-3 m-3'>
                {localComments.map(c => (
                    <React.Fragment key={c.id}>{commentCode(c)}</React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default Comments
