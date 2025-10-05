'use client'
import { Home, Settings, UsersRound } from 'lucide-react'
import React, { useState } from 'react'
import { Community } from '@/types'
import Image from 'next/image'

function Sidebar({recentCommunities} : {
    recentCommunities: Community[] 
}) {
    const [expanded, setExpanded] = useState(false)
    return (
        <div className='fixed mt-15 border-r h-[90vh] p-3 w-fit dark:bg-black bg-white flex flex-col justify-between'>
            <div className='flex flex-col space-y-2 justify-center w-full items-center'>
                <div className='cursor-pointer rounded p-1'>
                    <Home className='' />
                </div>
                <div className='cursor-pointer rounded p-1'>
                    <UsersRound className='' />
                </div>
                <div className='cursor-pointer rounded p-1'>
                    <Settings className='' />
                </div>
                <div className='w-[80%] mx-auto my-2 border-b'></div>
                {recentCommunities.map((c, i) => (
                    <div key={i} className='cursor-pointer'>
                        <Image src={c.avatarUrl || 'comm_placeholder.png'} width={20} height={20} alt={c.name} />
                    </div>
                ))}
            </div>
            <div className='text-sm space-x-1 text-center'>
                <p>50</p>
                <p>Koins</p>
            </div>
        </div>
    )
}

export default Sidebar