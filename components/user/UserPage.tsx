'use client'
import React from 'react'
import { Community, User } from '@/types'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'

function UserPage({ user, communities }: {
    user: any,
    communities: any[]
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
                        <h1 className='text-lg font-semibold'>Communities created</h1>
                        <div className='flex flex-col space-y-2'>
                            {communities.map((c, i) => (
                                <Link href={'/c/' + c.slug}>
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
                </div>
                <Card className='rounded shadow-none w-1/3'>
                    <CardHeader>
                        <CardTitle>
                            Recent Activities
                        </CardTitle>
                        <CardDescription>Coming soon..</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}

export default UserPage