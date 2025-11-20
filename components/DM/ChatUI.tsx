'use client'
import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { io } from 'socket.io-client'

function ChatUI({ dmId, initialMessages, to }: { dmId: string, initialMessages: any[], to: string }) {
  const [messages, setMessages] = useState(initialMessages)
  const [content, setContent] = useState('')
  const { data: session } = useSession()

  const handleMessageSend = async () => {
    try {
      if (content == '') {
        return;
      }
      setMessages(prev => ([
        ...prev,
        {
          content,
          createdAt: new Date,
          status: 'unsent',
          fromUserId: session?.user.id,
          edited: false,
          editedAt: null
        }
      ]))

      setContent('')

      const res = await fetch('/api/dm/message', {
        method: "POST",
        body: JSON.stringify({ content, to, dmId })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error || 'Unexpected error occurred!')
        return;
      }


    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const socket = io('wss://wss.community.dishis.tech')

  useEffect(() => {
    socket.on('message-created', (data) => {
      if (data.dmId == dmId)
        setMessages(prev => ([
          ...prev,
          {
            content: data.content,
            createdAt: data.createdAt,
            status: data.status,
            fromUserId: data.from,
            edited: false,
            editedAt: null
          }
        ]))
    })
  }, [])
  return (
    <div className='relative h-full w-full'>
      <div className='mt-5 flex flex-col gap-2 w-full'>
        {messages.map((m, i) => {
          let className = ''
          if (m.fromUserId == session?.user.id) {
            className = 'bg-gray-800 text-white rounded-full w-fit px-2 py-1 text-sm'
          } else {
            className = 'bg-gray-100 rounded-full w-fit px-2 py-1 text-sm'
          }
          return (
            <div className={`flex flex-col w-full ${m.fromUserId == session?.user.id ? 'items-end' : ''}`}>
              <p className={className}>
                {m.content}
              </p>
              <span className='text-[10px] '>{new Date(m.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })
              } • {m.status}</span>
            </div>

          )
        })}
      </div>
      <div className='bg-white fixed bottom-0 w-full pb-3 pt-1'>
        <Input onKeyDown={(k) => {
          if (k.key == "Enter") {
            handleMessageSend()
          }
        }} value={content} onChange={(e) => setContent(e.target.value)} placeholder='Type a message...' className='p-5 rounded-full w-[70vw] z-[56]' />
      </div>
    </div>
  )
}

export default ChatUI