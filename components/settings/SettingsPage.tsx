'use client'
import { useSession } from 'next-auth/react'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from '../ui/label'
import { Button } from '../ui/button'

function SettingsPage() {
    const { data: session, status } = useSession()
    return (
        <div className="ml-15 p-4 max-w-full">
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
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className='flex flex-col p-5 gap-3' >
                        <div className='flex justify-between'>
                            <Label className='font-semibold'>SignIn Options</Label>
                            <Button variant={'outline'}>{session?.user.username.startsWith('Specter') ? "Guest login" : 'GitHub lgin'}</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="password">Change your password here.</TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default SettingsPage
