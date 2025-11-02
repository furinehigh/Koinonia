import Moderation from '@/components/community/Moderation'
import { authOptions } from '@/lib/auth'
import { getModSettings } from '@/lib/data/comments'
import { getServerSession } from 'next-auth'
import React from 'react'

async function page({params}:{
    params: {slug: string}
}) {
    const {slug} = await params
    const session = await getServerSession(authOptions)
    const modSettings = await getModSettings(slug, session?.user.id)
    if (!modSettings) {
        return <div className='text-xs m-5'>You are not a moderator of this community :(</div>
    }
    return (
        <Moderation settings={modSettings}/>
    )
}

export default page
