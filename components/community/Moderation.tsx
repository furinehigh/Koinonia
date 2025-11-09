'use client'
import React, { useEffect, useState } from 'react'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'

function Moderation({ settings }: {
    settings: any
}) {
    const [modSettings, setModSettings] = useState(settings)
    const [inputValue, setInputValue] = useState('')
    const [changed, setChanged] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)

    const handleSettingSave = async () => {
        try {
            setSaveLoading(true)
            const res = await fetch('/api/moderation/settings', {
                method: 'PUT',
                body: JSON.stringify(modSettings)
            })

            const data = await res.json()
            if (data.error) {
                toast.error(data.error)
                return;
            }
            toast.success('Moderation settings updated!!')
            setChanged(false)
        } catch (e: any) {
            toast.error('Error occurred!', { description: e.message })
        } finally {
            setSaveLoading(false)
        }
    }
    return (
        <div className='my-3'>
            <h1 className='font-bold text-2xl'>Moderation</h1>
            <p className='text-xs opacity-70'>aka ghost busting.</p>
            <div className='my-2 w-full p-2 flex flex-col gap-5'>
                <div className='flex justify-between items-center'>
                    <Label id='apa'>Auto Post Approval</Label>
                    <Switch id='apa' checked={modSettings?.autoApprovalPost} onCheckedChange={(val) => {
                        setChanged(true)
                        setModSettings(prev => ({ ...prev, autoApprovalPost: val }))}} />
                </div>
                <div className='flex justify-between items-center'>
                    <Label id='apa'>Auto Comment Approval</Label>
                    <Switch id='apa' checked={modSettings?.autoApprovalComment} onCheckedChange={(val) => {
                        setChanged(true)
                        setModSettings(prev => ({ ...prev, autoApprovalComment: val }))}} />
                </div>
                <div className='flex justify-between items-center'>
                    <Label id='apa'>Content Moderation</Label>
                    <Switch id='apa' checked={modSettings?.contentModeration} onCheckedChange={(val) => {
                        setChanged(true)
                        setModSettings(prev => ({ ...prev, contentModeration: val }))}} />
                </div>
                <div className='flex justify-between items-center'>
                    <Label id='apa'>Avoid Links</Label>
                    <Switch id='apa' checked={modSettings?.avoidLinks} onCheckedChange={(val) => {
                        setChanged(true)
                        setModSettings(prev => ({ ...prev, avoidLinks: val }))}} />
                </div>
                <div className='flex flex-col gap-2'>
                    <div className='flex justify-between items-center'>
                        <Label id='apa'>Restricted Words</Label>
                        <div className='flex gap-1 max-w-2/3 flex-wrap'>
                            {(modSettings?.restrictedWords || '')
                                .split(',')
                                .filter(w => w.trim())
                                .map((w, i) => (
                                    <Badge key={i} className='rounded text-[10px]'>
                                        {w}
                                    </Badge>
                                ))}
                        </div>

                    </div>
                    <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(key) => {
                        if (key.key == 'Enter') {
                            setModSettings(prev => ({ ...prev, restrictedWords: modSettings?.restrictedWords == '' || !modSettings?.restrictedWords ? (modSettings?.restrictedWords || '') + inputValue : modSettings?.restrictedWords + ',' + inputValue }))
                            setInputValue('')
                            setChanged(true)
                        }
                    }} placeholder='Press enter to add a new restricted word....' />
                </div>

                <div>
                    <Button disabled={saveLoading || !changed} onClick={handleSettingSave}>{saveLoading ? <Loader2 className='animate-spin' /> : 'Save'}</Button>
                </div>
            </div>
        </div>
    )
}

export default Moderation