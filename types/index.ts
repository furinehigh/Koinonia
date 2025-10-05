interface Community {
    id: string
    name: string
    description: string
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
}

interface Post {
    title: string
    content: string
    communityId: string
    author: User
    upVote: number
    downVote: number
    views: number
    authorId: string
}

export type { Community, User, Post }