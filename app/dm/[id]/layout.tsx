import NotFound from '@/app/not-found'
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

    if (!dm) {
        return NotFound()
    }

    const user = dm.requester ? dm?.friendship.reciever : dm?.friendship.requester
    return (
        <div className='w-full'>
            <div className='border-b w-full py-2'>
                <div className='flex gap-2 items-center'>
                    <div className='h-10 w-10 rounded border overflow-hidden'>
                        <img src={user.image || '/logo.png'} alt='new' />
                    </div>
                    <span>{user.name}</span>
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}

export default layout
