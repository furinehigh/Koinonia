'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/useUserStore'
import { toast } from 'sonner'
import FrameworkPanel from './framework/panel'

interface ManaShopClientProps {
  spells: any[]
}

export default function ManaShopClient({ spells }: ManaShopClientProps) {
  const [loading, setLoading] = useState({})
  const [owned, setOwned] = useState({})
  const { mana, updateMana } = useUserStore()

  const handleBuy = async (spellId: string, price: number, name: string) => {
    if (mana < price) return toast.error("Not enough mana.")

    setLoading(prev => ({ ...prev, [spellId]: true }))

    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spellId }),
      })

      const data = await res.json()

      if (data.success) {
        updateMana(mana - price)
        setOwned(prev => ({ ...prev, [spellId]: true }))
        toast.success('Purchased', { description: `${name} added to your inventory.` })
      } else {
        toast.error("Failed", { description: data.error })
      }

    } catch (e) {
      toast.error("Error", { description: e.message })
    } finally {
      setLoading(prev => ({ ...prev, [spellId]: false }))
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Mana Shop</h1>
        <p className="text-[12px] text-neutral-500">
          Balance: <span className="font-semibold text-neutral-800">{mana ?? 0}</span> mana
        </p>
      </div>

      {/* Shop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {spells.map(spell => {
          const disabled = loading[spell.id] || owned[spell.id] || mana < spell.price

          return (
            <FrameworkPanel key={spell.id} className="p-4 flex flex-col gap-4">
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-[14px]">{spell.name}</span>
                <span className="text-[12px] opacity-70">{spell.price} mana</span>
              </div>

              <p className="text-[12px] opacity-70 line-clamp-2">{spell.effect}</p>

              <Button
                disabled={disabled}
                onClick={() => handleBuy(spell.id, spell.price, spell.name)}
                className={`w-full h-[36px] ${
                  owned[spell.id] ? 'bg-neutral-200 text-neutral-600' : ''
                }`}
              >
                {owned[spell.id]
                  ? 'Owned'
                  : loading[spell.id]
                  ? 'Processing...'
                  : 'Acquire'}
              </Button>
            </FrameworkPanel>
          )
        })}
      </div>
    </div>
  )
}
