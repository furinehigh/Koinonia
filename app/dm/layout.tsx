import Sidebar from '@/components/DM/Sidebar'
import React from 'react'

function layout({ children }: {
    children: React.ReactNode
}) {
    return (
        <div className='flex'>
            <Sidebar recentDMs={[
                {
                    id: 'new',
                    reciever: {
                        avatarUrl: '',
                        name: 'Test User'
                    }
                },{
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
