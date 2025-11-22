"use client"
import { Home, MessageSquareText, Settings } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Community } from '@/types'
import Link from 'next/link'
import { useUserStore } from '@/store/useUserStore'
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

function Sidebar({ recentCommunities, userSpells, isDisabled = false }: { recentCommunities: Community[], userSpells: any[], isDisabled?: boolean }) {
  const { mana, fetchMana } = useUserStore()

  useEffect(() => {
    fetchMana()
  }, [])

  return (
    <div hidden={isDisabled}
      className="fixed z-50 mt-14 border-r h-[95vh] px-3 py-4 w-fit bg-white flex flex-col justify-between text-neutral-900">
      
      {/* Navigation */}
      <div className="flex flex-col items-center gap-4">
        {[{ href: '/', icon: <Home /> }, { href: '/settings', icon: <Settings /> }, { href: '/dm', icon: <MessageSquareText /> }]
          .map((i, idx) => (
            <Link
              key={idx}
              href={i.href}
              className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
            >
              {i.icon}
            </Link>
          ))}

        <div className="border-b w-10 opacity-30"></div>

        {recentCommunities.map((c) => (
          <Tooltip key={c.slug}>
            <TooltipTrigger>
              <Link href={`/n/${c.slug}`} className="border p-[2px] hover:border-black transition">
                <img src={c.avatarUrl || '/logo.png'} className="h-8 w-8 object-cover" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>{c.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Spells & Mana Section */}
      <div className="flex flex-col gap-3 w-full">
        <p className="text-xs uppercase tracking-wide opacity-70 border-t pt-2">Inventory</p>

        <div className="grid grid-cols-2 gap-1 border">
          {userSpells.map((s, i) => (
            <div key={i} className="text-center py-1 border-r last:border-r-0 border-b last:border-b-0 text-xs">
              <span className="font-semibold">{s.count}</span>
              <br />
              {s.spellName?.split(' ')[0]}
            </div>
          ))}
        </div>

        {/* Pixel mana cell */}
        <div className="framework-fire">
  <div className="core"></div>
  <div className="flame"></div>
  <div className="flame"></div>
  <div className="flame"></div>
  <div className="mana-readout">{mana}</div>
</div>

      </div>
    </div>
  )
}

export default Sidebar
