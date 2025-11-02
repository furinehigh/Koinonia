import React from 'react'

import CommHome from '@/components/community/home'
import { getAllPosts } from '@/lib/data/post'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
async function CummunityPage({ params }: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)
  const posts = await getAllPosts(params.slug, session?.user.id)
  return (
    <CommHome posts={posts || []} />
  )
}

export default CummunityPage