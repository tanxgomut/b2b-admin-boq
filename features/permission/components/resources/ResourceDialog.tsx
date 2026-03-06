"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createResource, updateResource } from "@/features/permission/actions"
import { ResourceSchema, type ResourceFormData, type ResourceRow } from "@/features/permission/types"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    resource?: ResourceRow | null
    onSuccess: () => void
}

export function ResourceDialog({ open, onOpenChange, resource, onSuccess }: Props) {
    const isEdit = !!resource
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ResourceFormData>({
        resolver: zodResolver(ResourceSchema),
        defaultValues: resource ? { type: resource.type } : { type: "" },
    })

    const onSubmit = (data: ResourceFormData) => {
        startTransition(async () => {
            const fd = new FormData()
            fd.append("type", data.type)
            const result = isEdit
                ? await updateResource(resource!.id, fd)
                : await createResource(fd)
            if (result.success) {
                toast.success(isEdit ? "อัปเดต Resource สำเร็จ" : "สร้าง Resource สำเร็จ")
                reset()
                onOpenChange(false)
                onSuccess()
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "แก้ไข Resource" : "สร้าง Resource ใหม่"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="type">ชื่อ Resource</Label>
                        <Input id="type" placeholder="เช่น users, boq, billing" {...register("type")} />
                        <p className="text-xs text-muted-foreground">ใช้ตัวพิมพ์เล็ก ไม่มีช่องว่าง เช่น &quot;manage_users&quot;</p>
                        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
