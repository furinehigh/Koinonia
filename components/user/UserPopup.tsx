'use client'
import React, { useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { formatDistanceToNow } from 'date-fns'
import { CirclePlus, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

function UserPopup({ children, user }: {
    children: React.ReactNode,
    user: any
}) {
    const [loading, setLoading] = useState(false)
    const {data:session} = useSession()

    const handleSendFriendReq = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/friends', {
                method: "POST",
                body: JSON.stringify({ receiverId: user.id })
            })
            const data = await res.json()

            if (!res.ok || data.error) {
                toast.error(data.error || 'Unexpected error occurred!')
                return;
            }

            toast.success("Friend request successfully sent!")
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }
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
                                <h4 className="text-sm font-semibold flex items-center gap-2">{user?.name}
                                    {session?.user.id !== user.id ? <Tooltip>
                                        <TooltipTrigger>
                                            <button className='disabled:opacity-70' onClick={handleSendFriendReq} disabled={loading}>
                                                {loading ? <Loader2 className='animate-spin' size={15} /> : <CirclePlus size={15} />}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Add friend
                                        </TooltipContent>
                                    </Tooltip> : (
                                        <span className='bg-gray-200 rounded px-1 text-[10px] font-normal'>You</span>
                                    )}
                                </h4>
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
