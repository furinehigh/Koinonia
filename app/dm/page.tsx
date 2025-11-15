import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import React from 'react'

async function page() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !session.user.id){
    redirect('/signin')
  }

  redirect('/dm/friends')
}

export default page