interface Community {
  id: string
  name: string
  description: string
  moderators: User[]
  slug: string
  membersCount?: number
  creatorId: string
  bannerUrl?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

interface User {
  id: string;
  name: string;
  image: string;
  username: string
  createdAt: string
  mana: {
    mana: number
  }
}

interface Post {
  id: string
  title: string
  content: string
  imageUrl: string
  communityId: string
  author: User
  votes: number
  views: number
  authorId: string
  community?: Community
  edited: boolean
  editedAt: Date
  createdAt: Date
  isDeleted: boolean
  isApproved: boolean
  isRemoved: boolean
  _count: {
    comments: number
  }
}

interface Notification {
  id: string
  title: string
  content: string
  type: string
  level: number
  contentId: string
  slug?: string
  isRead: boolean
  userId: string
  createdAt: Date
}

export type FriendStatus = "pending" | "accepted" | "blocked"

export interface UserLite {
  id: string
  name: string
  username: string
  image?: string | null
}

export interface FriendEntry {
  id: string
  otherUser: UserLite
  isRequester?: boolean
  status: FriendStatus
  isDeleted?: boolean
}


export type { Community, User, Post, Notification }