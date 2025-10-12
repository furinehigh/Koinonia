import { getAllSpells } from '@/lib/data/spells'
import React from 'react'
import NotFound from './not-found'

async function page() {

    const spells = await getAllSpells()
    if (!spells) return NotFound();

    return (
        <div>

        </div>
    )
}

export default page
