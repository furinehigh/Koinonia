'use client'
import { signIn, useSession } from 'next-auth/react'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaGithub } from 'react-icons/fa'
import { toast } from 'sonner'


function SettingsPage() {
    const { data: session, status } = useSession()

    const handleGithubLink = async () => {
        try {
            if (session?.user.username.startsWith('Ghost')) {
                const res = await signIn('github', {
                    uId: `${session?.user.id || ''}`
                })

                if (!res?.ok) {
                    toast.error("Github wasn't linked properly!!", { description: res?.error })
                    return;
                }
                toast.success('Github linked successfully!!')

            }
        } catch (e: any) {
            toast.error('Error occurred!', {description: e.message})
        }
    }
    return (
        <div className="ml-19 p-4 max-w-full">
            <h1 className='text-2xl font-bold'>Settings</h1>
            {/* <div>
                <div className='h-10 w-10 rounded border overflow-hidden'>
                    <img src={session?.user.image || 'logo.png'} alt='user' />
                </div>
            </div> */}
            <div className='mt-5'>
                <Tabs defaultValue="account" className="w-full">
                    <TabsList>
                        <TabsTrigger value="account">Account</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className='flex flex-col p-5 gap-3' >
                        <div className='flex justify-between'>
                            <Label className='font-semibold'>SignIn Options</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger disabled={!session?.user.username.startsWith('Ghost')} className='cursor-pointer'>
                                    <Button disabled={!session?.user.username.startsWith('Ghost')} variant={'outline'}>{session?.user.username.startsWith('Ghost') ? "Ghost login" : 'GitHub lgin'}</Button>

                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem disabled={!session?.user.username.startsWith('Ghost')} onClick={handleGithubLink}><FaGithub size={20} className='mr-2' />Link Github</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    )
}

export default SettingsPage
