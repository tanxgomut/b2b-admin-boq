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
import { Pencil, Trash2, Plus, Layers } from "lucide-react"
import { deleteResource } from "@/features/permission/actions"
import { ResourceDialog } from "./ResourceDialog"
import type { ResourceRow } from "@/features/permission/types"

type Props = {
    resources: ResourceRow[]
    onRefresh: () => void
}

export function ResourceTable({ resources, onRefresh }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedResource, setSelectedResource] = useState<ResourceRow | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleDeleteConfirm = () => {
        if (!selectedResource) return
        startTransition(async () => {
            const result = await deleteResource(selectedResource.id)
            if (result.success) {
                toast.success("ลบ Resource สำเร็จ")
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
                    <h3 className="text-lg font-semibold">Resources</h3>
                    <p className="text-sm text-muted-foreground">กลุ่ม Resource ในระบบ</p>
                </div>
                <Button
                    size="sm"
                    onClick={() => {
                        setSelectedResource(null)
                        setDialogOpen(true)
                    }}
                >
                    <Plus className="mr-1 h-4 w-4" />
                    เพิ่ม Resource
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อ Resource</TableHead>
                            <TableHead className="text-center">Permissions</TableHead>
                            <TableHead className="w-[100px]">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    ยังไม่มีข้อมูล Resource
                                </TableCell>
                            </TableRow>
                        ) : (
                            resources.map((res) => (
                                <TableRow key={res.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="secondary" className="font-mono text-sm">
                                                {res.type}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">
                                            {res._count?.permissions ?? 0} permissions
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    setSelectedResource(res)
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
                                                    setSelectedResource(res)
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

            <ResourceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                resource={selectedResource}
                onSuccess={onRefresh}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ Resource</AlertDialogTitle>
                        <AlertDialogDescription>
                            ต้องการลบ Resource &quot;{selectedResource?.type}&quot; ใช่ไหม?
                            <br />
                            <span className="text-destructive font-medium">
                                หาก Resource นี้มี Permissions อยู่ จะไม่สามารถลบได้
                            </span>
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
