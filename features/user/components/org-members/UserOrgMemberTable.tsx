"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, Users } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { SearchFilterBar, type FilterValues } from "@/components/common/SearchFilterBar"
import { removeOrgMember } from "@/features/organization/actions"
import { UserOrgMemberSheet } from "./UserOrgMemberSheet"
import { usePermission } from "@/components/providers/permission-provider"
import type { OrgMemberRow, UserOption, RoleOption, OrgOption } from "@/features/organization/types"

type Props = { members: OrgMemberRow[]; users: UserOption[]; roles: RoleOption[]; orgs: OrgOption[]; onRefresh: () => void }

export function UserOrgMemberTable({ members, users, roles, orgs, onRefresh }: Props) {
    const canWrite = usePermission("user:write")
    const canDelete = usePermission("user:delete")

    const [sheetOpen, setSheetOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<OrgMemberRow | null>(null)
    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useState<FilterValues>({ name: "", status: "", dateFrom: "", dateTo: "" })

    const roleOptions = roles.map(r => ({ value: r.id, label: r.name }))

    const filtered = members.filter(m => {
        const search = filters.name.toLowerCase()
        const matchName = (m.user.name ?? "").toLowerCase().includes(search) || m.user.email.toLowerCase().includes(search)
        const matchRole = !filters.status || m.roleId === filters.status
        return matchName && matchRole
    })

    const handleDelete = () => {
        if (!selected) return
        startTransition(async () => {
            const result = await removeOrgMember(selected.id)
            result.success ? toast.success("นำสมาชิกออกสำเร็จ") : toast.error(result.error)
            setDeleteOpen(false)
            onRefresh()
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Organization Members</h3>
                    <p className="text-sm text-muted-foreground">สมาชิกใน Organizations ทั้งหมด</p>
                </div>
                {canWrite && (
                    <Button size="sm" onClick={() => { setSelected(null); setSheetOpen(true) }}>
                        <Plus className="mr-1 h-4 w-4" /> เพิ่มสมาชิก
                    </Button>
                )}
            </div>

            <SearchFilterBar statusOptions={roleOptions} onChange={setFilters} />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>เข้าร่วม</TableHead>
                            <TableHead className="w-[100px]">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">ไม่พบข้อมูล</TableCell></TableRow>
                        ) : filtered.map(m => (
                            <TableRow key={m.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-sm">{m.user.name ?? "—"}</p>
                                            <p className="text-xs text-muted-foreground">{m.user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant="outline">{m.org.name}</Badge></TableCell>
                                <TableCell><Badge variant="secondary">{m.role.name}</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">{format(new Date(m.joinedAt), "d MMM yyyy", { locale: th })}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {canWrite && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(m); setSheetOpen(true) }}><Pencil className="h-4 w-4" /></Button>}
                                        {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setSelected(m); setDeleteOpen(true) }}><Trash2 className="h-4 w-4" /></Button>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <UserOrgMemberSheet open={sheetOpen} onOpenChange={setSheetOpen} member={selected} users={users} roles={roles} orgs={orgs} onSuccess={onRefresh} />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการนำสมาชิกออก</AlertDialogTitle>
                        <AlertDialogDescription>นำ &quot;{selected?.user.name ?? selected?.user.email}&quot; ออกจาก &quot;{selected?.org.name}&quot;?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={isPending}>
                            {isPending ? "กำลังนำออก..." : "นำออก"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
