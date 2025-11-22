"use client"

import { Users } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { io, Socket } from "socket.io-client"

function Sidebar({ recentDMs, isDisabled = false, userId }) {
  const pathname = usePathname()
  const [dms, setDms] = useState(recentDMs)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("wss://wss.community.dishis.tech", { transports: ["websocket"] })
    }

    const s = socketRef.current

    s.on("message-created", (data) => {
      setDms(prev =>
        prev.map(dm => dm.id === data.dmId ? {
          ...dm,
          messages: [...(dm.messages || []), data],
          unreadMessages: pathname.includes(data.dmId)
            ? dm.unreadMessages
            : (dm.unreadMessages || 0) + 1
        } : dm)
      )
    })

    s.on("message-status", (data) => {
      setDms(prev =>
        prev.map(dm => dm.id === data.dmId ? {
          ...dm,
          messages: (dm.messages || []).map(m =>
            m.id === data.messageId ? { ...m, status: data.status, readAt: data.readAt } : m
          ),
          unreadMessages: (dm.messages || []).filter(m => m.fromUserId !== userId && m.status !== "read").length
        } : dm)
      )
    })

    return () => {
      s.off("message-created")
      s.off("message-status")
    }
  }, [pathname, userId])

  return (
    <aside
      hidden={isDisabled}
      className="relative ml-20 min-h-0 overflow-y-auto border-r bg-white text-sm flex flex-col px-4 py-5 min-w-[220px] max-w-[220px]"
    >
      <h2 className="font-semibold tracking-tight mb-4 text-[13px] uppercase opacity-70">
        Direct Messages
      </h2>

      <Link
        href="/dm/friends"
        className="flex items-center gap-2 px-2 py-1 hover:bg-neutral-100 transition"
      >
        <Users size={15} /> Friends
      </Link>

      <div className="border-b my-3 opacity-40" />

      <div className="flex flex-col gap-1 overflow-y-auto">
        {dms.map(dm => {
          const selected = pathname.includes(dm.id)
          const other = dm.otherUser

          return (
            <Link
              key={dm.id}
              href={`/dm/${dm.id}`}
              className={`flex items-center justify-between px-2 py-2 border-l-2 transition ${
                selected ? "border-black bg-neutral-100" : "border-transparent hover:border-neutral-400"
              }`}
            >
              <div className="flex gap-2 items-center">
                <img
                  src={other.image || "/logo.png"}
                  alt={other.name}
                  className="h-7 w-7 object-cover border-[1px opacity-50]"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-[12px]">{other.name}</span>
                  <span className="text-[10px] opacity-60 truncate max-w-[120px]">
                    {dm.messages?.[dm.messages.length - 1]?.content || ""}
                  </span>
                </div>
              </div>

              {dm.unreadMessages > 0 && (
                <span className="text-xs font-semibold text-black">{dm.unreadMessages}</span>
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}

export default Sidebar
