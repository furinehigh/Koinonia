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
                <div className='2/3'>
                    {children}
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
                            <p>Card Content</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CommunityLayout