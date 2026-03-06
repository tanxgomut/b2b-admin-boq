"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrg, updateOrg } from "@/features/organization/actions"
import type { OrgRow } from "@/features/organization/types"

type FormValues = { name: string; slug: string }

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    org?: OrgRow | null
    onSuccess: () => void
}

function toSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export function OrgDialog({ open, onOpenChange, org, onSuccess }: Props) {
    const isEdit = !!org
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: { name: "", slug: "" },
    })

    const nameVal = watch("name")

    useEffect(() => {
        if (open) reset(org ? { name: org.name, slug: org.slug } : { name: "", slug: "" })
    }, [open, org, reset])

    // auto-gen slug จาก name เมื่อ Add ใหม่
    useEffect(() => {
        if (!isEdit) setValue("slug", toSlug(nameVal))
    }, [nameVal, isEdit, setValue])

    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            const fd = new FormData()
            fd.append("name", data.name)
            fd.append("slug", data.slug)
            const result = isEdit ? await updateOrg(org!.id, fd) : await createOrg(fd)
            if (result.success) {
                toast.success(isEdit ? "อัปเดต Organization สำเร็จ" : "สร้าง Organization สำเร็จ")
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
                    <DialogTitle>{isEdit ? "แก้ไข Organization" : "สร้าง Organization ใหม่"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="org-name">ชื่อ Organization</Label>
                        <Input id="org-name" placeholder="เช่น Acme Corp" {...register("name", { required: "กรุณาระบุชื่อ" })} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="org-slug">Slug (URL)</Label>
                        <Input id="org-slug" placeholder="เช่น acme-corp" {...register("slug", {
                            required: "กรุณาระบุ slug",
                            pattern: { value: /^[a-z0-9-]+$/, message: "ใช้ตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น" }
                        })} />
                        <p className="text-xs text-muted-foreground">สร้างอัตโนมัติจากชื่อ หรือแก้ไขเอง</p>
                        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "กำลังบันทึก..." : "บันทึก"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
