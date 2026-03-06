"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, Search, Key } from "lucide-react"
import { deletePermission } from "@/features/permission/actions"
import { PermissionDialog } from "./PermissionDialog"
import type { PermissionRow, ResourceRow } from "@/features/permission/types"

type Props = {
    permissions: PermissionRow[]
    resources: ResourceRow[]
    onRefresh: () => void
}

export function PermissionTable({ permissions, resources, onRefresh }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedPerm, setSelectedPerm] = useState<PermissionRow | null>(null)
    const [search, setSearch] = useState("")
    const [filterResourceId, setFilterResourceId] = useState("__all__")
    const [isPending, startTransition] = useTransition()

    const filtered = permissions.filter((p) => {
        const matchSearch = p.key.toLowerCase().includes(search.toLowerCase())
        const matchResource =
            filterResourceId === "__all__" || p.resourceId === filterResourceId
        return matchSearch && matchResource
    })

    const handleDeleteConfirm = () => {
        if (!selectedPerm) return
        startTransition(async () => {
            const result = await deletePermission(selectedPerm.id)
            if (result.success) {
                toast.success("ลบ Permission สำเร็จ")
                onRefresh()
            } else {
                toast.error(result.error)
            }
            setDeleteOpen(false)
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Permissions</h3>
                    <p className="text-sm text-muted-foreground">สิทธิ์การใช้งานทั้งหมดในระบบ</p>
                </div>
                <Button
                    size="sm"
                    onClick={() => {
                        setSelectedPerm(null)
                        setDialogOpen(true)
                    }}
                >
                    <Plus className="mr-1 h-4 w-4" />
                    เพิ่ม Permission
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหา permission key..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={filterResourceId} onValueChange={setFilterResourceId}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="ทุก Resource" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__all__">ทุก Resource</SelectItem>
                        {resources.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                                {r.type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Permission Key</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>คำอธิบาย</TableHead>
                            <TableHead className="w-[100px]">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    ไม่พบข้อมูล Permission
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((perm) => (
                                <TableRow key={perm.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Key className="h-4 w-4 text-muted-foreground" />
                                            <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
                                                {perm.key}
                                            </code>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono">
                                            {perm.resource.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {perm.description ?? <span className="italic">—</span>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    setSelectedPerm(perm)
                                                    setDialogOpen(true)
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setSelectedPerm(perm)
                                                    setDeleteOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PermissionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                permission={selectedPerm}
                resources={resources}
                onSuccess={onRefresh}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ Permission</AlertDialogTitle>
                        <AlertDialogDescription>
                            ต้องการลบ Permission &quot;{selectedPerm?.key}&quot; ใช่ไหม?
                            Role ทั้งหมดที่มี permission นี้จะสูญเสียสิทธิ์ดังกล่าว
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDeleteConfirm}
                            disabled={isPending}
                        >
                            {isPending ? "กำลังลบ..." : "ลบ"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
