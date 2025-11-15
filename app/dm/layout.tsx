import Sidebar from '@/components/DM/Sidebar'
import { authOptions } from '@/lib/auth'
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

    return (
        <div className='flex'>
            <Sidebar recentDMs={[
                {
                    id: 'new',
                    reciever: {
                        avatarUrl: '',
                        name: 'Test User'
                    }
                }, {
                    id: 'sdfs',
                    reciever: {
                        avatarUrl: '',
                        name: 'Test User 2'
                    }
                },
            ]} />
            <div className='m-3 w-full'>
                {children}
            </div>
        </div>
    )
}

export default layout
