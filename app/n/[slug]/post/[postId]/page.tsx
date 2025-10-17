import { getPost } from '@/lib/data/post'
import React from 'react'
import NotFound from './not-found'
import { Post } from '@/types'
import PostPage from '@/components/post/PostPage'

async function page({params}: {
  params: {postId: string}
}) {
  const postId = await params.postId

  const post = await getPost(postId) as Post
  if (!post) return NotFound();
  return (
    <PostPage post={post} />
  )
}

export default page
