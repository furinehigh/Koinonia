'use client'
import Loader from '@/components/Loader'
import { Ghost, User } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import React, { useState } from 'react'
import { FaGithub } from 'react-icons/fa'

function SignIn() {
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()

  if (session?.user) {
    redirect('/')
  }
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-gray-600">
          Sign in to get access to all the networks.
        </p>
      </div>
      <div className='mt-5'>
        <button disabled={loading} onClick={() => {
          setLoading(true)
          signIn('github', {
            uId: `${session?.user.id || ''}`
          })
        }} className='rounded border w-md justify-center h-10 flex items-center cursor-pointer'>{loading ? <Loader size={32} className='' /> : (<><FaGithub size={20} className='mr-2' /> SignIn with GitHub</>)}</button>
        <button disabled={loading} onClick={() => {
          setLoading(true)
          signIn('credentials')
        }} className='rounded mt-2 border w-md justify-center h-10 flex items-center cursor-pointer'>{loading ? <Loader size={32} className='' /> : (<><Ghost size={20} className='mr-2' /> Continue as Ghost</>)}</button>

      </div>
    </div>
  )
}

export default SignIn
