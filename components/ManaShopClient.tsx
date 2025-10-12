'use client'
import React, { useState } from 'react'
import { Spell } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ManaShopClientProps {
  spells: Spell[]
  userMana: number
}

export default function ManaShopClient({ spells, userMana }: ManaShopClientProps) {
  const [mana, setMana] = useState(userMana)
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [owned, setOwned] = useState<{ [key: string]: boolean }>({})

  const handleBuy = async (spellId: string, price: number) => {
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
        setMana(prev => prev - price)
        setOwned(prev => ({ ...prev, [spellId]: true }))
      } else {
        alert(data.error)
      }
    } catch (e) {
      console.error(e)
      alert('Error buying spell')
    } finally {
      setLoading(prev => ({ ...prev, [spellId]: false }))
    }
  }

  return (
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
              onClick={() => handleBuy(spell.id, spell.price)}
            >
              {owned[spell.id] ? 'Owned' : loading[spell.id] ? 'Buying...' : 'Buy Spell'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
