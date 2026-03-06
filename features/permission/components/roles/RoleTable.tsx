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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Pencil, Trash2, Plus, ShieldCheck } from "lucide-react"
import { deleteRole } from "@/features/permission/actions"
import { RoleDialog } from "./RoleDialog"
import type { RoleRow } from "@/features/permission/types"

type Props = {
    roles: RoleRow[]
    onRefresh: () => void
}

export function RoleTable({ roles, onRefresh }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleEdit = (role: RoleRow) => {
        setSelectedRole(role)
        setDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (!selectedRole) return
        startTransition(async () => {
            const result = await deleteRole(selectedRole.id)
            if (result.success) {
                toast.success("ลบ Role สำเร็จ")
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
                    <h3 className="text-lg font-semibold">Roles</h3>
                    <p className="text-sm text-muted-foreground">บทบาทผู้ใช้งานในระบบ</p>
                </div>
                <Button
                    size="sm"
                    onClick={() => {
                        setSelectedRole(null)
                        setDialogOpen(true)
                    }}
                >
                    <Plus className="mr-1 h-4 w-4" />
                    เพิ่ม Role
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อ Role</TableHead>
                            <TableHead className="text-center">Level</TableHead>
                            <TableHead className="text-center">Permissions</TableHead>
                            <TableHead className="w-[100px]">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    ยังไม่มีข้อมูล Role
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                            {role.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{role.level}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">
                                            {role._count?.permissions ?? 0} permissions
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(role)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setSelectedRole(role)
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

            <RoleDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                role={selectedRole}
                onSuccess={onRefresh}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            ต้องการลบ Role &quot;{selectedRole?.name}&quot; ใช่ไหม? การกระทำนี้ไม่สามารถย้อนกลับได้
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
