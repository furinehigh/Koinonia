'use client'
import { Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useState } from 'react'
import CreateCommunityDialog from './dialog/create-community'
import Link from 'next/link'

function Header() {
    const { data: session, status } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <div className='fixed w-full z-50 dark:bg-black bg-white border-b p-3 flex justify-between items-center'>
                <div>
                    <h1 className='font-extrabold text-2xl'>
                        Koinonia
                    </h1>
                </div>
                <div className='flex space-x-2'>
                    {session?.user ? (
                        <>
                            <button className=' cursor-pointer border-2 border-white hover:bg-white hover:border-black hover:text-black transition duration-300 text-white font-extrabold p-2 rounded flex items-center space-x-1'>
                                <span>Join</span>
                            </button>
                            <button className='bg-white cursor-pointer border-2 border-black hover:border-white hover:bg-black hover:text-white transition duration-300 text-black font-extrabold p-2 rounded flex items-center space-x-1'>
                                <span>Create</span> <Plus className='' />
                            </button>

                            <button className='cursor-pointer p-2 rounded'>
                                <Image src={'vercel.svg'} width={20} height={20} alt='user' />
                            </button>
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
            <CreateCommunityDialog isOpen={isOpen} handleOpenChange={setIsOpen} />
        </>
    )
}

export default Header