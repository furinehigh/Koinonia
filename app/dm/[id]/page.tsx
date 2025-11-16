import ChatUI from '@/components/DM/ChatUI'
import { authOptions } from '@/lib/auth'
import { getAllMessages, getDMDetails } from '@/lib/data/dm'
import { getServerSession } from 'next-auth'
import React from 'react'

async function page({ params }: {
  params: { id: string }
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const messages = await getAllMessages(id)
  const dm = await getDMDetails(session?.user.id, id)
  const to = dm.requester ? dm?.friendship.reciever.id : dm?.friendship.requester.id
  return (
    <ChatUI dmId={id} initialMessages={messages} to={to}/>
  )
}

export default page
