'use client'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

function ChatLayout({ otherUser, children }: {
    otherUser: any,
    children: React.ReactNode
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
        <div className="w-full overflow-hidden h-full">
            <div className="border-b w-full p-2">
                <div className="flex gap-2 items-center">
                    <Link href={'/u/' + otherUser.username} className="h-10 w-10 rounded border overflow-hidden">
                        <img src={otherUser.image || '/logo.png'} alt="avatar" />
                    </Link>
                    <div className='flex flex-col'>
                        <Link href={'/u/' + otherUser.username}>{otherUser.name}</Link>
                        <span className='text-xs '>{userStatus.status == 'online' ? 'online' : 'Last online ' + formatDistanceToNow(new Date(userStatus?.lastOnlineAt), { addSuffix: true })}</span>
                    </div>
                </div>
            </div>

            <div className=''>{children}</div>
        </div>
    )
}

export default ChatLayout
