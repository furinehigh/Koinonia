'use client'
import { Community } from '@/types'
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import '@/styles/flamebutton.scss'

function CommLayout({ community, handleJoin, handleLeave, children }: {
  community: Community,
  handleJoin: () => void,
  handleLeave: () => void,
  children: React.ReactNode
}) {

  const castSpell = async (spellName: string) => {
    try {
      const res = await fetch('/api/spell/cast', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'community',
          targetId: community.id,
          spellName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      console.log('✨ Spell cast success:', data)
    } catch (err: any) {
      console.error('Spell fizzled:', err.message)
    }
  }

  return (
    <div className="ml-15 flex flex-col">
      <div className="p-4 space-y-4 flex justify-between w-full">
        <div className='w-2/3'>
          <div className='flex space-x-2 items-center border-b w-full p-2'>
            <Link href={'/'} >
              <div className='rounded border p-1 cursor-pointer'>
                <ChevronLeft className='h-5' />
              </div>
            </Link>
            <Link href={'/c/' + community.slug} className='hover:underline underline-offset-2 transition duration-200 flex items-center space-x-1'>
              <div className='h-8 w-8 rounded border overflow-hidden'>
                <img src={community.avatarUrl || '/logo.png'} width={40} height={40} />
              </div>
              <h1 className='text-sm '>c/{community.name}</h1>
            </Link>

            <div className='ml-auto '>
              <Link href={'/c/' + community.slug + '/post/create'} className='mr-2'>
                <Button>Create Post</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className='cursor-pointer mt-2'>
                  <Button className='flame-button'>Cast Spell</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Cast a magical spell</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => castSpell('rage')}>Rage Spell</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => castSpell('heal')}>Heal Spell</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div>{children}</div>
        </div>

        <div className='w-1/3'>
          <div className="sticky top-18">
            <Card className='rounded shadow-none'>
              <CardHeader>
                <CardTitle>
                  <div className='flex justify-between'>
                    <div className='flex items-center space-x-1'>
                      <div className='h-10 w-10 rounded border overflow-hidden'>
                        <img src={community.avatarUrl || '/logo.png'} />
                      </div>
                      <div>{community.name}</div>
                    </div>
                    {community.member
                      ? <Button onClick={() => handleLeave()} variant={'destructive'}>Leave</Button>
                      : <Button onClick={() => handleJoin()}>Join</Button>}
                  </div>
                </CardTitle>
                <CardDescription>{community.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex justify-between'>
                  <div className='text-sm flex items-center space-x-1'>
                    <p className='font-semibold'>{community.membersCount}</p>
                    <p>members</p>
                  </div>
                  <div className='text-sm flex items-center space-x-1'>
                    <p className='font-semibold'>{community.membersCount}</p>
                    <p>online members</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommLayout
