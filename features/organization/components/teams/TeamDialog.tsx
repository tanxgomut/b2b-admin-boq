"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTeam, updateTeam } from "@/features/organization/actions"
import type { TeamRow, OrgOption } from "@/features/organization/types"
import { Field } from "@/components/ui/field"

type FormValues = { name: string; orgId: string }

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    team?: TeamRow | null
    orgs: OrgOption[]
    onSuccess: () => void
}

export function TeamDialog({ open, onOpenChange, team, orgs, onSuccess }: Props) {
    const isEdit = !!team
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: { name: "", orgId: "" },
    })

    useEffect(() => {
        if (open) reset(team ? { name: team.name, orgId: team.orgId } : { name: "", orgId: "" })
    }, [open, team, reset])

    const orgId = watch("orgId")

    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            const fd = new FormData()
            fd.append("name", data.name)
            fd.append("orgId", data.orgId)
            const result = isEdit ? await updateTeam(team!.id, fd) : await createTeam(fd)
            if (result.success) {
                toast.success(isEdit ? "อัปเดต Team สำเร็จ" : "สร้าง Team สำเร็จ")
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
                    <DialogTitle>{isEdit ? "แก้ไข Team" : "สร้าง Team ใหม่"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Field>
                            <Label>Organization</Label>
                            <Select value={orgId} onValueChange={(v) => setValue("orgId", v)} disabled={isEdit}>
                                <SelectTrigger><SelectValue placeholder="เลือก Organization" /></SelectTrigger>
                                <SelectContent>
                                    {orgs.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                    <div className="space-y-1">
                        <Label>ชื่อ Team</Label>
                        <Input placeholder="เช่น Frontend, Backend" {...register("name", { required: "กรุณาระบุชื่อ Team" })} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
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
