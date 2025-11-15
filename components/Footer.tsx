'use client'
import { usePathname } from 'next/navigation'
import React from 'react'

function Footer() {
  const pathname = usePathname()

  return (
    <footer hidden={pathname.includes('dm/')} className='border-t p-2 text-xs ml-15 pl-5'>
      Transmitted by <a href="https://hackclub.slack.com/team/U09EDB6U22Y" className="font-semibold hover:border-b transition duration-300">HunterEntity</a> — signal destination: space
    </footer>
  )
}

export default Footer