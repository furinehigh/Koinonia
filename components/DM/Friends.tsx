"use client"

import React, { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import type { FriendEntry, FriendStatus } from "@/types"
import FrameworkPanel from "../framework/panel"

interface FriendsProps {
  initialFriends: FriendEntry[]
}

export default function Friends({ initialFriends }: FriendsProps) {
  const router = useRouter()

  const sortPriority: Record<FriendStatus, number> = {
    pending: 0,
    accepted: 1,
    blocked: 2,
  }

  const sortedInitial = [...initialFriends].sort((a, b) => sortPriority[a.status] - sortPriority[b.status])

  const [friends, setFriends] = useState(sortedInitial)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | FriendStatus>("all")
  const [sorting, setSorting] = useState<"asc" | "desc" | " ">(" ")
  const [loading, setLoading] = useState(false)

  const handleAction = async (id: string, action: "accept" | "block" | "undo" | "remove") => {
    try {
      setLoading(true)

      const res = await fetch("/api/friends/actions", {
        method: "PUT",
        body: JSON.stringify({ action, id }),
      })

      const data = await res.json()

      if (!res.ok || data.error) return toast.error(data.error)

      toast.success(data.message || "Updated")

      setFriends(prev =>
        prev.map(f =>
          f.id === id
            ? {
                ...f,
                status:
                  action === "block"
                    ? "blocked"
                    : action === "accept"
                    ? "accepted"
                    : f.status,
                isDeleted: action === "remove",
              }
            : f,
        ),
      )
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = async (friendshipId: string) => {
    try {
      setLoading(true)
      const res = await fetch("/api/dm", {
        method: "POST",
        body: JSON.stringify({ friendshipId }),
      })

      const data = await res.json()
      if (!res.ok || data.error) return toast.error(data.error)
      router.push(`/dm/${data.data.id}`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const visibleFriends = friends
    .filter(f => !f.isDeleted)
    .filter(f => (filter === "all" ? true : f.status === filter))
    .filter(f => f.otherUser.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (!sorting) return 0
      return sorting === "asc"
        ? a.otherUser.name.localeCompare(b.otherUser.name)
        : b.otherUser.name.localeCompare(a.otherUser.name)
    })

  return (
    <div className="space-y-6 px-4">
      <h1 className="text-lg font-semibold tracking-tight">Friends</h1>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full"
        />

        <Select value={filter} onValueChange={val => setFilter(val as any)}>
          <SelectTrigger className="w-28 text-xs">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sorting || ""} onValueChange={val => setSorting(val || null)}>
          <SelectTrigger className="w-28 text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">None</SelectItem>
            <SelectItem value="asc">A → Z</SelectItem>
            <SelectItem value="desc">Z → A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {visibleFriends.length === 0 && (
        <p className="text-xs opacity-60">No friends match this filter.</p>
      )}

      {/* List */}
      <div className="space-y-3">
        {visibleFriends.map(f => {
          const { otherUser, status, isRequester } = f

          return (
            <FrameworkPanel key={f.id} className="flex justify-between items-center px-4 py-3">

              {/* Profile */}
              <Link href={`/u/${otherUser.username}`} className="flex gap-3 items-center hover:opacity-80 transition">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.image || "/logo.png"} />
                  <AvatarFallback>{otherUser.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{otherUser.name}</span>
              </Link>

              {/* Actions */}
              <div className="flex gap-2 text-xs">
                {status === "pending" && !isRequester && (
                  <>
                    <button
                      className="border rounded px-2 py-1 hover:bg-neutral-100"
                      disabled={loading}
                      onClick={() => handleAction(f.id, "block")}
                    >
                      Block
                    </button>
                    <button
                      className="bg-neutral-900 text-white rounded px-3 py-1 hover:bg-neutral-700"
                      disabled={loading}
                      onClick={() => handleAction(f.id, "accept")}
                    >
                      Accept
                    </button>
                  </>
                )}

                {status === "accepted" && (
                  <>
                    <button
                      onClick={() => handleMessage(f.id)}
                      disabled={loading}
                      className="border rounded px-2 py-1 hover:bg-neutral-100"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => handleAction(f.id, "block")}
                      disabled={loading}
                      className="bg-neutral-900 text-white rounded px-3 py-1 hover:bg-neutral-700"
                    >
                      Block
                    </button>
                  </>
                )}

                {status === "blocked" && (
                  <>
                    <span className="opacity-60 py-1">Blocked</span>
                    <button
                      onClick={() => handleAction(f.id, "undo")}
                      disabled={loading}
                      className="border px-3 rounded hover:bg-neutral-100"
                    >
                      Undo
                    </button>
                  </>
                )}

                {status === "pending" && isRequester && (
                  <>
                    <span className="opacity-60 py-1">Requested</span>
                    <button
                      onClick={() => handleAction(f.id, "remove")}
                      disabled={loading}
                      className="border text-red-600 px-3 rounded hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </FrameworkPanel>
          )
        })}
      </div>
    </div>
  )
}
