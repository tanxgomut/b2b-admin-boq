"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, Building2, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { SearchFilterBar, type FilterValues } from "@/components/common/SearchFilterBar"
import { softDeleteOrg, restoreOrg } from "@/features/organization/actions"
import { OrgDialog } from "./OrgDialog"
import { usePermission } from "@/components/providers/permission-provider"
import type { OrgRow } from "@/features/organization/types"

type Props = { orgs: OrgRow[]; onRefresh: () => void }

export function OrgTable({ orgs, onRefresh }: Props) {
    const canCreate = usePermission("organization:create")
    const canUpdate = usePermission("organization:update")
    const canDelete = usePermission("organization:delete")

    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<OrgRow | null>(null)
    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useState<FilterValues>({ name: "", status: "", dateFrom: "", dateTo: "" })

    const filtered = orgs.filter((o) => {
        const matchName = o.name.toLowerCase().includes(filters.name.toLowerCase()) || o.slug.toLowerCase().includes(filters.name.toLowerCase())
        const matchStatus = !filters.status || (filters.status === "active" ? !o.deletedAt : !!o.deletedAt)
        const matchFrom = !filters.dateFrom || new Date(o.createdAt) >= new Date(filters.dateFrom)
        const matchTo = !filters.dateTo || new Date(o.createdAt) <= new Date(filters.dateTo)
        return matchName && matchStatus && matchFrom && matchTo
    })

    const handleDelete = () => {
        if (!selected) return
        startTransition(async () => {
            const result = await softDeleteOrg(selected.id)
            result.success ? toast.success("ลบ Organization สำเร็จ") : toast.error(result.error)
            setDeleteOpen(false)
            onRefresh()
        })
    }

    const handleRestore = (org: OrgRow) => {
        startTransition(async () => {
            const result = await restoreOrg(org.id)
            result.success ? toast.success("กู้คืน Organization สำเร็จ") : toast.error(result.error)
            onRefresh()
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Organizations</h3>
                    <p className="text-sm text-muted-foreground">จัดการ Organization ในระบบ</p>
                </div>
                {canCreate && (
                    <Button size="sm" onClick={() => { setSelected(null); setDialogOpen(true) }}>
                        <Plus className="mr-1 h-4 w-4" /> เพิ่ม Organization
                    </Button>
                )}
            </div>

            <SearchFilterBar
                statusOptions={[{ value: "active", label: "Active" }, { value: "deleted", label: "Deleted" }]}
                onChange={setFilters}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อ</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-center">สมาชิก</TableHead>
                            <TableHead className="text-center">Teams</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead>วันที่สร้าง</TableHead>
                            <TableHead className="w-[120px]">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">ไม่พบข้อมูล</TableCell></TableRow>
                        ) : filtered.map(org => (
                            <TableRow key={org.id} className={org.deletedAt ? "opacity-50" : ""}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        {org.name}
                                    </div>
                                </TableCell>
                                <TableCell><code className="text-sm bg-muted px-1.5 py-0.5 rounded">{org.slug}</code></TableCell>
                                <TableCell className="text-center"><Badge variant="outline">{org._count?.members ?? 0}</Badge></TableCell>
                                <TableCell className="text-center"><Badge variant="outline">{org._count?.teams ?? 0}</Badge></TableCell>
                                <TableCell>
                                    {org.deletedAt
                                        ? <Badge variant="destructive">Deleted</Badge>
                                        : <Badge variant="secondary" className="text-green-600">Active</Badge>
                                    }
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {format(new Date(org.createdAt), "d MMM yyyy", { locale: th })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {org.deletedAt ? (
                                            canDelete && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleRestore(org)}>
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            )
                                        ) : (
                                            <>
                                                {canUpdate && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(org); setDialogOpen(true) }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setSelected(org); setDeleteOpen(true) }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <OrgDialog open={dialogOpen} onOpenChange={setDialogOpen} org={selected} onSuccess={onRefresh} />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ Organization</AlertDialogTitle>
                        <AlertDialogDescription>
                            ต้องการลบ &quot;{selected?.name}&quot;? Organization จะถูกซ่อน (soft delete) สามารถกู้คืนได้ภายหลัง
                        </AlertDialogDescription>
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
