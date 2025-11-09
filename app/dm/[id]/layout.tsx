import React from 'react'

async function layout({ params, children }: {
    params: { id: string },
    children: React.ReactNode
}) {
    const { id } = await params
    return (
        <div className='w-full'>
            <div className='border-b w-full py-2'>
                <div className='flex gap-2 items-center'>
                    <div className='h-10 w-10 rounded border overflow-hidden'>
                        <img src={'/logo.png'} alt='new' />
                    </div>
                    <span>Test User</span>
                </div>
            </div>
            <div>

                {children}
            </div>
        </div>
    )
}

export default layout
