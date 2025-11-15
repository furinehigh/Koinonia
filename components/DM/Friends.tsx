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

    const handleFriendshipAction = async (id: string, action: 'block' | 'accept' | 'undo') => {
        try {
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

        } catch (e: any) {
            toast.error(e.message)
        }
    }

    return (
        <div className=''>
            <h1 className='text-xl font-semibold'>Your friends</h1>


            <div className='mt-5 flex flex-col gap-2'>
                {friends.map((f, i) => (
                    <Card className='rounded shadow-none py-2'>
                        <CardContent className='px-2'>
                            <p className='mb-2 text-xs'>Friend request by</p>
                            <div className='flex justify-between items-center'>
                                <div className='flex gap-2 items-center'>
                                    <Avatar>
                                        <AvatarImage src={'logo.png'} />
                                        <AvatarFallback>{'Rahul'.slice(0, 3)}</AvatarFallback>
                                    </Avatar>
                                    <h1>Rahul Kumar</h1>
                                </div>
                                {f.status == 'pending' ? <div className='flex gap-2 text-xs'>
                                    <button className='rounded border px-2 py-1 hover:bg-gray-100'>Block</button>
                                    <button className='rounded border px-2 bg-gray-900 text-white hover:bg-gray-700'>Accept</button>
                                </div> : f.status == 'blocked' ? <div className='flex gap-2 text-xs'>
                                    <p className='px-2 py-1'>Blockend</p>
                                    <button className='rounded border px-2 bg-gray-900 text-white hover:bg-gray-700'>Accept</button>
                                </div> : <div className='flex gap-2 text-xs'>
                                    <Link href={'new'} className='rounded border px-2 py-1 hover:bg-gray-100'>Message</Link>
                                    <button className='rounded border px-2 bg-gray-900 text-white hover:bg-gray-700'>Block</button>
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