"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, Users } from "lucide-react"
import { SearchFilterBar, type FilterValues } from "@/components/common/SearchFilterBar"
import { removeTeamMember } from "@/features/organization/actions"
import { UserTeamMemberSheet } from "./UserTeamMemberSheet"
import { usePermission } from "@/components/providers/permission-provider"
import type { TeamMemberRow, UserOption, RoleOption, TeamOption } from "@/features/organization/types"

type Props = { members: TeamMemberRow[]; users: UserOption[]; roles: RoleOption[]; teams: TeamOption[]; onRefresh: () => void }

export function UserTeamMemberTable({ members, users, roles, teams, onRefresh }: Props) {
    const canWrite = usePermission("user:write")
    const canDelete = usePermission("user:delete")

    const [sheetOpen, setSheetOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<TeamMemberRow | null>(null)
    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useState<FilterValues>({ name: "", status: "", dateFrom: "", dateTo: "" })

    const teamOptions = teams.map(t => ({ value: t.id, label: `${t.name} (${t.org.name})` }))

    const filtered = members.filter(m => {
        const search = filters.name.toLowerCase()
        const matchName = (m.user.name ?? "").toLowerCase().includes(search) || m.user.email.toLowerCase().includes(search)
        const matchTeam = !filters.status || m.teamId === filters.status
        return matchName && matchTeam
    })

    const handleDelete = () => {
        if (!selected) return
        startTransition(async () => {
            const result = await removeTeamMember(selected.id)
            result.success ? toast.success("นำสมาชิกออกสำเร็จ") : toast.error(result.error)
            setDeleteOpen(false)
            onRefresh()
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <p className="text-sm text-muted-foreground">สมาชิกใน Teams ทั้งหมด</p>
                </div>
                {canWrite && (
                    <Button size="sm" onClick={() => { setSelected(null); setSheetOpen(true) }}>
                        <Plus className="mr-1 h-4 w-4" /> เพิ่มสมาชิก
                    </Button>
                )}
            </div>

            <SearchFilterBar statusOptions={teamOptions} onChange={setFilters} />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Role</TableHead>
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
                                <TableCell><Badge variant="outline">{m.team.name}</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">{m.team.org.name}</TableCell>
                                <TableCell><Badge variant="secondary">{m.role.name}</Badge></TableCell>
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

            <UserTeamMemberSheet open={sheetOpen} onOpenChange={setSheetOpen} member={selected} users={users} roles={roles} teams={teams} onSuccess={onRefresh} />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการนำสมาชิกออก</AlertDialogTitle>
                        <AlertDialogDescription>นำ &quot;{selected?.user.name ?? selected?.user.email}&quot; ออกจาก Team &quot;{selected?.team.name}&quot;?</AlertDialogDescription>
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
