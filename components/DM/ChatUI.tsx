"use client"

import React, { useEffect, useRef, useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { io, Socket } from "socket.io-client"
import "./TypingDots.css"

function ChatUI({ dmId, initialMessages, to }: { dmId: string, initialMessages: any[], to: string }) {
  const [messages, setMessages] = useState(initialMessages)
  const [content, setContent] = useState("")
  const [userTyping, setUserTyping] = useState(false)

  const { data: session } = useSession()

  const socketRef = useRef<Socket | null>(null)
  const lastSent = useRef(0)
  const stopTimeout = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("wss://wss.community.dishis.tech", {
        transports: ["websocket"],
      })
    }

    const s = socketRef.current

    // new message from other user
    s.on("message-created", (data) => {
      if (data.dmId === dmId && data.from == to) {
        setMessages((prev) => [...prev, {...data, fromUserId: data.from }])
      }
    })

    // typing signal from other user
    s.on("user-typing-status", (data) => {
      if (data.dmId === dmId && data.userId == to) {
        setUserTyping(data.typing)
      }
    })

    return () => {
      s.off("message-created")
      s.off("user-typing-status")
    }
  }, [dmId])

  const callAPI = (typing: boolean) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    fetch(`/api/user/typing`, {
      method: "POST",
      signal: abortRef.current.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        typing,
        dmId,
        userId: session?.user.id,
      }),
    }).catch(() => { })
  }

  const sendTyping = () => {
    const now = Date.now()
    if (now - lastSent.current < 400) return
    lastSent.current = now
    callAPI(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value)
    sendTyping()

    if (stopTimeout.current) clearTimeout(stopTimeout.current)

    stopTimeout.current = setTimeout(() => {
      callAPI(false)
    }, 1200)
  }

  const handleMessageSend = async () => {
    if (!content.trim()) return

    // temporary optimistic message
    setMessages((prev) => [
      ...prev,
      {
        content,
        createdAt: new Date(),
        status: "unsent",
        fromUserId: session?.user.id,
        edited: false,
        editedAt: null,
      },
    ])

    callAPI(false)
    setContent("")

    try {
      const res = await fetch("/api/dm/message", {
        method: "POST",
        body: JSON.stringify({ content, to, dmId }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error || "Unexpected error occurred!")
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="relative h-full w-full">
      <div className="mt-5 flex flex-col gap-2 w-full">
        {messages.map((m, i) => {
          const own = m.fromUserId === session?.user.id

          return (
            <div
              key={i}
              className={`flex flex-col w-full ${own ? "items-end" : ""}`}
            >
              <p
                className={
                  own
                    ? "bg-gray-800 text-white rounded-full w-fit px-2 py-1 text-sm"
                    : "bg-gray-100 rounded-full w-fit px-2 py-1 text-sm"
                }
              >
                {m.content}
              </p>

              <span className="text-[10px]">
                {new Date(m.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                • {m.status}
              </span>
            </div>
          )
        })}

        {userTyping && (
          <div>
            <p className="bg-gray-800 text-white rounded-full w-fit px-2 py-1 text-sm">
              <div className="typing-indicator">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </p>
          </div>
        )}
      </div>

      <div className="bg-white fixed bottom-0 w-full pb-3 pt-1">
        <Input
          value={content}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleMessageSend()}
          placeholder="Type a message..."
          className="p-5 rounded-full w-[70vw] z-[56]"
        />
      </div>
    </div>
  )
}

export default ChatUI
