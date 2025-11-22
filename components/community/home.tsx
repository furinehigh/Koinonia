'use client'
import React, { useEffect, useState } from 'react'
import { Ban, Loader2, MessageSquare, Signal, SignalHigh, SignalLow, Wand } from 'lucide-react'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import '@/styles/flamebutton.scss'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import UserPopup from '../user/UserPopup'
import FrameworkPanel from '@/components/framework/panel' // <— new

function CommHome({ posts }: { posts: Post[] }) {
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({})
  const [localPosts, setLocalPosts] = useState(posts)
  const router = useRouter()
  const [approvalLoading, setApprovalLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('userVotes')
    if (saved) setUserVotes(JSON.parse(saved))
  }, [])

  const saveVotes = (votes: typeof userVotes) => {
    setUserVotes(votes)
    localStorage.setItem('userVotes', JSON.stringify(votes))
  }

  const handleVote = async (postId: string, action: 'upvote' | 'downvote') => {
    const isUp = action === 'upvote'
    const current = userVotes[postId] ?? null
    const newVote = current === (isUp ? 'up' : 'down') ? null : isUp ? 'up' : 'down'

    let delta = 0
    let serverAction: string | undefined

    if (current === 'up' && newVote === null) { serverAction = 'undo-upvote'; delta = -1 }
    else if (current === 'down' && newVote === null) { serverAction = 'undo-downvote'; delta = +1 }
    else if (current === 'up' && newVote === 'down') { serverAction = 'up-downvote'; delta = -2 }
    else if (current === 'down' && newVote === 'up') { serverAction = 'down-upvote'; delta = +2 }
    else if (current === null && newVote === 'up') { serverAction = 'upvote'; delta = +1 }
    else if (current === null && newVote === 'down') { serverAction = 'downvote'; delta = -1 }

    setLocalPosts(prev => prev.map(p => (p.id === postId ? { ...p, votes: p.votes + delta } : p)))
    saveVotes({ ...userVotes, [postId]: newVote })

    try {
      await fetch('/api/post/actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: serverAction }),
      })
    } catch (e) {
      console.error('vote error', e)
    }
  }

  const handlePostApproval = async (id: string) => {
    try {
      setApprovalLoading(true)
      const res = await fetch('/api/post/approve', {
        method: 'PUT',
        body: JSON.stringify({ approve: true, id })
      })
      const data = await res.json()

      if (data.error) return toast.error(data.error)

      setLocalPosts(localPosts.map(p => p.id === data.res.id ? { ...p, isApproved: true } : p))
    } catch (e: any) {
      toast.error("Error approving post!", { description: e.message })
    } finally {
      setApprovalLoading(false)
    }
  }

  const castSpell = async (postId: string, spellName: string) => {
    try {
      const res = await fetch('/api/spell/cast', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: postId, spellName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      toast.success("Spell casted!", { description: `You’ve casted ${spellName}` })
    } catch (err: any) {
      toast.error("Spell cast failed!", { description: err.message })
    } finally {
      router.refresh()
    }
  }

  return (
    <div className='flex flex-col'>

      {/* Announcement */}
      <div className='mt-5 mb-2'>
        <h1 className='font-semibold tracking-wide text-sm uppercase opacity-70'>Announcements</h1>
        <FrameworkPanel className='w-xs mt-3'>
          <div className='font-semibold text-base tracking-tight mb-1'>Welcome</div>
          <div className='text-sm opacity-70'>
            Glad you're here. Participate, share and earn Mana.
          </div>
        </FrameworkPanel>
      </div>

      {/* Posts */}
      <div className='my-5'>
        <h1 className='font-semibold tracking-wide text-sm uppercase opacity-70'>Signals</h1>

        {localPosts.length === 0 && <div className='opacity-60 text-sm mt-3'>No signals found here.</div>}

        {localPosts.map(p => (
          <FrameworkPanel key={p.id} className='mt-4'>

            {/* Header */}
            <div className='flex justify-between border-b pb-2 mb-2'>
              <UserPopup user={p.isDeleted ? {} : p.author}>
                <Link className='flex items-center gap-2 group' href={p.isDeleted ? '#' : `/u/${p.author.username}`}>
                  <img src={p.author.image || 'logo.png'} className='h-8 w-8 border object-cover' />
                  <div>
                    <span className='font-medium text-sm group-hover:underline'>
                      {p.isDeleted ? 'Deleted user' : p.author.name}
                    </span>
                    <div className='text-[10px] opacity-60'>
                      {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </Link>
              </UserPopup>

              {/* Spell + Vote state */}
              {p.isApproved ? (
                <DropdownMenu>
                  <DropdownMenuTrigger disabled={p.isDeleted} className='cursor-pointer'>
                    <div className='flex gap-2 items-center'>
                      <Button variant='ghost' size='sm'>
                        <Wand className='h-4 w-4' />
                      </Button>
                      <div className='text-xs opacity-60'>
                        {p.votes <= 0 ? 'weak' :
                          p.votes < 3 ? 'stable' :
                            p.votes < 6 ? 'strong' : 'boosted'}
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Spell Action</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => castSpell(p.id, 'Rage Spell')}>Rage Spell</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => castSpell(p.id, 'Heal Spell')}>Heal Spell</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => handlePostApproval(p.id)}>
                  {approvalLoading ? <Loader2 className='animate-spin' /> : 'Approve'}
                </Button>
              )}
            </div>

            {/* Body */}
            {!p.isDeleted && (
              <>
                <Link href={`/n/${p.community?.slug}/post/${p.id}`} className='font-semibold text-lg tracking-tight'>
                  {p.title}
                </Link>
                <p className='text-sm opacity-70 mt-1'>{p.content}</p>
              </>
            )}

            {p.imageUrl && !p.isDeleted && (
              <img src={p.imageUrl} className='mt-3 border max-h-[30vh] object-cover' />
            )}

            {/* Footer */}
            <div className='border-t mt-3 pt-3 text-xs flex justify-between'>
              <div className='flex items-center gap-2'>
                <span>{p.votes}</span>

                <SignalHigh
                  onClick={() => !p.isDeleted && handleVote(p.id, 'upvote')}
                  className='cursor-pointer border p-0.5'
                />
                <SignalLow
                  onClick={() => !p.isDeleted && handleVote(p.id, 'downvote')}
                  className='cursor-pointer border p-0.5'
                />
              </div>

              <div className='opacity-60 flex gap-1 items-center'>
                <MessageSquare size={14} />
                {p._count.comments}
              </div>
            </div>
          </FrameworkPanel>
        ))}
      </div>
    </div>
  )
}

export default CommHome
