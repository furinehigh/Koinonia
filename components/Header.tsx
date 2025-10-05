'use client'
import { Plus } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useState } from 'react'
import CreateCommunityDialog from './dialog/create-community'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button'

function Header() {
    const { data: session, status } = useSession()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    return (
        <>
            <div className='fixed w-full z-50 dark:bg-black bg-white border-b p-3 flex justify-between items-center'>
                <div>
                    <h1 className='font-extrabold text-2xl'>
                        Koinonia
                    </h1>
                </div>
                <div className='flex space-x-2 items-center'>
                    {session?.user ? (
                        <>
                            <Button onClick={() => setIsDialogOpen(true)} className='flex items-center space-x-1' variant={'outline'}>
                                <span>Create</span> <Plus className='' />
                            </Button>

                            <div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger className='cursor-pointer mt-2'>
                                        <Image src={session?.user.image || 'user-placeholder.png'} className='rounded' width={30} height={30} alt='user' />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>
                                            <span>

                                            {session?.user.name}
                                            </span>
                                            <p className='text-xs'>{session?.user.email}</p>
                                            </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Profile</DropdownMenuItem>
                                        <DropdownMenuItem>Billing</DropdownMenuItem>
                                        <DropdownMenuItem>Team</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => signOut()}>SignOut</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    ) : (
                        <Link href={'/signin'}>
                            <button className='cursor-pointer font-bold p-2'>
                                <span>SignIn</span>
                            </button>
                        </Link>
                    )}
                </div>
            </div>
            <CreateCommunityDialog isOpen={isDialogOpen} handleOpenChange={setIsDialogOpen} />
        </>
    )
}

export default Header