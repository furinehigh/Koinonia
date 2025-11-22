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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import {
  Empty, EmptyContent, EmptyDescription,
  EmptyHeader, EmptyMedia, EmptyTitle
} from "@/components/ui/empty"
import { toast } from 'sonner'
import { Notification } from '@/types'
import { formatDistanceToNow } from 'date-fns'

function Header() {

  const { data: session } = useSession()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationLoading, setNotificationLoading] = useState(false)
  const router = useRouter()

  const fetchNotification = async () => {
    setNotificationLoading(true)
    try {
      const res = await fetch('/api/user/notifications')
      const data = await res.json()
      if (!res.ok || data.error) return toast.error(data.error)
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
      if (!res.ok || data.error) return toast.error(data.error)

      await fetchNotification()
    } catch (e: any) {
      toast.error('Moderation failed', { description: e.message })
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
      if (!res.ok || data.error) return toast.error(data.error)

      await fetchNotification()
    } catch (e: any) {
      toast.error('Error updating status', { description: e.message })
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[51] bg-white border-b px-4 py-4 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Koinonia
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-3">

          {session ? (
            <>
              {/* Shop */}
              <Link href="/mana-shop">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  Mana <ShoppingCart size={16} />
                </Button>
              </Link>

              {/* Create */}
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm" className="flex items-center gap-1">
                Create <Plus size={16} />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <div className="relative flex items-center">
                    <Bell size={18} />
                    {(notifications || []).some(n => !n.isRead) && (
                      <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-black"></span>
                    )}
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-80 p-0">

                  {/* Header */}
                  <div className="flex items-center justify-between border-b px-3 py-2">
                    <span className="text-xs font-medium">Notifications</span>
                    <button onClick={fetchNotification}>
                      <RefreshCcw size={13} className={`${notificationLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* List */}
                  <div className="max-h-[45vh] overflow-y-auto">

                    {(notifications || []).length === 0 && (
                      <Empty className="py-6">
                        <EmptyHeader>
                          <EmptyMedia variant="icon"><Bell /></EmptyMedia>
                          <EmptyTitle className="text-xs">No Notifications</EmptyTitle>
                          <EmptyDescription className="text-[10px]">
                            You're fully synced. New events will appear here.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}

                    {(notifications || []).map(n => (
                      <div key={n.id} className="border-b px-3 py-3 text-xs hover:bg-neutral-100 transition">
                        
                        {/* Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {n.type === 'comment_review' ? <MessageSquareDashed size={14} /> : <BellDot size={14} />}
                            <div className="flex flex-col">
                              <span className="uppercase text-[9px] opacity-60">{n.type}</span>
                              <span className="opacity-50 text-[9px]">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>

                          {!n.isRead && (
                            <button
                              disabled={notificationLoading}
                              onClick={() => handleMarkAsRead(n.id)}
                              className="border px-2 py-0.5 rounded text-[10px] hover:bg-neutral-200"
                            >
                              Mark read
                            </button>
                          )}
                        </div>

                        <Link href={n.slug || '#'} className="block mb-2">
                          <p className="font-medium text-[11px]">{n.title}</p>
                          <p className="opacity-60 text-[10px]">{n.content}</p>
                        </Link>

                        {n.type === 'comment_review' && (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={notificationLoading}
                              onClick={() => handleCommentModAction('approve', n.contentId, n.id)}
                              className="border px-2 py-0.5 rounded text-[10px]"
                            >
                              Approve
                            </button>
                            <button
                              disabled={notificationLoading}
                              onClick={() => handleCommentModAction('reject', n.contentId, n.id)}
                              className="border px-2 py-0.5 rounded text-[10px] text-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Image src={session.user.image || "/user-placeholder.png"} width={26} height={26} className="border object-cover" alt="user" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="text-xs">
                    <p>{session.user.name}</p>
                    <span className="opacity-50">{session.user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/u/' + session.user.username)}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </>
          ) : (
            <Link href="/signin">
              <button className="text-sm border px-3 py-1">Sign in</button>
            </Link>
          )}
        </div>
      </header>

      <CreateCommunityDialog isOpen={isDialogOpen} handleOpenChange={setIsDialogOpen} />
    </>
  )
}

export default Header
