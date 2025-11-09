import React from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { User } from '@/types'
import { formatDistanceToNow } from 'date-fns'

function UserPopup({ children, user }: {
    children: React.ReactNode,
    user: any
}) {
    return (
        <div>
            <HoverCard >
                <HoverCardTrigger asChild>
                    {children}
                </HoverCardTrigger>
                <HoverCardContent align='start' className="w-80">
                    {Object.keys(user).length !== 0 ? <div className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={user.image || 'logo.png'} />
                            <AvatarFallback>{user?.name?.slice(0, 3)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div>
                                <h4 className="text-sm font-semibold">{user?.name}</h4>
                                <p className='text-[10px]'>u/{user?.username}</p>
                            </div>
                            <p className="text-sm">

                            </p>
                            <div className="text-muted-foreground text-xs">
                                Joined {user.createdAt && formatDistanceToNow(new Date(user?.createdAt), { addSuffix: true })}
                            </div>
                        </div>
                    </div> : (
                        <div>Post deleted</div>
                    )}
                </HoverCardContent>
            </HoverCard>

        </div>
    )
}

export default UserPopup
