"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { MapPin, FileText, Trash2 } from "lucide-react"
import { BoqStatusBadge } from "./BoqStatusBadge"
import { BoqStatus } from "@/features/boq/types"
import { deleteBoqProject } from "@/features/boq/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { SearchFilterBar, FilterValues } from "@/components/common/SearchFilterBar"

const BOQ_STATUS_OPTIONS = [
    { value: "DRAFT", label: "แบบร่าง" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "CANCELLED", label: "ยกเลิก" },
]

interface Project {
    id: string
    name: string
    description: string | null
    location: string | null
    status: BoqStatus
    grandTotal: number
    itemCount: number
    createdAt: Date
}

interface Props {
    projects: Project[]
    orgId: string
    canDelete: boolean
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 2,
    }).format(amount)
}

function DeleteButton({ projectId, projectName, orgId }: { projectId: string; projectName: string; orgId: string }) {
    const [isPending, startTransition] = useTransition()
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>ลบโปรเจ็กนี้?</AlertDialogTitle>
                    <AlertDialogDescription>
                        คุณต้องการลบโปรเจ็ก &quot;{projectName}&quot; พร้อมรายการ BOQ ทั้งหมดใช่หรือไม่?
                        ข้อมูลที่ถูกลบไปแล้วจะไม่สามารถกู้คืนได้
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => startTransition(async () => { await deleteBoqProject(projectId, orgId) })}
                        disabled={isPending}
                    >
                        ยืนยันการลบ
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function BoqProjectList({ projects, orgId, canDelete }: Props) {
    const [filters, setFilters] = useState<FilterValues>({ name: "", status: "", dateFrom: "", dateTo: "" })

    const filtered = projects.filter((p) => {
        if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false
        if (filters.status && p.status !== filters.status) return false
        if (filters.dateFrom) {
            const from = new Date(filters.dateFrom)
            from.setHours(0, 0, 0, 0)
            if (new Date(p.createdAt) < from) return false
        }
        if (filters.dateTo) {
            const to = new Date(filters.dateTo)
            to.setHours(23, 59, 59, 999)
            if (new Date(p.createdAt) > to) return false
        }
        return true
    })

    return (
        <div className="space-y-4">
            <SearchFilterBar statusOptions={BOQ_STATUS_OPTIONS} onChange={setFilters} />

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <FileText className="h-12 w-12 opacity-30" />
                    <p className="text-sm">
                        {projects.length === 0
                            ? "ยังไม่มีโปรเจ็ก BOQ — กดปุ่ม \"สร้างโปรเจ็กใหม่\" เพื่อเริ่ม"
                            : "ไม่พบโปรเจ็กที่ตรงกับเงื่อนไขการค้นหา"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base leading-tight">{project.name}</CardTitle>
                                    <BoqStatusBadge status={project.status} />
                                </div>
                                {project.location && (
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {project.location}
                                    </CardDescription>
                                )}
                                {project.description && (
                                    <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">รายการทั้งหมด</span>
                                    <span className="font-medium">{project.itemCount} รายการ</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-muted-foreground">ยอดรวม</span>
                                    <span className="font-semibold text-primary">{formatCurrency(project.grandTotal)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    สร้างเมื่อ {new Date(project.createdAt).toLocaleDateString("th-TH", { dateStyle: "medium" })}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-2 gap-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link href={`/${orgId}/boq/${project.id}`}>ดูรายละเอียด</Link>
                                </Button>
                                {canDelete && (
                                    <DeleteButton projectId={project.id} projectName={project.name} orgId={orgId} />
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
