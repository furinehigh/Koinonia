'use client'
import React, { useState } from 'react'
import {
    Card,
    CardContent
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { toast } from 'sonner'

function Friends({ initialFriends }: {
    initialFriends: any[]
}) {
    const [friends, setFriends] = useState<any[]>(initialFriends)
    const [loading, setLoading] = useState(false)

    const handleFriendshipAction = async (id: string, action: 'block' | 'accept' | 'undo') => {
        try {
            setLoading(true)
            const res = await fetch('/api/friends/actions', {
                method: 'PUT',
                body: JSON.stringify({ action, id })
            })

            const data = await res.json()
            if (data.error || !res.ok) {
                toast.error(data.error || 'Unexpected error occurred!!')
                return;
            }
            if (action == 'accept') {
                toast.success('Successfully accepted the request!')
            } else if (action == 'block') {
                toast.success("Successfully blocked the friend!")
            } else {
                toast.success('Undone the friends blocking!')
            }
            setFriends(prev => prev.map(f => f.id == id ? {...f, status: action == 'block'? 'blocked' : 'accepted'} : f))
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className=''>
            <h1 className='text-xl font-semibold'>Your friends</h1>

            {friends?.length == 0 && (
                <div className='mt-5'>
                    <p className='text-xs'>You have no friends or friend requests..:(</p>
                </div>
            )}

            <div className='mt-5 flex flex-col gap-2'>
                {friends.map((f, i) => (
                    <Card className={`rounded shadow-none py-2 ${f.status == 'blocked' ? 'bg-gray-50' : f.status == 'pending' ? 'border-2' : ''}`}>
                        <CardContent className='px-2'>
                            {f.status == 'pending' && <p className='mb-2 text-xs'>Friend request by</p>}
                            <div className='flex justify-between items-center'>
                                <Link href={'/u/' + f.requester.username} className='flex gap-2 items-center hover:underline transition duration-200'>
                                    <Avatar>
                                        <AvatarImage src={f.requester.image || 'logo.png'} />
                                        <AvatarFallback>{f.requester.name.slice(0, 3)}</AvatarFallback>
                                    </Avatar>
                                    <h1>{f.requester.name}</h1>
                                </Link>
                                {f.status == 'pending' ? <div className='flex gap-2 text-xs'>
                                    <button onClick={() => handleFriendshipAction(f.id, 'block')} disabled={loading} className='rounded border px-2 py-1 disabled:opacity-70 disabled:bg-gray-100 hover:bg-gray-100'>Block</button>
                                    <button onClick={() => handleFriendshipAction(f.id, 'accept')} disabled={loading} className='rounded border disabled:opacity-70 disabled:bg-gray-700 px-2 bg-gray-900 text-white hover:bg-gray-700'>Accept</button>
                                </div> : f.status == 'blocked' ? <div className='flex gap-2 text-xs'>
                                    <p className='px-2 py-1'>Blocked</p>
                                    <button onClick={() => handleFriendshipAction(f.id, 'undo')} disabled={loading} className='rounded border disabled:opacity-70 disabled:bg-gray-700 px-2 bg-gray-900 text-white hover:bg-gray-700'>Unblock</button>
                                </div> : <div className='flex gap-2 text-xs'>
                                    <Link href={f.id} className='rounded border px-2 py-1 hover:bg-gray-100'>Message</Link>
                                    <button onClick={() => handleFriendshipAction(f.id, 'block')} disabled={loading} className='rounded border disabled:opacity-70 disabled:bg-gray-700 px-2 bg-gray-900 text-white hover:bg-gray-700'>Block</button>
                                </div>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Friends