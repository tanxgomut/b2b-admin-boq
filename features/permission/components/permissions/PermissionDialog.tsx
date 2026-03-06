"use client"

import { useEffect, useTransition } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createPermission, updatePermission } from "@/features/permission/actions"
import {
    PermissionSchema,
    type PermissionFormData,
    type PermissionRow,
    type ResourceRow,
} from "@/features/permission/types"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    permission?: PermissionRow | null
    resources: ResourceRow[]
    onSuccess: () => void
}

export function PermissionDialog({ open, onOpenChange, permission, resources, onSuccess }: Props) {
    const isEdit = !!permission
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PermissionFormData>({
        resolver: zodResolver(PermissionSchema),
        defaultValues: permission
            ? { key: permission.key, description: permission.description ?? "", resourceId: permission.resourceId }
            : { key: "", description: "", resourceId: "" },
    })

    useEffect(() => {
        if (open) {
            reset(
                permission
                    ? { key: permission.key, description: permission.description ?? "", resourceId: permission.resourceId }
                    : { key: "", description: "", resourceId: "" }
            )
        }
    }, [open, permission, reset])

    const selectedResourceId = watch("resourceId")

    const onSubmit = (data: PermissionFormData) => {
        startTransition(async () => {
            const fd = new FormData()
            fd.append("key", data.key)
            fd.append("description", data.description ?? "")
            fd.append("resourceId", data.resourceId)
            const result = isEdit
                ? await updatePermission(permission!.id, fd)
                : await createPermission(fd)
            if (result.success) {
                toast.success(isEdit ? "อัปเดต Permission สำเร็จ" : "สร้าง Permission สำเร็จ")
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
                    <DialogTitle>{isEdit ? "แก้ไข Permission" : "สร้าง Permission ใหม่"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="resourceId">Resource</Label>
                        <Select
                            value={selectedResourceId}
                            onValueChange={(v) => setValue("resourceId", v)}
                        >
                            <SelectTrigger id="resourceId">
                                <SelectValue placeholder="เลือก Resource" />
                            </SelectTrigger>
                            <SelectContent>
                                {resources.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.resourceId && <p className="text-sm text-destructive">{errors.resourceId.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="key">Permission Key</Label>
                        <Input id="key" placeholder="เช่น users:read, boq:write" {...register("key")} />
                        <p className="text-xs text-muted-foreground">รูปแบบ: resource:action</p>
                        {errors.key && <p className="text-sm text-destructive">{errors.key.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="description">คำอธิบาย (ไม่บังคับ)</Label>
                        <Textarea id="description" placeholder="อธิบาย permission นี้..." {...register("description")} />
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
