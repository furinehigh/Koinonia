
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import React from 'react'

async function layout({children}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user.id) {
        redirect('/auth/signin')
    }
  return (
    <div>
      {children}
    </div>
  )
}

export default layout
