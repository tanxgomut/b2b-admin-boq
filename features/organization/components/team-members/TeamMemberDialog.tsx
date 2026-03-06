"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Field } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addTeamMember, updateTeamMemberRole } from "@/features/organization/actions"
import type { TeamMemberRow, UserOption, RoleOption, TeamOption } from "@/features/organization/types"

type FormValues = { userId: string; teamId: string; roleId: string }

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    member?: TeamMemberRow | null
    users: UserOption[]
    roles: RoleOption[]
    teams: TeamOption[]
    onSuccess: () => void
}

export function TeamMemberDialog({ open, onOpenChange, member, users, roles, teams, onSuccess }: Props) {
    const isEdit = !!member
    const [isPending, startTransition] = useTransition()

    const { handleSubmit, reset, setValue, watch } = useForm<FormValues>({
        defaultValues: { userId: "", teamId: "", roleId: "" },
    })

    useEffect(() => {
        if (open) reset(isEdit ? { userId: member!.userId, teamId: member!.teamId, roleId: member!.roleId } : { userId: "", teamId: "", roleId: "" })
    }, [open, member, isEdit, reset])

    const userId = watch("userId")
    const teamId = watch("teamId")
    const roleId = watch("roleId")

    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            const fd = new FormData()
            fd.append("userId", data.userId)
            fd.append("teamId", data.teamId)
            fd.append("roleId", data.roleId)
            const result = isEdit
                ? await updateTeamMemberRole(member!.id, data.roleId)
                : await addTeamMember(fd)
            if (result.success) {
                toast.success(isEdit ? "อัปเดต Role สำเร็จ" : "เพิ่มสมาชิกสำเร็จ")
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
                    <DialogTitle>{isEdit ? "แก้ไข Role สมาชิก" : "เพิ่มสมาชิก Team"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {!isEdit && (
                        <>
                            <div className="space-y-1">
                                <Field>
                                    <Label>Team</Label>
                                    <Select value={teamId} onValueChange={(v) => setValue("teamId", v)}>
                                        <SelectTrigger><SelectValue placeholder="เลือก Team" /></SelectTrigger>
                                        <SelectContent>
                                            {teams.map(t => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    {t.name} <span className="text-muted-foreground text-xs">({t.org.name})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>
                            <div className="space-y-1">
                                <Field>
                                    <Label>User</Label>
                                    <Select value={userId} onValueChange={(v) => setValue("userId", v)}>
                                        <SelectTrigger><SelectValue placeholder="เลือก User" /></SelectTrigger>
                                        <SelectContent>
                                            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name ?? u.email}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>
                        </>
                    )}
                    {isEdit && (
                        <p className="text-sm text-muted-foreground">
                            แก้ไข Role ของ <strong>{member?.user.name ?? member?.user.email}</strong> ใน <strong>{member?.team.name}</strong>
                        </p>
                    )}
                    <div className="space-y-1">
                        <Label>Role</Label>
                        <Select value={roleId} onValueChange={(v) => setValue("roleId", v)}>
                            <SelectTrigger><SelectValue placeholder="เลือก Role" /></SelectTrigger>
                            <SelectContent>
                                {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
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
