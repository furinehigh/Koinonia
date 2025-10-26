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
}

export type { Community, User, Post }