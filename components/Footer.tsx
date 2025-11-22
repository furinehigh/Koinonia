'use client'
import { usePathname } from 'next/navigation'
import React from 'react'

function Footer() {
  const pathname = usePathname()

  return (
    <footer
      hidden={pathname.includes('dm/')}
      className="ml-19 px-6 py-3 text-[11px] text-neutral-500 border-t border-neutral-200/60 backdrop-blur-sm"
    >
      <span className="opacity-80">
        Transmitted by&nbsp;
      </span>
      <a
        href="https://hackclub.slack.com/team/U09EDB6U22Y"
        className="font-medium hover:text-neutral-800 transition duration-200 underline-offset-2 hover:underline"
      >
        HunterEntity
      </a>
      <span className="opacity-80">&nbsp;— signal confirmed</span>
    </footer>
  )
}

export default Footer
