'use client'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

function ChatLayout({ otherUser }: {
    otherUser: any
}) {
    const [userStatus, setUserStatus] = useState({
        status: 'online',
        lastOnlineAt: new Date
    })
    const socket = io('wss://wss.community.dishis.tech')

    useEffect(() => {
        socket.on('user-status-update', (data) => {
            if (data.userId == otherUser.id)
                setUserStatus(data)
        })
    }, [])
    return (
        <div className="border-b px-4 py-3 flex items-center gap-3 bg-white">
            <img src={otherUser.image || "/logo.png"} className="h-9 w-9 border object-cover" />

            <div className="flex flex-col">
                <Link href={`/u/${otherUser.username}`} className="text-sm font-medium hover:underline">
                    {otherUser.name}
                </Link>
                <span className="text-[10px] opacity-60 font-mono">
                    {userStatus.status === "online"
                        ? "online"
                        : `last seen ${formatDistanceToNow(new Date(userStatus.lastOnlineAt))} ago`}
                </span>
            </div>
        </div>
    )

}

export default ChatLayout
