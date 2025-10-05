import { communityData } from '@/lib/data/community';
import { notFound } from 'next/navigation';
import React from 'react'
import NotFound from './not-found';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function CommunityLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: { name: string }
}>) {
    const slug = (await params).name
    const community = await communityData(slug)

    if (!community) {
        return NotFound()
    }
    return (
        <div className="ml-15 flex flex-col">
            <div className="p-4 space-y-4 flex justify-between w-full">
                <div className='w-2/3 '>
                    <div className='flex space-x-2 items-center border-b w-full p-2'>
                        <Link href={'/'} >
                            <div className='rounded border p-1 cursor-pointer'>

                                <ChevronLeft className='h-5' />
                            </div>
                        </Link>
                        <Link href={'/c/' + community.slug} className='hover:underline flex items-center space-x-1'>
                            <div className='h-8 w-8 rounded border overflow-hidden'>
                                <img src={community.avatarUrl || 'logo.png'} width={40} height={40} />
                            </div>
                            <h1 className='text-sm '>c/{community.name}</h1>
                        </Link>

                        <div className='ml-auto'>
                            <Button>Create Post</Button>
                        </div>
                    </div>
                    <div>

                        {children}
                    </div>
                </div>
                <div className='w-1/3'>
                    <Card className='rounded shadow-none'>
                        <CardHeader>
                            <CardTitle>
                                <div className='flex items-center space-x-1'>
                                    <div className='h-10 w-10 rounded border'>
                                        <img src={community.avatarUrl || 'logo.png'} />
                                    </div>
                                    <div>
                                        {community.name}
                                    </div>
                                </div>
                            </CardTitle>
                            <CardDescription>{community.description}</CardDescription>
                            <CardAction></CardAction>
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
                </div>
            </div>
        </div>
    )
}

export default CommunityLayout