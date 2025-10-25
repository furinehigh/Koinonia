import { getPost } from '@/lib/data/post'
import React from 'react'
import NotFound from './not-found'
import { Post } from '@/types'
import PostPage from '@/components/post/PostPage'
import { getAllPostComments, getAllUserComments } from '@/lib/data/comments'

async function page({params}: {
  params: {postId: string}
}) {
  const postId = await params.postId

  const post = await getPost(postId) as Post
  if (!post) return NotFound();
  const comments = await getAllPostComments(postId)
  return (
    <PostPage post={post} comments={comments} />
  )
}

export default page
