'use client'
import React, { useState } from 'react'
import { Spell } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/useUserStore'
import { toast } from 'sonner'

interface ManaShopClientProps {
  spells: Spell[]
}

export default function ManaShopClient({ spells }: ManaShopClientProps) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [owned, setOwned] = useState<{ [key: string]: boolean }>({})
  const { mana, updateMana } = useUserStore()

  const handleBuy = async (spellId: string, price: number, name: string) => {
    if (mana < price) return alert('Not enough mana!')
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
        toast.success('Spell Bought Successfully!', {description: `You've successfully bought ${name}`})
      } else {
        toast.error("Error buying spell!", {description: data.error})
      }
    } catch (e: any) {
        toast.error("Error buying spell!", {description: e.message})
    } finally {
      setLoading(prev => ({ ...prev, [spellId]: false }))
    }
  }

  return (
    <div className='space-y-6 w-full'>
      <h1 className="text-3xl font-bold text-center">🪄 Mana Shop</h1>
      <p className="text-center text-muted-foreground">
        Balance: <span className="font-semibold text-blue-600">{mana ?? 0}</span> Mana
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {spells.map(spell => (
          <Card key={spell.id} className="rounded-lg shadow hover:shadow-lg transition duration-200">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{spell.name}</span>
                <span className="text-sm text-blue-600 font-semibold">{spell.price} Mana</span>
              </CardTitle>
              <CardDescription>{spell.effect}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full flame-button"
                disabled={loading[spell.id] || owned[spell.id] || mana < spell.price}
                onClick={() => handleBuy(spell.id, spell.price, spell.name)}
              >
                {owned[spell.id] ? 'Owned' : loading[spell.id] ? 'Buying...' : 'Buy Spell'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
