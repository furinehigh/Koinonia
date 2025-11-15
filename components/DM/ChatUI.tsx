import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

function ChatUI() {
  return (
    <div className='relative h-full w-full'>
      <div className='mt-5 flex flex-col gap-2 w-full'>
        <p className='bg-gray-100 rounded-full w-fit px-2 py-1 text-sm'>Hello</p>
        <p className='bg-gray-800 text-white ml-auto rounded-full w-fit px-2 py-1 text-sm'>Hi</p>
      </div>
      <div className='bg-white fixed bottom-0 w-full pb-3 pt-1'>
        <Input placeholder='Type a message...' className='p-5 rounded-full w-[70vw] z-[56]' />
      </div>
    </div>
  )
}

export default ChatUI