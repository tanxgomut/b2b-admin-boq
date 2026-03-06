"use client"

import { useState, useTransition } from "react"
import { createBoqCategory } from "@/features/boq/actions"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderPlus } from "lucide-react"
import { toast } from "sonner"

interface Props {
    projectId: string
    orgId: string
}

export function BoqAddCategoryForm({ projectId, orgId }: Props) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [name, setName] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        startTransition(async () => {
            try {
                await createBoqCategory(projectId, orgId, { name, order: 0 })
                toast.success("เพิ่มหมวดหมู่สำเร็จ")
                setOpen(false)
                setName("")
            } catch {
                toast.error("เกิดข้อผิดพลาด")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    เพิ่มหมวดหมู่
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>เพิ่มหมวดหมู่งาน</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cat-name">ชื่อหมวดหมู่ *</Label>
                        <Input
                            id="cat-name"
                            placeholder="เช่น งานโครงสร้าง, งานไฟฟ้า, งานประปา"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "กำลังเพิ่ม..." : "เพิ่มหมวดหมู่"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
