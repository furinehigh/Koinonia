import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import React, { useRef, useState } from 'react'
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { LoaderIcon, X } from "lucide-react";
import Loader from "../Loader";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(false)
  const { updateMana, mana } = useUserStore()
  const router = useRouter()

  const handleAvatarSelect = () => inputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const file = e.target.files[0]
    const url = URL.createObjectURL(file)
    setAvatar(url)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("name", file.name)
      formData.append("expiration", "0") // optional

      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: formData, // no headers!
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setAvatar("")
        toast.error(data.error || "Upload failed", {
          description: "Try again later.",
        })
        return
      }

      setFormData(prev => ({ ...prev, avatarUrl: data.data.url }))
    } catch (err: any) {
      console.error(err)
      toast.error("Something went wrong.")
    } finally {
      setUploading(false)
    }
  }


  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "slug") {
      // only allow lowercase letters, numbers, hyphens; replace spaces
      const clean = value
        .toLowerCase()
        .replace(/\s+/g, '-')        // spaces → hyphens
        .replace(/[^a-z0-9-]/g, '')  // remove invalid chars
      setFormData(p => ({ ...p, slug: clean }))
    } else {
      setFormData(p => ({ ...p, [name]: value }))
    }
  }

  const handleSubmit = async () => {
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error("Invalid slug! Use only lowercase letters, numbers, and hyphens.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/community/create', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error + ': ' + data.description)
        return;
      }
      updateMana(mana - 10)
      toast.success("Network created!", { description: "You’ve spent 10 mana" })
      handleOpenChange(false)
      router.push('/n/' + formData.slug)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className='flex justify-between items-center'>
              <h1 className='font-semibold'>Create a new network</h1>
              <div className='p-1 text-xs border rounded font-light'>10 Mana</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            It will create a new network and add you automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 flex flex-col justify-center items-center">
          <div className="flex-1 gap-2 flex flex-col relative items-center">
            {avatar && (
              <span onClick={() => setAvatar('')} className="z-50 absolute top-0 rounded bg-white p-0.5 right-[-5px]">
                <X className="h-3" />
              </span>
            )}
            <div
              onClick={handleAvatarSelect}
              className="h-20 w-20 rounded border cursor-pointer relative"
            >
              {uploading ? (
                <Loader className={"flex items-center justify-center"} size={32} />
              ) : (
                <img src={avatar || 'logo.png'} alt="comm_avatar" />
              )}
            </div>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              ref={inputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Label htmlFor="avatar">Avatar</Label>
          </div>

          {["name", "description", "slug"].map(f => (
            <div key={f} className="grid flex-1 gap-2 w-full">
              <Label htmlFor={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</Label>
              <Input
                id={f}
                name={f}
                value={(formData as any)[f]}
                onChange={handleFieldChange}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-start items-center">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
          <Button disabled={uploading || loading} onClick={handleSubmit}>
            {loading ? <LoaderIcon size={12} className="animate-spin" /> : 'Create'}
          </Button>
          <p className="text-xs text-red-500 truncate w-[18rem]">{error}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCommunityDialog