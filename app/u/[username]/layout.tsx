import React from 'react'

function layout({params, children} :{
  params: {username: string},
  children: React.ReactNode;
}) {

  
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

export default layout
