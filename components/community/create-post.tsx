'use client'
import React, { useRef, useState } from 'react'

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/useUserStore'
import Loader from '../Loader'
import { X } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import Link from 'next/link'

function CreatePost({ slug }: {
    slug: string
}) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: '',

    })
    const [image, setImage] = useState('')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const inputRef = useRef(null)

    const { updateMana, mana } = useUserStore()

    const handleimageSelect = () => {
        inputRef.current?.click()
    }

    const handleAction = (action: string, postId: string) => {

    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const file = e.target.files[0]
        const url = URL.createObjectURL(file)
        setImage(url)
        setUploading(true)
        try {
            const base64 = await fileToBase64(file)

            const res = await fetch("/api/images/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64, name: file.name }),
            })
            if (!res.ok) {
                setImage('')
                return;
            }

            const data = await res.json()

            setFormData(prev => ({
                ...prev,
                imageUrl: data.data.url
            }))
        } catch (e: any) {
            console.error(e.message)
        } finally {
            setUploading(false)
        }
    }

    const fileToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                // Remove the data:image/...;base64, prefix
                const base64 = (reader.result as string).split(",")[1]
                resolve(base64)
            }
            reader.onerror = (err) => reject(err)
        })


    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async () => {
        try {


            const res = await fetch('/api/post/create', {
                method: 'POST',
                body: JSON.stringify({...formData, slug})
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return;
            }
            updateMana(mana - 5)
            router.push('/c/' + slug)
        } catch (e: any) {
            console.error(e.message)
        }
    }
    return (
        <Card className='rounded shadow-none m-4'>
            <CardHeader>
                <CardTitle>
                    <div className='flex justify-between items-center'>
                        <h1 className='font-semibold'>Create a new post</h1>
                        <div className='p-1 text-xs border rounded font-light'>5 Mana</div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 flex flex-col justify-center items-center">

                    <div className="grid flex-1 gap-2 w-full">
                        <Label htmlFor="title" className="">
                            Title
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div className="grid flex-1 gap-2 w-full">
                        <Label htmlFor="content" className="">
                            Body
                        </Label>
                        <Textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={(e) => handleFieldChange(e)}
                        />
                    </div>
                    <div className="flex-1 gap-2 flex flex-col relative">
                        {image && <span onClick={() => setImage('')} className="z-50 absolute top-0 rounded bg-white p-0.5 right-[-5px]"><X className="h-3" /></span>}
                        <div
                            onClick={handleimageSelect} className="h-20 w-20 rounded border cursor-pointer relative ">
                            {uploading ? <Loader className={"flex items-center justify-center w-full h-full"} size={32} /> : <img src={image || '/logo.png'} className="" alt="post_image" onClick={handleimageSelect} />}
                        </div>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            ref={inputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className='flex justify-end space-x-2'>
                <Link href={'/c/' + slug}>
                    <Button type="button" variant="secondary">
                        Cancel
                    </Button>
                </Link>
                <Button disabled={uploading} onClick={handleSubmit} type="button" variant="default">
                    Create
                </Button>
            </CardFooter>
        </Card>
    )
}

export default CreatePost