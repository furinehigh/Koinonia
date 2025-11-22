'use client'
import { Users } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Sidebar({ recentDMs, isDisabled = false }: { recentDMs: any[], isDisabled?: boolean }) {
    const pathname = usePathname()

    return (
        <div
            hidden={isDisabled}
            className="relative ml-17 z-50 border-r p-3 w-sm dark:bg-black bg-white flex flex-col justify-between"
        >
            <div className="flex flex-col space-y-2 w-full overflow-y-auto">
                <h1 className="font-semibold text-xl">Direct Messages</h1>

                <Link href="/dm/friends" className="cursor-pointer rounded p-3 flex gap-2">
                    <Users /> All Friends
                </Link>

                <div className="w-[90%] mx-auto my-2 border-b" />

                <div className="flex flex-col text-xs">
                    {recentDMs.map(dm => {
                        const other = dm.otherUser

                        return (
                            <Link
                                key={dm.id}
                                href={`/dm/${dm.id}`}
                                className={`flex gap-2 items-center p-3 w-full hover:bg-gray-100 transition duration-300 ${pathname.includes(dm.id) ? 'bg-gray-200' : ''
                                    }`}
                            >
                                <div className="h-8 w-8 rounded border overflow-hidden">
                                    <img src={other.image || '/logo.png'} alt={other.name} />
                                </div>
                                <div className='flex flex-col '>
                                    <span className='font-semibold'>{other.name}</span>
                                    <span>{dm.messages[0]?.content || ''}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
