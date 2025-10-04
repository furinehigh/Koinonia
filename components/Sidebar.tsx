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
        <div className='fixed top-17 bg-black border-r border-gray-500 h-[87vh] p-3 w-fit'>
            <div className='flex flex-col space-y-2 justify-center'>
                <div className='cursor-pointer rounded p-1'>
                    <Home strokeWidth={3} className='' />
                </div>
                <div className='cursor-pointer rounded p-1'>
                    <UsersRound strokeWidth={3} className='' />
                </div>
                <div className='cursor-pointer rounded p-1'>
                    <Settings strokeWidth={3} className='' />
                </div>
                <div className='w-[80%] mx-auto my-2 border-b border-gray-500'></div>
                {recentCommunities.map((c, i) => (
                    <div key={i} className='cursor-pointer'>
                        <Image src={c.icon} width={20} height={20} alt={c.name} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Sidebar