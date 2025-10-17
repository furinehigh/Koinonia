import React from 'react'

import CommHome from '@/components/community/home'
import { getAllPosts } from '@/lib/data/post'
async function CummunityPage({params}: {
  params: {slug: string}
}) {
    const posts = await getAllPosts(params.slug)
  return (
    <CommHome posts={posts || []}/>
  )
}

export default CummunityPage