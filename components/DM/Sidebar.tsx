'use client'
import { Users } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { io, Socket } from 'socket.io-client'

function Sidebar({ recentDMs, isDisabled = false, userId }: { recentDMs: any[], isDisabled?: boolean, userId: string }) {
    const pathname = usePathname()
    const [dms, setDms] = useState(recentDMs)

    const socketRef = useRef<Socket | null>(null)
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io("wss://wss.community.dishis.tech", {
                transports: ["websocket"],
            })
        }

        const s = socketRef.current

        // new message from other user
        s.on("message-created", (data) => {
            if (!pathname.includes(data.dmId))
                setDms(prev => prev.map(d => d.id == data.dmId ? { ...d, messages: [{ content: data.content }], unreadMessages: (d?.unreadMessages || 0) + 1 } : d))
        })


        return () => {
            s.off("message-created")
        }
    }, [])

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
                    {dms.map(dm => {
                        const other = dm.otherUser

                        return (
                            <Link
                                key={dm.id}
                                href={`/dm/${dm.id}`}
                                className={`flex justify-between items-center p-3 w-full hover:bg-gray-100 transition duration-300 ${pathname.includes(dm.id) ? 'bg-gray-200' : ''
                                    }`}
                            >
                                <div className='flex gap-2'>
                                    <div className="h-8 w-8 rounded border overflow-hidden">
                                        <img src={other.image || '/logo.png'} alt={other.name} />
                                    </div>
                                    <div className='flex flex-col '>
                                        <span className='font-semibold'>{other.name}</span>
                                        <span>{dm?.messages[0]?.content || ''}</span>
                                    </div>
                                </div>
                                {dm?.unreadMessages ? <span className='text-green-500 font-semibold'>{dm?.unreadMessages}</span> : (dm?.messages || []).filter((m: any) => m.status !== "read" && m.fromUserId !== userId) ? <span className='text-green-500 font-semibold'>{(dm?.messages || []).filter((m: any) => m.status !== "read" && m.fromUserId !== userId)?.length}</span> : ''}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
