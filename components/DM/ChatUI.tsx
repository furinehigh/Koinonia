import React from 'react'
import { Input } from '../ui/input'

function ChatUI() {
  return (
    <div className='relative h-full w-full'>
      <div className='fixed bottom-2 w-fit mr-5 z-[56]'>
        <Input placeholder='Type a message...' className='p-5 rounded-full ' />
      </div>
    </div>
  )
}

export default ChatUI