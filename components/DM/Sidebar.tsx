"use client"

import { Users } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { io, Socket } from "socket.io-client"

function Sidebar({
    recentDMs,
    isDisabled = false,
    userId,
}: {
    recentDMs: any[]
    isDisabled?: boolean
    userId: string
}) {
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

        // New message listener
        s.on("message-created", (data) => {
            setDms((prev) =>
                prev.map((dm) => {
                    if (dm.id !== data.dmId) return dm

                    const updatedMessages = [...(dm.messages || []), data]

                    return {
                        ...dm,
                        messages: updatedMessages,
                        unreadMessages: pathname.includes(data.dmId)
                            ? dm.unreadMessages // viewing → don't count as unread
                            : (dm.unreadMessages || 0) + 1,
                    }
                })
            )
        })

        // Message read/delivered status sync
        s.on("message-status", (data) => {
            setDms((prev) =>
                prev.map((dm) => {
                    if (dm.id !== data.dmId) return dm

                    const updatedMessages = (dm.messages || []).map((m: any) =>
                        m.id === data.messageId ? { ...m, status: data.status, readAt: data.readAt } : m
                    )

                    // unread count logic = unread messages NOT from this user
                    const unread = updatedMessages.filter(
                        (m: any) => m.fromUserId !== userId && m.status !== "read"
                    ).length

                    return {
                        ...dm,
                        messages: updatedMessages,
                        unreadMessages: unread,
                    }
                })
            )
        })

        return () => {
            s.off("message-created")
            s.off("message-status")
        }
    }, [pathname, userId])

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
                    {dms.map((dm) => {
                        const other = dm.otherUser
                        const selected = pathname.includes(dm.id)

                        return (
                            <Link
                                key={dm.id}
                                href={`/dm/${dm.id}`}
                                className={`flex justify-between items-center p-3 w-full hover:bg-gray-100 transition duration-300 ${selected ? "bg-gray-200" : ""
                                    }`}
                            >
                                <div className="flex gap-2">
                                    <div className="h-8 w-8 rounded border overflow-hidden">
                                        <img src={other.image || "/logo.png"} alt={other.name} />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-semibold">{other.name}</span>
                                        <span className="truncate max-w-[150px] opacity-70">
                                            {dm.messages?.[dm.messages.length - 1]?.content || ""}
                                        </span>
                                    </div>
                                </div>

                                {dm.unreadMessages > 0 && (
                                    <span className="text-green-600 font-semibold">{dm.unreadMessages}</span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
