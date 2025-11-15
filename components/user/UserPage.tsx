'use client'
import React, { useState } from 'react'
import { Community, User } from '@/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { toast } from 'sonner'
import { CirclePlus, Loader2 } from 'lucide-react'

function UserPage({ user, communities, recentPosts, activities, comments }: {
    user: any,
    communities: any[],
    recentPosts: any[],
    activities: any[],
    comments: any[]
}) {
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()

    const handleSendFriendReq = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/friends', {
                method: "POST",
                body: JSON.stringify({ receiverId: user.id })
            })
            const data = await res.json()

            if (!res.ok || data.error) {
                toast.error(data.error || 'Unexpected error occurred!')
                return;
            }

            toast.success("Friend request successfully sent!")
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="ml-15 flex flex-col">
            <div className="p-4 flex justify-between w-full">
                <div className='flex flex-col w-2/3 p-5'>
                    <div className='flex items-center space-x-3'>
                        
                        <div className='h-16 w-16 rounded border overflow-hidden'>
                            <img src={user.image || '/logo.png'} width={80} height={80} />
                        </div>
                        <div>
                            <h1 className='font-semibold text-3xl flex gap-2 items-center'>{user.name}
                                {session?.user.id !== user.id ? <Tooltip>
                                    <TooltipTrigger>
                                        <button className='disabled:opacity-70' onClick={handleSendFriendReq} disabled={loading}>
                                            {loading ? <Loader2 className='animate-spin' size={18} /> : <CirclePlus size={18} />}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Add friend
                                    </TooltipContent>
                                </Tooltip> : (
                                    <span className='bg-gray-200 rounded px-1 text-sm font-normal'>You</span>
                                )}
                            </h1>
                            <div className='text-xs flex gap-5'>
                                <div>
                                    <span className='font-semibold'>{user.mana.mana}</span> Mana
                                </div>
                                <div>
                                    Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col my-5'>
                        <h1 className='text-lg font-semibold'>Networks created</h1>
                        <div className='flex flex-col space-y-2'>
                            {communities.map((c, i) => (
                                <Link href={'/n/' + c.slug}>
                                    <Card className='rounded shadow-none w-full'>
                                        <CardHeader>
                                            <CardTitle className='flex justify-between'>
                                                <span>
                                                    {c.name}
                                                </span>
                                                <span className='font-medium text-xs'>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                                            </CardTitle>
                                            <CardDescription>{c.description}</CardDescription>
                                        </CardHeader>
                                        <CardFooter className='text-xs'>
                                            <span className='font-semibold mr-1'>{c._count.members}</span> member/s
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col my-5'>
                        <h1 className='text-lg font-semibold'>Recent signals</h1>
                        <div className='flex flex-col space-y-2'>
                            {recentPosts.map((p, i) => (
                                <Link href={'/n/' + p.community.slug + '/post/' + p.id}>
                                    <Card className='rounded shadow-none w-full'>
                                        <CardHeader>
                                            {p.isDeleted ? (
                                                <>
                                                    <p>Post has been deleted</p>
                                                </>
                                            ) : (
                                                <>
                                                    <CardTitle className='font-semibold flex justify-between'>
                                                        <span>{p.title}</span>
                                                        <span className='font-medium text-xs'>{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>
                                                    </CardTitle>
                                                    <CardDescription>{p.content}</CardDescription>
                                                </>
                                            )}
                                        </CardHeader>
                                        <CardFooter className='text-xs'>
                                            <span className='font-semibold mr-1'>{p.votes}</span> vote/s
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col my-5'>
                        <h1 className='text-lg font-semibold'>Recent echoes</h1>
                        <div className='flex flex-col space-y-2'>
                            {comments.map((c, i) => (
                                <Link href={'/n/' + c.post.community.slug + '/post/' + c.post.id}>
                                    <Card className='rounded shadow-none w-full'>
                                        <CardHeader>
                                            <CardTitle className='flex justify-between'>
                                                <span>Echoed on: {c.post.title}</span>
                                                <span className='font-medium text-xs'>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                                            </CardTitle>
                                            <CardDescription>{c.content}</CardDescription>
                                        </CardHeader>
                                        <CardFooter className='text-xs'>
                                            <span className='font-semibold mr-1'>{c.votes}</span> vote/s
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <Card className='rounded shadow-none w-1/3'>
                    <CardHeader>
                        <CardTitle>
                            Recent Activities
                        </CardTitle>
                        <CardContent className="p-0">
                            <div className="flex flex-col gap-5 w-full text-xs">
                                {(activities || []).map((a, i) => (
                                    <Link key={i} href={a.slug || '#'}>
                                        <div className="border rounded p-1">
                                            <div className="flex space-x-2 items-center justify-between">
                                                <div>
                                                    <p className="bg-gray-300 rounded px-2  w-fit">{a.type}</p>
                                                    <h1 className="font-semibold text-sm">{a.title}</h1>
                                                </div>
                                                <p>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                                            </div>
                                            <div>
                                                <p>{a.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}

export default UserPage