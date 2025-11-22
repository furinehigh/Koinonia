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
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const messageRef = useRef(new Map())
  const alreadyRead = useRef(new Set<string>())


  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    // smooth scroll? sure, why not.
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages])

  const generateSecureId = (len = 32) => {
    const arr = new Uint8Array(len)
    crypto.getRandomValues(arr)
    return Array.from(arr, v => v.toString(16).padStart(2, "0")).join("")
  }



  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("wss://wss.community.dishis.tech", {
        transports: ["websocket"],
      })
    }

    const s = socketRef.current

    // new message from other user
    s.on("message-created", (data) => {
      if (data.dmId === dmId) {
        if (data.from == to) {
          setMessages((prev) => [...prev, { ...data, fromUserId: data.from }])
        }
        if (data.to == session?.user.id)
          changeMessageStatus('delivered', data.id)
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
      s.off("message-status")
    }
  }, [dmId])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("wss://wss.community.dishis.tech", {
        transports: ["websocket"],
      })
    }

    const s = socketRef.current

    s.on("message-status", (data) => {
      if (data.dmId !== dmId) return;
      setMessages(prev =>
        prev.map(m =>
          m.id === data.messageId
            ? { ...m, status: data.status, readAt: data.readAt }
            : m
        )
      )
    })

    return () => {
      s.off("message-status")
    }
  }, [])  // <--- no messages dependency


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
    let drafts = localStorage.getItem("message-drafts")
    let parsedDrafts = JSON.parse(drafts) as Array<any> || []
    if (parsedDrafts.some(d => d.dmId == dmId)) {
      parsedDrafts = parsedDrafts.map(d => d.dmId == dmId ? { ...d, content: e.target.value } : d)
      localStorage.setItem('message-drafts', JSON.stringify(parsedDrafts))
    } else {
      localStorage.setItem('message-drafts', JSON.stringify([...parsedDrafts, { dmId, content: e.target.value }]))
    }

    if (stopTimeout.current) clearTimeout(stopTimeout.current)

    stopTimeout.current = setTimeout(() => {
      callAPI(false)
    }, 1200)
  }

  useEffect(() => {
    let drafts = localStorage.getItem("message-drafts")
    if (drafts) {
      const parsedDrafts = JSON.parse(drafts || '') as Array<any> || []
      if (parsedDrafts) {
        setContent(parsedDrafts.filter(d => d.dmId == dmId)[0].content)
      }
    }
  }, [])

  const handleMessageSend = async () => {
    if (!content.trim()) return

    const messageId = generateSecureId()

    // temporary optimistic message
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        content,
        createdAt: new Date(),
        status: "sent",
        fromUserId: session?.user.id,
        edited: false,
        editedAt: null,
      },
    ])

    callAPI(false)
    setContent("")
    let drafts = localStorage.getItem("message-drafts")
    let parsedDrafts = JSON.parse(drafts) as Array<any> || []
    if (parsedDrafts.some(d => d.dmId == dmId)) {
      parsedDrafts = parsedDrafts.map(d => d.dmId == dmId ? { ...d, content: '' } : d)
      localStorage.setItem('message-drafts', JSON.stringify(parsedDrafts))
    }

    try {
      const res = await fetch("/api/dm/message", {
        method: "POST",
        body: JSON.stringify({ content, to, dmId, id: messageId }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error || "Unexpected error occurred!")
        changeMessageStatus('failed', data.messageId)
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const changeMessageStatus = async (status: string, messageId: string) => {
    setMessages(prev => prev.map(m => m.id == messageId ? { ...m, status } : m))
    try {
      const res = await fetch('/api/dm/message/status', {
        method: "POST",
        body: JSON.stringify({ messageId, status, dmId })
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.errro || "Unexpected error occurred!")
      }
    } catch (e: any) {
      console.log(e.message)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handler = () => {
      const isAtBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 10

      if (isAtBottom) {
        const unread = messages.filter(m => m.fromUserId === to && m.status !== "read")
        unread.forEach(m => changeMessageStatus("read", m.id))
      }
    }

    el.addEventListener("scroll", handler)
    handler() // run once on mount

    return () => el.removeEventListener("scroll", handler)
  }, [messages])



  return (
    <div className="relative h-full">
      <div ref={scrollRef} className="p-5 flex flex-col gap-2 max-h-[75vh] overflow-y-auto">
        {messages.map((m, i) => {
          const own = m.fromUserId === session?.user.id

          return (
            <div
              key={m.id}
              data-id={m.id}
              ref={(el) => messageRef.current.set(m.id, el)}
              className={`flex flex-col w-full ${own ? "items-end" : ""}`}
            >

              <p
                className={
                  own
                    ? "bg-gray-800 text-white rounded-lg w-fit px-2 py-1 text-sm"
                    : "bg-gray-100 rounded-lg w-fit px-2 py-1 text-sm"
                }
              >
                {m?.content}
              </p>

              <span className="text-[10px]">
                {new Date(m.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                <>
                  {m.fromUserId == session?.user.id && (
                    <span>
                      • {m?.status}</span>
                  )}
                </>
              </span>
            </div>
          )
        })}

        {userTyping && (
          <div>
            <p className="bg-gray-100 rounded-lg w-fit px-2 py-1 text-sm">
              <div className="typing-indicator">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </p>
          </div>
        )}
      </div>

      <div className="relative h-full mt-auto w-full flex justify-center">
        <Input
          value={content}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleMessageSend()}
          placeholder="Type a message..."
          className=" p-5 h-8 rounded-full w-full z-[56] mx-3 bg-white"
        />
      </div>
    </div>
  )
}

export default ChatUI
