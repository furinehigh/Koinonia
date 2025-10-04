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

import React from 'react'
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

function CreateCommunityDialog({ isOpen, handleOpenChange }: {
    isOpen: boolean;
    handleOpenChange: (o: boolean) => void
}) {
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new community</DialogTitle>
                    <DialogDescription>
                        It will create a new community and will add you automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 ">
                    <div className="grid flex-1 gap-2">
                        <Input
                            id="name"
                            type="file"
                            className="h-20 w-20"
                            placeholder=""
                            
                        />
                        <Label htmlFor="name" className="">
                            Logo
                        </Label>
                    </div>
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="name" className="">
                            Name
                        </Label>
                        <Input
                            id="name"
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="button" variant="default">
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateCommunityDialog