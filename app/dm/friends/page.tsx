import Friends from '@/components/DM/Friends'
import { authOptions } from '@/lib/auth'
import { getAllUsersFriends } from '@/lib/data/friends'
import { getServerSession } from 'next-auth'
import React from 'react'

async function page() {
  const session = await getServerSession(authOptions)

  const friends = await getAllUsersFriends(session?.user.id)
  return (
    <Friends initialFriends={friends}/>
  )
}

export default page