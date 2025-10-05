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

function CreateCommunityDialog({ isOpen, handleOpenChange }: {
    isOpen: boolean;
    handleOpenChange: (o: boolean) => void
}) {
    const [avatar, setAvatar] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
        avatar: ''
    })
    const inputRef = useRef<HTMLInputElement>(null)

    const handleAvatarSelect = () => {
        inputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const file = e.target.files[0]
        const url = URL.createObjectURL(file)
        setAvatar(url)
    }

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = () => {
        try {

            
            const res = fetch('/api/community/create', {
                method: 'POST',
                body: JSON.stringify(formData)
            })

            isOpen = false
        } catch(e: any) {
            console.error(e.message)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new community</DialogTitle>
                    <DialogDescription>
                        It will create a new community and will add you automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 flex flex-col justify-center items-center">
                    <div className="flex-1 gap-2 flex flex-col items-center">
                        <div
                            onClick={handleAvatarSelect} className="h-20 w-20 rounded border cursor-pointer relative">
                            {avatar && <span onClick={() => setAvatar('')} className="absolute top-0 rounded bg-white p-0.5 right-[-5px]"><X className="h-3" /></span>}
                            {avatar == '' ? <span
                                id="avatar"
                                className="h-full w-full"
                            ></span> : <img src={avatar} className="h-full w-full" alt="comm_avatar" onClick={handleAvatarSelect} />}
                        </div>
                        <input
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
                    <Button onClick={handleSubmit} type="button" variant="default">
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateCommunityDialog