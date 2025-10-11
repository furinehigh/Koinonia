import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import React, { useRef, useState } from 'react'
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { X } from "lucide-react";
import Loader from "../Loader";
import { useUserStore } from "@/store/useUserStore";

function CreateCommunityDialog({ isOpen, handleOpenChange }: {
    isOpen: boolean;
    handleOpenChange: (o: boolean) => void
}) {
    const [avatar, setAvatar] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
        avatarUrl: ''
    })
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const { updateMana, Mana } = useUserStore()

    const handleAvatarSelect = () => {
        inputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const file = e.target.files[0]
        const url = URL.createObjectURL(file)
        setAvatar(url)
        setUploading(true)
        try {
            const base64 = await fileToBase64(file)

            const res = await fetch("/api/images/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64, name: file.name }),
            })
            if (!res.ok) {
                setAvatar('')
                return;
            }

            const data = await res.json()

            setFormData(prev => ({
                ...prev,
                avatarUrl: data.data.url
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


    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async () => {
        try {


            const res = await fetch('/api/community/create', {
                method: 'POST',
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return;
            }
            updateMana(Mana - 10)
            handleOpenChange(false) 
        } catch (e: any) {
            console.error(e.message)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle><div className='flex justify-between items-center'>
                        <h1 className='font-semibold'>Create a new community</h1>
                        <div className='p-1 text-xs border rounded font-light'>10 Mana</div>
                    </div></DialogTitle>
                    <DialogDescription>
                        It will create a new community and will add you automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 flex flex-col justify-center items-center">
                    <div className="flex-1 gap-2 flex flex-col relative items-center">
                        {avatar && <span onClick={() => setAvatar('')} className="z-50 absolute top-0 rounded bg-white p-0.5 right-[-5px]"><X className="h-3" /></span>}
                        <div
                            onClick={handleAvatarSelect} className="h-20 w-20 rounded border cursor-pointer relative ">
                            {uploading ? <Loader className={"flex items-center justify-center"} size={32} /> : <img src={avatar || 'logo.png'} className="" alt="comm_avatar" onClick={handleAvatarSelect} />}
                        </div>
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            ref={inputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <Label htmlFor="avatar" className="">
                            Avatar
                        </Label>
                    </div>
                    <div className="grid flex-1 gap-2 w-full">
                        <Label htmlFor="name" className="">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div className="grid flex-1 gap-2 w-full">
                        <Label htmlFor="description" className="">
                            Description
                        </Label>
                        <Input
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div className="grid flex-1 gap-2 w-full">
                        <Label htmlFor="slug" className="">
                            Slug
                        </Label>
                        <Input
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleFieldChange}
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button disabled={uploading} onClick={handleSubmit} type="button" variant="default">
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateCommunityDialog