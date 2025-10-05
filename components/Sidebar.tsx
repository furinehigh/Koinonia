'use client'
import { Home, Settings, UsersRound } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Community } from '@/types'
import Image from 'next/image'
import { useUserStore } from '@/store/useUserStore'
import Link from 'next/link'

function Sidebar({recentCommunities} : {
    recentCommunities: Community[] 
}) {
    const [expanded, setExpanded] = useState(false)
    const { koins, loading, fetchKoins, updateKoins } = useUserStore()

  useEffect(() => {
    fetchKoins()
  }, [])

    return (
        <div className='fixed z-50 mt-15 border-r h-[90vh] p-3 w-fit dark:bg-black bg-white flex flex-col justify-between'>
            <div className='flex flex-col space-y-2 justify-center w-full items-center'>
                <Link href={'/'} className='cursor-pointer rounded p-1'>
                    <Home className='' />
                </Link>
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
                <p className='font-semibold'>{koins}</p>
                <p>Koins</p>
            </div>
        </div>
    )
}

export default Sidebar