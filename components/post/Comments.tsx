import React, { useState } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'

function Comments({ comments, postId }: {
    comments: any[],
    postId: string
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [content, setContent] = useState('')
    const router = useRouter()

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
            router.refresh()
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const commentCode = (comment: any) => {
        return (
            <div>
                <div>
                    <Link href={'/u/' + comment.user.username} className='flex items-center space-x-2 group'>
                        <div className='h-8 w-8 rounded border overflow-hidden'>
                            <img src={comment.user.image || 'logo.png'} alt='user' />
                        </div>
                        <div>
                            <div className='font-semibold text-xs group-hover:underline underline-offset-2'>{comment.user.name}</div>
                            <div className='text-[10px]'>
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </div>
                        </div>
                    </Link>
                    <div className='text-xs mt-1'>
                        {comment.content}
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
                    <div className='flex space-x-2 items-end justify-between'>
                        <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
                        <Button onClick={handleSubmit} disabled={content == ''}>
                            {loading ? <Loader2 className='animate-spin' /> : 'Create'}
                        </Button>
                    </div>
                    <p className='text-xs text-red-500'>{error}</p>
                </div>
            </div>

            <div className='flex flex-col gap-3 m-3'>
                {comments.map((c, i) => (commentCode(c)))}
            </div>
        </div>
    )
}

export default Comments
