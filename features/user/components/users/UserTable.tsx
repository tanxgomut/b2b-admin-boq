"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, ShieldCheck, ShieldOff } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { SearchFilterBar, type FilterValues } from "@/components/common/SearchFilterBar"
import { deleteUser } from "@/features/user/actions"
import { UserSheet } from "./UserSheet"
import { usePermission } from "@/components/providers/permission-provider"
import type { UserRow } from "@/features/user/types"

type Props = { users: UserRow[]; onRefresh: () => void }

export function UserTable({ users, onRefresh }: Props) {
    const canCreate = usePermission("user:create")
    const canUpdate = usePermission("user:update")
    const canDelete = usePermission("user:delete")

    const [sheetOpen, setSheetOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<UserRow | null>(null)
    const [isPending, startTransition] = useTransition()
    const [filters, setFilters] = useState<FilterValues>({ name: "", status: "", dateFrom: "", dateTo: "" })

    const credentialOptions = [
        { value: "yes", label: "มีรหัสผ่าน" },
        { value: "no", label: "ไม่มีรหัสผ่าน" },
    ]

    const filtered = users.filter(u => {
        const search = filters.name.toLowerCase()
        const matchName = u.email.toLowerCase().includes(search) || (u.name ?? "").toLowerCase().includes(search)
        const matchCred = !filters.status
            || (filters.status === "yes" && u.hasCredential)
            || (filters.status === "no" && !u.hasCredential)
        const matchFrom = !filters.dateFrom || new Date(u.createdAt) >= new Date(filters.dateFrom)
        const matchTo = !filters.dateTo || new Date(u.createdAt) <= new Date(filters.dateTo)
        return matchName && matchCred && matchFrom && matchTo
    })

    const handleDelete = () => {
        if (!selected) return
        startTransition(async () => {
            const result = await deleteUser(selected.id)
            result.success ? toast.success("ลบผู้ใช้สำเร็จ") : toast.error(result.error)
            setDeleteOpen(false)
            onRefresh()
        })
    }

    const initials = (u: UserRow) => (u.name ?? u.email).slice(0, 2).toUpperCase()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Users</h3>
                    <p className="text-sm text-muted-foreground">ผู้ใช้ในระบบทั้งหมด</p>
                </div>
                {canCreate && (
                    <Button size="sm" onClick={() => { setSelected(null); setSheetOpen(true) }}>
                        <Plus className="mr-1 h-4 w-4" /> เพิ่มผู้ใช้
                    </Button>
                )}
            </div>

            <SearchFilterBar statusOptions={credentialOptions} onChange={setFilters} />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ผู้ใช้</TableHead>
                            <TableHead>รหัสผ่าน</TableHead>
                            <TableHead className="text-center">Orgs</TableHead>
                            <TableHead className="text-center">Teams</TableHead>
                            <TableHead>วันที่สร้าง</TableHead>
                            <TableHead className="w-[100px]">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">ไม่พบข้อมูล</TableCell></TableRow>
                        ) : filtered.map(u => (
                            <TableRow key={u.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={u.image ?? undefined} />
                                            <AvatarFallback className="text-xs">{initials(u)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm leading-none">{u.name ?? "—"}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {u.hasCredential
                                        ? <Badge variant="secondary" className="gap-1 text-green-600"><ShieldCheck className="h-3 w-3" />มีรหัสผ่าน</Badge>
                                        : <Badge variant="outline" className="gap-1 text-muted-foreground"><ShieldOff className="h-3 w-3" />ไม่มี</Badge>
                                    }
                                </TableCell>
                                <TableCell className="text-center"><Badge variant="outline">{u._count.orgs}</Badge></TableCell>
                                <TableCell className="text-center"><Badge variant="outline">{u._count.teams}</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {format(new Date(u.createdAt), "d MMM yyyy", { locale: th })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {canUpdate && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(u); setSheetOpen(true) }}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setSelected(u); setDeleteOpen(true) }}>
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

            <UserSheet open={sheetOpen} onOpenChange={setSheetOpen} user={selected} onSuccess={onRefresh} />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบผู้ใช้</AlertDialogTitle>
                        <AlertDialogDescription>
                            ลบ &quot;{selected?.name ?? selected?.email}&quot;? การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบ
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
