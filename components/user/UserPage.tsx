'use client'
import React from 'react'
import { Community, User } from '@/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

function UserPage({ user, communities, recentPosts, activities, comments }: {
    user: any,
    communities: any[],
    recentPosts: any[],
    activities: any[],
    comments: any[]
}) {
    console.log(user)
    return (
        <div className="ml-15 flex flex-col">
            <div className="p-4 flex justify-between w-full">
                <div className='flex flex-col w-2/3 p-5'>
                    <div className='flex items-center space-x-3'>
                        <div className='h-16 w-16 rounded border overflow-hidden'>
                            <img src={user.image || '/logo.png'} width={80} height={80} />
                        </div>
                        <div>

                            <h1 className='font-semibold text-3xl'>{user.name}</h1>
                            <div className='text-xs'>
                                <div>

                                    <span className='font-semibold'>{user.mana.mana}</span> Mana
                                </div>
                                <div>
                                    {user.spells.rageSpell}
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
                                            <CardTitle>
                                                {c.name}
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
                                            <CardTitle>
                                                {p.title}
                                            </CardTitle>
                                            <CardDescription>{p.content}</CardDescription>
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
                                            <CardTitle>
                                                Echoed on: {c.post.title}
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

                                {activities.map((a, i) => (
                                    <Link key={i} href={a.slug || '#'}>
                                        <div className="border rounded p-1">
                                            <div className="flex space-x-2 items-center justify-between">
                                                <div>

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