"use client"

import { useState, useTransition } from "react"
import { createBoqProject } from "@/features/boq/actions"
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
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface Props {
    orgId: string
}

export function BoqProjectForm({ orgId }: Props) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [form, setForm] = useState({ name: "", description: "", location: "" })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            try {
                await createBoqProject(orgId, form)
                toast.success("สร้างโปรเจ็ก BOQ สำเร็จ")
                setOpen(false)
                setForm({ name: "", description: "", location: "" })
            } catch {
                toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    สร้างโปรเจ็กใหม่
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>สร้างโปรเจ็ก BOQ</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">ชื่อโปรเจ็ก *</Label>
                        <Input
                            id="name"
                            placeholder="เช่น บ้านคุณสมชาย"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">ที่ตั้งโปรเจ็ก</Label>
                        <Input
                            id="location"
                            placeholder="เช่น บางนา กรุงเทพ"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">รายละเอียด</Label>
                        <Textarea
                            id="description"
                            placeholder="รายละเอียดเพิ่มเติม..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "กำลังสร้าง..." : "สร้างโปรเจ็ก"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
