'use client'
import React, { useState } from 'react'
import {
    Card,
    CardContent
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { toast } from 'sonner'
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select"


function Friends({ initialFriends }: {
    initialFriends: any[]
}) {
    const sortFriends = (arr: any[]) => {
        const order = { pending: 0, accepted: 1, blocked: 2 }
        return [...arr].sort((a, b) => order[a.status] - order[b.status])
    }
    const [friends, setFriends] = useState<any[]>(sortFriends(initialFriends))
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'blocked'>('all')
    const [sortByName, setSortByName] = useState<'asc' | 'desc' | null>(null)
    const [loading, setLoading] = useState(false)

    const handleFriendshipAction = async (id: string, action: 'block' | 'accept' | 'undo') => {
        try {
            setLoading(true)
            const res = await fetch('/api/friends/actions', {
                method: 'PUT',
                body: JSON.stringify({ action, id })
            })

            const data = await res.json()
            if (data.error || !res.ok) {
                toast.error(data.error || 'Unexpected error occurred!!')
                return;
            }
            if (action == 'accept') {
                toast.success('Successfully accepted the request!')
            } else if (action == 'block') {
                toast.success("Successfully blocked the friend!")
            } else {
                toast.success('Undone the friends blocking!')
            }
            setFriends(prev =>
                sortFriends(
                    prev.map(f => f.id == id ? { ...f, status: action == 'block' ? 'blocked' : action == 'undo' ? 'accepted' : 'accepted' } : f)
                )
            )

        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const processedFriends = friends
        .filter(f => {
            if (filter !== 'all' && f.status !== filter) return false
            return f.requester.name.toLowerCase().includes(search.toLowerCase())
        })
        .sort((a, b) => {
            if (!sortByName) return 0
            return sortByName === 'asc'
                ? a.requester.name.localeCompare(b.requester.name)
                : b.requester.name.localeCompare(a.requester.name)
        })


    return (
        <div className=''>
            <h1 className='text-xl font-semibold'>Your friends</h1>
            <div className="mt-4 flex gap-3 items-center ">
                <Input
                    placeholder="Search friends..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full"
                />

                <Select
                    value={filter}
                    onValueChange={(v: any) => setFilter(v)}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={sortByName || " "}
                    onValueChange={(v: any) => setSortByName(v || null)}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by name" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value=" ">None</SelectItem>
                        <SelectItem value="asc">A → Z</SelectItem>
                        <SelectItem value="desc">Z → A</SelectItem>
                    </SelectContent>
                </Select>
            </div>


            {processedFriends?.length == 0 && (
                <div className='mt-5'>
                    <p className='text-xs'>No results for the current filter..</p>
                </div>
            )}

            <div className='mt-5 flex flex-col gap-2'>
                {processedFriends.map((f, i) => (
                    <Card className={`rounded shadow-none py-2 ${f.status == 'blocked' ? 'bg-gray-50' : f.status == 'pending' ? 'border-2' : ''}`}>
                        <CardContent className='px-2'>
                            {f.status == 'pending' && <p className='mb-2 text-xs'>Friend request by</p>}
                            <div className='flex justify-between items-center'>
                                <Link href={'/u/' + f.requester.username} className='flex gap-2 items-center hover:underline transition duration-200'>
                                    <Avatar>
                                        <AvatarImage src={f.requester.image || 'logo.png'} />
                                        <AvatarFallback>{f.requester.name.slice(0, 3)}</AvatarFallback>
                                    </Avatar>
                                    <h1>{f.requester.name}</h1>
                                </Link>
                                {f.status == 'pending' ? <div className='flex gap-2 text-xs'>
                                    <button onClick={() => handleFriendshipAction(f.id, 'block')} disabled={loading} className='rounded border px-2 py-1 disabled:opacity-70 disabled:bg-gray-100 hover:bg-gray-100'>Block</button>
                                    <button onClick={() => handleFriendshipAction(f.id, 'accept')} disabled={loading} className='rounded border disabled:opacity-70 disabled:bg-gray-700 px-2 bg-gray-900 text-white hover:bg-gray-700'>Accept</button>
                                </div> : f.status == 'blocked' ? <div className='flex gap-2 text-xs'>
                                    <p className='px-2 py-1'>Blocked</p>
                                    <button onClick={() => handleFriendshipAction(f.id, 'undo')} disabled={loading} className='rounded border disabled:opacity-70 disabled:bg-gray-700 px-2 bg-gray-900 text-white hover:bg-gray-700'>Unblock</button>
                                </div> : <div className='flex gap-2 text-xs'>
                                    <Link href={f.id} className='rounded border px-2 py-1 hover:bg-gray-100'>Message</Link>
                                    <button onClick={() => handleFriendshipAction(f.id, 'block')} disabled={loading} className='rounded border disabled:opacity-70 disabled:bg-gray-700 px-2 bg-gray-900 text-white hover:bg-gray-700'>Block</button>
                                </div>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Friends