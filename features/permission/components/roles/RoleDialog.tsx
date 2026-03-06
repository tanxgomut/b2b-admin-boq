"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
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
import { createRole, updateRole } from "@/features/permission/actions"
import type { RoleRow } from "@/features/permission/types"

type FormValues = {
    name: string
    level: string
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    role?: RoleRow | null
    onSuccess: () => void
}

export function RoleDialog({ open, onOpenChange, role, onSuccess }: Props) {
    const isEdit = !!role
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: { name: "", level: "10" },
    })

    useEffect(() => {
        if (open) {
            reset(
                role
                    ? { name: role.name, level: String(role.level) }
                    : { name: "", level: "10" }
            )
        }
    }, [open, role, reset])

    const onSubmit = (data: FormValues) => {
        const level = parseInt(data.level, 10)
        if (!data.name.trim()) {
            return
        }
        if (isNaN(level) || level < 1) {
            return
        }
        startTransition(async () => {
            const fd = new FormData()
            fd.append("name", data.name.trim())
            fd.append("level", String(level))
            const result = isEdit
                ? await updateRole(role!.id, fd)
                : await createRole(fd)
            if (result.success) {
                toast.success(isEdit ? "อัปเดต Role สำเร็จ" : "สร้าง Role สำเร็จ")
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
                    <DialogTitle>{isEdit ? "แก้ไข Role" : "สร้าง Role ใหม่"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="role-name">ชื่อ Role</Label>
                        <Input
                            id="role-name"
                            placeholder="เช่น Admin, Manager"
                            {...register("name", { required: "กรุณาระบุชื่อ Role" })}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="role-level">Level (ต่ำ = สิทธิ์สูงกว่า)</Label>
                        <Input
                            id="role-level"
                            type="number"
                            min={1}
                            {...register("level", {
                                required: "กรุณาระบุ Level",
                                min: { value: 1, message: "Level ต้องมากกว่า 0" },
                            })}
                        />
                        {errors.level && (
                            <p className="text-sm text-destructive">{errors.level.message}</p>
                        )}
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
