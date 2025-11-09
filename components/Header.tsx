'use client'
import { Bell, BellDot, MessageSquareDashed, Plus, RefreshCcw, ShoppingCart } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import CreateCommunityDialog from './dialog/create-community'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { toast } from 'sonner'
import { Notification } from '@/types'
import { Badge } from './ui/badge'
import { formatDistanceToNow } from 'date-fns'

function Header() {
    const { data: session, status } = useSession()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [notificationLoading, setNotificationLoading] = useState(false)
    const router = useRouter()

    const fetchNotification = async () => {
        setNotificationLoading(true)
        try {
            const res = await fetch('/api/user/notifications')
            const data = await res.json()
            if (!res.ok || data.error) {
                toast.error(data.error)
                return;
            }

            setNotifications(data)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setNotificationLoading(false)
        }
    }

    useEffect(() => {
        fetchNotification()
    }, [])

    const handleCommentModAction = async (action: 'approve' | 'reject', contentId: string, notificationId: string) => {
        try {
            setNotificationLoading(true)
            const res = await fetch('/api/comment/review', {
                method: 'PUT',
                body: JSON.stringify({ action, contentId, notificationId })
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                toast.error(data.error)
                return;
            }

            await fetchNotification()
        } catch (e: any) {
            toast.error('Error occurred while moderating..', { description: e.message })
        }
    }

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            setNotificationLoading(true)
            const res = await fetch('/api/user/notifications', {
                method: 'PUT',
                body: JSON.stringify({ notificationId })
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                toast.error(data.error)
                return;
            }

            await fetchNotification()
        } catch (e: any) {
            toast.error('Error occurred while marking as read..', {description: e.message})
        }
    }
    return (
        <>
            <div className='fixed w-full z-[51] dark:bg-black bg-white border-b p-3 flex justify-between items-center'>
                <div>
                    <Link href={'/'} className='font-extrabold text-2xl'>
                        Koinonia
                    </Link>
                </div>
                <div className='flex space-x-2 items-center'>
                    {session?.user ? (
                        <>
                            <Link href={'/mana-shop'}>
                                <Button className='flex items-center space-x-1' variant={'outline'}>
                                    <span>Mana Shop</span> <ShoppingCart className='' />
                                </Button>
                            </Link>
                            <Button onClick={() => setIsDialogOpen(true)} className='flex items-center space-x-1' variant={'outline'}>
                                <span>Create</span> <Plus className='' />
                            </Button>

                            <DropdownMenu >
                                <DropdownMenuTrigger className='cursor-pointer'>
                                    <div className='mx-2 relative flex '>
                                        <Bell size={20} />
                                        {(notifications || []).some(n => !n.isRead) && <span className="absolute right-0 flex size-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-400 opacity-75"></span>
                                            <span className="relative inline-flex size-2 rounded-full bg-gray-500"></span>
                                        </span>}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>
                                        <div className='flex justify-between'>
                                            <h1>Notifications</h1>
                                            <button onClick={fetchNotification}>
                                                <RefreshCcw size={15} className={`${notificationLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div>

                                        {(notifications || []).length == 0 ? <Empty >
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <Bell />
                                                </EmptyMedia>
                                                <EmptyTitle>No Notifications</EmptyTitle>
                                                <EmptyDescription>
                                                    You&apos;re all caught up. New notifications will appear here.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <Button onClick={fetchNotification} variant="outline" size="sm">
                                                    <RefreshCcw className={`${notificationLoading ? 'animate-spin' : ''}`} />
                                                    Refresh
                                                </Button>
                                            </EmptyContent>
                                        </Empty> : (
                                            <div className='w-md'>
                                                {(notifications || []).map((n, i) => (
                                                    <div className='flex flex-col gap-2 p-3 hover:bg-gray-200 '>
                                                        <div className='flex items-center justify-between'>
                                                            <div className='flex gap-2'>

                                                                <span className=''>
                                                                    {n.type == 'comment_review' ? <MessageSquareDashed /> : <BellDot />}
                                                                </span>
                                                                <div className='flex flex-col gap-0'>
                                                                    <span className='rounded text-[10px]'>{n.type}</span>
                                                                    <span className='text-[10px]'>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                                                                </div>
                                                            </div>
                                                            {!n.isRead && <button disabled={notificationLoading} onClick={() => handleMarkAsRead(n.id)} className='text-xs disabled:bg-gray-100 disabled:cursor-wait disabled:opacity-70 rounded border px-2'>Mark as read</button>}
                                                        </div>
                                                        <Link href={n.slug || '#'}>
                                                            <h1 className='text-sm font-semibold'>{n.title}</h1>
                                                            <p className='text-xs opacity-80'>{n.content}</p>
                                                        </Link>
                                                        {n.type == 'comment_review' && <div className='flex gap-2 justify-end'>
                                                            <button disabled={notificationLoading} onClick={() => handleCommentModAction('approve', n.contentId, n.id)} className='text-xs disabled:bg-gray-100 disabled:cursor-wait disabled:opacity-70 rounded border px-2'>Approve</button>
                                                            <button disabled={notificationLoading} onClick={() => handleCommentModAction('reject', n.contentId, n.id)} className='text-xs disabled:bg-gray-100 disabled:cursor-wait disabled:opacity-70 rounded text-red-500'>Reject</button>
                                                        </div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div className='z-[55]'>

                                <DropdownMenu >
                                    <DropdownMenuTrigger className='cursor-pointer mt-2'>
                                        <Image src={session?.user.image || 'user-placeholder.png'} className='rounded' width={30} height={30} alt='user' />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>
                                            <span>
                                                {session?.user.name}
                                            </span>
                                            <p className='text-xs'>{session?.user.email}</p>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push('/u/' + session?.user?.username)}>Profile</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => signOut()}>SignOut</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    ) : (
                        <Link href={'/signin'}>
                            <button className='cursor-pointer font-bold p-2'>
                                <span>SignIn</span>
                            </button>
                        </Link>
                    )}
                </div>
            </div>
            <CreateCommunityDialog isOpen={isDialogOpen} handleOpenChange={setIsDialogOpen} />
        </>
    )
}

export default Header