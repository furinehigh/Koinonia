// app/c/[name]/page.tsx or layout.tsx (server component)
import { communityData, handleJoinCommunity, handleLeaveCommunity } from '@/lib/data/community'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import CommLayout from '@/components/community/layout'
import { redirect } from 'next/navigation'
import NotFound from './not-found'

export default async function CommunityLayout({ params, children }: any) {
    const slug = params.slug
    const session = await getServerSession(authOptions)
    const community = await communityData(slug, session?.user?.id || '')
    if (!community) return NotFound()

    async function handleJoin() {
        'use server'
        if (!session?.user) redirect('/signin')
        await handleJoinCommunity(community.id, session?.user.id)
    }

    async function handleLeave() {
        'use server'
        if (!session?.user) redirect('/signin')
        await handleLeaveCommunity(community.id, session?.user.id)
    }

    return <CommLayout community={community} handleJoin={handleJoin} handleLeave={handleLeave}>
        {children}
    </CommLayout>
}
