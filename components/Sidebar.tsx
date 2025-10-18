'use client'
import { Home, Settings, UsersRound } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Community } from '@/types'
import Image from 'next/image'
import { useUserStore } from '@/store/useUserStore'
import Link from 'next/link'
import '@/styles/flame.scss'

function Sidebar({ recentCommunities, userSpells }: { recentCommunities: Community[], userSpells: any[] }) {
  const [expanded, setExpanded] = useState(false)
  const { mana, fetchMana } = useUserStore()
  console.log(userSpells)

  useEffect(() => {
    fetchMana()
  }, [])

  return (
    <div className='fixed z-50 mt-15 border-r h-[95vh] p-3 w-fit dark:bg-black bg-white flex flex-col justify-between'>
      <div className='flex flex-col space-y-2 justify-center w-full items-center'>
        <Link href={'/'} className='cursor-pointer rounded p-1'>
          <Home />
        </Link>
        <div className='cursor-pointer rounded p-1'>
          <UsersRound />
        </div>
        <div className='cursor-pointer rounded p-1'>
          <Settings />
        </div>
        <div className='w-[80%] mx-auto my-2 border-b'></div>
        {recentCommunities.map((c, i) => (
          <div key={i} className='cursor-pointer'>
            <Image src={c.avatarUrl || 'comm_placeholder.png'} width={20} height={20} alt={c.name} />
          </div>
        ))}
      </div>
      <div>
        <h1 className='font-semibold text-sm border-t py-2'>Spells</h1>
        <div className='rounded border flex-col'>
          {userSpells.map((s, i) => (
            <div className='flex flex-col text-center text-sm border-b p-1'>
              <span className='font-semibold'>{s.count}</span>
              {s.spellName?.split(' ')[0]}
            </div>
          ))}
        </div>
      </div>

      {/*  Fire + Mana Display */}
      <div className='relative flex flex-col items-center text-sm'>
        <div className="fire">
          <div className="flames">
            <div className="flame"></div>
            <div className="flame"></div>
            <div className="flame"></div>
            <div className="flame"></div>
          </div>
          {/* Mana glowing over fire */}
          <div className="mana-glow">{mana}</div>
        </div>
        <p className='font-semibold mt-2'>Mana</p>
      </div>
    </div>
  )
}

export default Sidebar
