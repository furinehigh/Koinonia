import NotFound from '@/app/not-found'
import ChatLayout from '@/components/DM/ChatLayout'
import { authOptions } from '@/lib/auth'
import { getDMDetails } from '@/lib/data/dm'
import { getServerSession } from 'next-auth'
import React from 'react'

async function layout({ params, children }: {
  params: { id: string },
  children: React.ReactNode
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const dm = await getDMDetails(session?.user.id, id)
  if (!dm) return NotFound()

  const otherUser = dm.otherUser

  return (
    <ChatLayout otherUser={otherUser} children={children} />
  )
}

export default layout
