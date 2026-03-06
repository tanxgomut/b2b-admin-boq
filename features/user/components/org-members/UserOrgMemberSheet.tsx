"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addOrgMember, updateOrgMemberRole } from "@/features/organization/actions"
import type { OrgMemberRow, UserOption, RoleOption, OrgOption } from "@/features/organization/types"

type FormValues = { userId: string; orgId: string; roleId: string }

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    member?: OrgMemberRow | null
    users: UserOption[]
    roles: RoleOption[]
    orgs: OrgOption[]
    onSuccess: () => void
}

export function UserOrgMemberSheet({ open, onOpenChange, member, users, roles, orgs, onSuccess }: Props) {
    const isEdit = !!member
    const [isPending, startTransition] = useTransition()
    const { handleSubmit, reset, setValue, watch } = useForm<FormValues>({ defaultValues: { userId: "", orgId: "", roleId: "" } })

    useEffect(() => {
        if (open) reset(isEdit ? { userId: member!.userId, orgId: member!.orgId, roleId: member!.roleId } : { userId: "", orgId: "", roleId: "" })
    }, [open, member, isEdit, reset])

    const userId = watch("userId")
    const orgId = watch("orgId")
    const roleId = watch("roleId")

    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            const fd = new FormData()
            fd.append("userId", data.userId)
            fd.append("orgId", data.orgId)
            fd.append("roleId", data.roleId)
            const result = isEdit ? await updateOrgMemberRole(member!.id, data.roleId) : await addOrgMember(fd)
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{isEdit ? "แก้ไข Role ใน Organization" : "เพิ่มสมาชิกเข้า Organization"}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? `${member?.user.name ?? member?.user.email} → ${member?.org.name}` : "เลือก User, Organization และ Role"}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 py-4">
                    {!isEdit && (
                        <>
                            <div className="space-y-1">
                                <Label>Organization</Label>
                                <Select value={orgId} onValueChange={(v) => setValue("orgId", v)}>
                                    <SelectTrigger><SelectValue placeholder="เลือก Organization" /></SelectTrigger>
                                    <SelectContent>
                                        {orgs.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>User</Label>
                                <Select value={userId} onValueChange={(v) => setValue("userId", v)}>
                                    <SelectTrigger><SelectValue placeholder="เลือก User" /></SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name ?? u.email}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    {isEdit && (
                        <p className="text-sm text-muted-foreground rounded-md border bg-muted/50 px-3 py-2">
                            สมาชิก: <strong>{member?.user.name ?? member?.user.email}</strong><br />
                            Organization: <strong>{member?.org.name}</strong>
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
                    <SheetFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "กำลังบันทึก..." : "บันทึก"}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
