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

}

export type { Community, User }