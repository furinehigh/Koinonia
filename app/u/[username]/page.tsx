import { getRecentPosts, getUser, getUserActivities, getUserCommunities } from '@/lib/data/user'
import React from 'react'
import UserPage from '@/components/user/UserPage'
import NotFound from './not-found'

async function page({params} : {
  params: {username: string}
}) {
  const username = (await params).username
  const user = await getUser(username)
  if (!user) return NotFound();

  const communities = await getUserCommunities(username)
  const recentPosts = await getRecentPosts(username)
  const activities = await getUserActivities(user.id)
  return (
    <UserPage user={user} communities={communities} recentPosts={recentPosts} activities={activities} />
  )
}

export default page