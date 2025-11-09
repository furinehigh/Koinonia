import React from 'react'

async function layout({params, children}:{
    params: {id: string},
    children: React.ReactNode
}) {
    const {id} = await params
  return (
    <div>
        <div>
            <div>
                
            </div>
        </div>
        <div>

      {children}
        </div>
    </div>
  )
}

export default layout
