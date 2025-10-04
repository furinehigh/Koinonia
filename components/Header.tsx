'use client'
import { Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
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
                            <button className=' cursor-pointer dark:text-black dark:bg-white bg-black transition duration-300 text-white p-2 rounded'>
                                <span>Join</span>
                            </button>
                            <button onClick={() => setIsDialogOpen(true)} className='cursor-pointer border-1 dark:border-white dark:text-white border-black transition duration-300 text-black p-2 rounded flex items-center space-x-1'>
                                <span>Create</span> <Plus className='' />
                            </button>

                            <div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger className='cursor-pointer'>
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
                                        <DropdownMenuItem>Subscription</DropdownMenuItem>
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