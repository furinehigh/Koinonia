import React, { useState } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

function Comments({ comments, postId }: {
    comments: any[],
    postId: string
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [content, setContent] = useState('')
    const router = useRouter()

    const handleSubmit = async () => {
        try {
            const res = await fetch('/api/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({content, postId })
            })
            const data = await res.json()
            if (data.error){
                setError(data.error)
                return;
            }
            router.refresh()
        } catch (e: any) {
            setError(e.message)
        }
    }
    const commentCode = (comment: any) => {
        return (
            <div>
                
            </div>
        )
    }
    return (
        <div className=''>
            <div className='mt-6 w-full' >
                <div className='rounded shadow-none m-3 flex p-2 gap-2 flex-col'>
                    <div className=''>
                        <h1 className='font-semibold '>Create Echoes</h1>
                    </div>
                    <div className='flex space-x-2 items-end justify-between'>
                        <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
                        <Button disabled={content == ''}>
                            Create
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                
            </div>
        </div>
    )
}

export default Comments
