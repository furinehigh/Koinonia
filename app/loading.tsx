import Loader from '@/components/Loader'
import React from 'react'

function Loading() {
  return (
    <div className='flex justify-center items-center w-full h-full'><Loader className='' size={96} /></div>
  )
}

export default Loading