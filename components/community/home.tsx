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
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'

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
                            <h1 className='font-semibold'>{p.title}</h1>
                            <CardDescription className=''>{p.content}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <img src={p.imageUrl} />
                        </CardContent>
                        <CardFooter>
                            <div className='flex justify-between'>
                                <div className='flex space-x-2'>
                                        <span>{p.votes}</span>
                                    <div className='flex'>

                                        <ArrowBigUp className='' />
                                    </div>
                                    <div className='flex'>
                                        <ArrowBigDown />
                                    </div>
                                </div>
                                <div>
                                    <span>{p.views}</span> views
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                )))}
            </div>
        </div>
    )
}

export default CommHome