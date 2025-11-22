import Sidebar from '@/components/DM/Sidebar'
import { authOptions } from '@/lib/auth'
import { getAllDMs } from '@/lib/data/dm'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import React from 'react'

async function layout({ children }: {
    children: React.ReactNode
}) {

    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
        redirect('/signin')
    }

    const dms = await getAllDMs(session.user.id)

    return (
        <div className="flex h-[calc(100vh-60px)] overflow-hidden">
            <Sidebar recentDMs={dms} userId={session.user.id} />
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    )
}

export default layout
