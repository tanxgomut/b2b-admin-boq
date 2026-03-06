"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, Layers } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { SearchFilterBar, type FilterValues } from "@/components/common/SearchFilterBar"
import { deleteTeam } from "@/features/organization/actions"
import { TeamDialog } from "./TeamDialog"
import { usePermission } from "@/components/providers/permission-provider"
import type { TeamRow, OrgOption } from "@/features/organization/types"

type Props = { teams: TeamRow[]; orgs: OrgOption[]; onRefresh: () => void }

export function TeamTable({ teams, orgs, onRefresh }: Props) {
    const canCreate = usePermission("organization:create")
    const canUpdate = usePermission("organization:update")
    const canDelete = usePermission("organization:delete")

    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<TeamRow | null>(null)
    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useState<FilterValues>({ name: "", status: "", dateFrom: "", dateTo: "" })

    const orgOptions = orgs.map(o => ({ value: o.id, label: o.name }))

    const filtered = teams.filter(t => {
        const matchName = t.name.toLowerCase().includes(filters.name.toLowerCase())
        const matchOrg = !filters.status || t.orgId === filters.status
        const matchFrom = !filters.dateFrom || new Date(t.createdAt) >= new Date(filters.dateFrom)
        const matchTo = !filters.dateTo || new Date(t.createdAt) <= new Date(filters.dateTo)
        return matchName && matchOrg && matchFrom && matchTo
    })

    const handleDelete = () => {
        if (!selected) return
        startTransition(async () => {
            const result = await deleteTeam(selected.id)
            result.success ? toast.success("ลบ Team สำเร็จ") : toast.error(result.error)
            setDeleteOpen(false)
            onRefresh()
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Teams</h3>
                    <p className="text-sm text-muted-foreground">กลุ่มทีมงานใน Organization</p>
                </div>
                {canCreate && (
                    <Button size="sm" onClick={() => { setSelected(null); setDialogOpen(true) }}>
                        <Plus className="mr-1 h-4 w-4" /> เพิ่ม Team
                    </Button>
                )}
            </div>

            <SearchFilterBar statusOptions={orgOptions} onChange={setFilters} />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อ Team</TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead className="text-center">สมาชิก</TableHead>
                            <TableHead>วันที่สร้าง</TableHead>
                            <TableHead className="w-[100px]">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">ไม่พบข้อมูล</TableCell></TableRow>
                        ) : filtered.map(team => (
                            <TableRow key={team.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                        {team.name}
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant="outline">{team.org.name}</Badge></TableCell>
                                <TableCell className="text-center"><Badge variant="secondary">{team._count?.members ?? 0} คน</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {format(new Date(team.createdAt), "d MMM yyyy", { locale: th })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {canUpdate && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(team); setDialogOpen(true) }}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setSelected(team); setDeleteOpen(true) }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <TeamDialog open={dialogOpen} onOpenChange={setDialogOpen} team={selected} orgs={orgs} onSuccess={onRefresh} />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ Team</AlertDialogTitle>
                        <AlertDialogDescription>ต้องการลบ Team &quot;{selected?.name}&quot;? สมาชิกใน Team จะถูกลบออกทั้งหมด</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={isPending}>
                            {isPending ? "กำลังลบ..." : "ลบ"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
