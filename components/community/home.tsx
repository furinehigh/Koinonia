'use client'
import React from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Post } from '@/types'

function CommHome({ posts }: {
    posts: Post[]
}) {
    return (
        <div className='flex flex-col '>
            <div className='my-5'>
                <h1 className='font-semibold'>Announcements</h1>
                <Card className='rounded shadow-none w-xs'>
                    <CardHeader>
                        <CardTitle>
                            Welcome!!
                        </CardTitle>
                        <CardDescription>
                            We are very happy to see you here on this community, start new post and keep earning koins and trust.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
            <div className='my-5'>
                <h1 className='font-semibold'>Posts</h1>
                {posts.length == 0 && (
                    <div>No posts found in this community.</div>
                )}
                {posts.map(((p, i) => (
                    <Card className='rounded shadow-none'>
                        <CardHeader>
                            <CardTitle>
                                <div className='flex justify-between'>
                                    <div className='flex items-center space-x-1'>
                                        <div className='h-10 w-10 rounded border overflow-hidden'>
                                            <img src={p.author.image || 'logo.png'} />
                                        </div>
                                        <div>
                                            {p.author.name}
                                        </div>
                                    </div>
                                    
                                </div>
                            </CardTitle>
                            <CardDescription>{community.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='flex justify-between'>

                                <div className='text-sm flex items-center space-x-1'>
                                    <p className='font-semibold'>{community.membersCount}</p>
                                    <p>members</p>
                                </div>
                                <div className='text-sm flex items-center space-x-1'>
                                    <p className='font-semibold'>{community.membersCount}</p>
                                    <p>online members</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                        </CardFooter>
                    </Card>
                )))}
            </div>
        </div>
    )
}

export default CommHome