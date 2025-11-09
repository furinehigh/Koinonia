import { getPost } from '@/lib/data/post'
import React from 'react'
import NotFound from './not-found'
import { Post } from '@/types'
import PostPage from '@/components/post/PostPage'
import { getAllPostComments, getAllUserComments } from '@/lib/data/comments'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function page({ params }: {
  params: { postId: string }
}) {
  const postId = await params.postId
  const session = await getServerSession(authOptions)

  const post = await getPost(postId, session?.user.id || '') as Post
  if (!post) return NotFound();
  const comments = await getAllPostComments(postId, session?.user.id || '')
  return (
    <PostPage post={post} comments={comments} />
  )
}

export default page
