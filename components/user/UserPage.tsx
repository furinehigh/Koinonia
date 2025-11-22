'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { toast } from 'sonner'
import { CirclePlus, Loader2, Moon } from 'lucide-react'
import io from 'socket.io-client'
import FrameworkPanel from '../framework/panel'

function UserPage({ user, communities, recentPosts, activities, comments }: {
    user: any,
    communities: any[],
    recentPosts: any[],
    activities: any[],
    comments: any[]
}) {  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const [userStatus, setUserStatus] = useState('offline')

  const socket = io('wss://wss.community.dishis.tech')

  useEffect(() => {
    socket.on('user-status-update', (data) => {
      if (data.userId == user.id) setUserStatus(data.status)
    })
  }, [])

  const handleSendFriendReq = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/friends', {
        method: "POST",
        body: JSON.stringify({ receiverId: user.id })
      })
      const data = await res.json()

      if (!res.ok || data.error) return toast.error(data.error)
      toast.success("Friend request sent!")
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-19 p-6 flex gap-6 max-w-full h-full">

      {/* Left section */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* Profile Card */}
        <FrameworkPanel className="p-5 flex gap-4 items-center">

          <div className="h-16 w-16 rounded border overflow-hidden relative">
            <img src={user.image || "/logo.png"} className="object-cover h-full w-full" />

            <span className="absolute bottom-1 right-1 h-3 w-3 flex items-center justify-center">
              {userStatus === "sleep" ? (
                <Moon size={12} className="text-gray-500" />
              ) : userStatus === "online" ? (
                <span className="h-3 w-3 bg-green-500 rounded-full"></span>
              ) : (
                <span className="h-3 w-3 bg-gray-400 rounded-full"></span>
              )}
            </span>
          </div>

          <div className="flex flex-col">
            <h1 className="font-semibold text-2xl flex items-center gap-2">
              {user.name}
              {session?.user.id !== user.id ? (
                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={handleSendFriendReq}
                      disabled={loading}
                      className="opacity-90 hover:opacity-100"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <CirclePlus size={18} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Add friend</TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-xs bg-neutral-200 rounded px-2">You</span>
              )}
            </h1>

            <div className="text-xs flex gap-4 opacity-80">
              <span><b>{user.mana.mana}</b> Mana</span>
              <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </FrameworkPanel>

        {/* Communities created */}
        <FrameworkPanel className="p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Networks Created</h2>
          <div className="flex flex-col gap-2">
            {communities.map(c => (
              <Link key={c.id} href={`/n/${c.slug}`} className="group">
                <div className="p-3 border rounded hover:bg-neutral-50 transition">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="group-hover:underline">{c.name}</span>
                    <span className="text-xs opacity-60">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </FrameworkPanel>

        {/* Recent Posts */}
        <FrameworkPanel className="p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Recent Signals</h2>
          <div className="flex flex-col gap-2">
            {recentPosts.map(p => (
              <Link key={p.id} href={`/n/${p.community.slug}/post/${p.id}`} className="group">
                <div className="p-3 border rounded hover:bg-neutral-50 transition">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="group-hover:underline">{p.title}</span>
                    <span className="text-xs opacity-60">
                      {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{p.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </FrameworkPanel>

        {/* Recent Comments */}
        <FrameworkPanel className="p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Recent Echoes</h2>
          <div className="flex flex-col gap-2">
            {comments.map(c => (
              <Link key={c.id} href={`/n/${c.post.community.slug}/post/${c.post.id}`} className="group">
                <div className="p-3 border rounded hover:bg-neutral-50 transition">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-[13px]">On: {c.post.title}</span>
                    <span className="text-xs opacity-60">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{c.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </FrameworkPanel>

      </div>


      {/* Right Activity Feed */}
      <div className="w-1/3 min-w-[260px]">
        <FrameworkPanel className="p-0">
          <div className="border-b px-4 py-3">
            <h1 className="font-semibold text-sm">Recent Activity</h1>
          </div>

          <div className="p-4 flex flex-col gap-4 text-xs">
            {activities.map((a, i) => (
              <Link key={i} href={a.slug || "#"} className="group">
                <div className="p-3 hover:bg-neutral-50 transition border rounded">
                  <div className="flex justify-between">
                    <span className="px-2 py-[2px] text-[10px] bg-neutral-200 rounded">{a.type}</span>
                    <span className="opacity-60 text-[10px]">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-medium text-sm mt-1 group-hover:underline">{a.title}</p>
                  <p className="text-[11px] opacity-70">{a.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </FrameworkPanel>
      </div>

    </div>
  )
}

export default UserPage
