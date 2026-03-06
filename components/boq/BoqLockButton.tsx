"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { lockBoqProject, unlockBoqProject } from "@/features/boq/actions"
import { Button } from "@/components/ui/button"
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
import { Lock, LockOpen } from "lucide-react"

interface Props {
    projectId: string
    orgId: string
    isLocked: boolean
    lockedAt: Date | null
    canApprove: boolean
}

export function BoqLockButton({ projectId, orgId, isLocked, lockedAt, canApprove }: Props) {
    const [isPending, startTransition] = useTransition()

    if (!canApprove) return null

    const handleLock = () => {
        startTransition(async () => {
            try {
                await lockBoqProject(projectId, orgId)
                toast.success("ล็อก BOQ สำเร็จ — ข้อมูลประมาณการถูกอนุมัติเป็น Baseline แล้ว")
            } catch {
                toast.error("เกิดข้อผิดพลาด ไม่สามารถล็อกได้")
            }
        })
    }

    const handleUnlock = () => {
        startTransition(async () => {
            try {
                await unlockBoqProject(projectId, orgId)
                toast.success("ปลดล็อก BOQ สำเร็จ")
            } catch {
                toast.error("เกิดข้อผิดพลาด ไม่สามารถปลดล็อกได้")
            }
        })
    }

    if (isLocked) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50" disabled={isPending}>
                        <Lock className="h-3.5 w-3.5" />
                        ล็อกอยู่ {lockedAt && `(${new Date(lockedAt).toLocaleDateString("th-TH")})`}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ปลดล็อก BOQ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            หากปลดล็อก ผู้ใช้ที่มีสิทธิ์จะสามารถแก้ไขข้อมูลประมาณการได้อีกครั้ง คุณต้องการดำเนินการต่อไหม?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnlock}>ยืนยันการปลดล็อก</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5" disabled={isPending}>
                    <LockOpen className="h-3.5 w-3.5" />
                    อนุมัติ & ล็อก BOQ
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>อนุมัติ & ล็อก BOQ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        การล็อก BOQ จะทำให้ข้อมูล <strong>ประมาณการ</strong> (Estimated) ทั้งหมดถูกยึดไว้เป็น Baseline
                        และจะไม่สามารถแก้ไขได้จนกว่าจะมีการปลดล็อก ยังคงสามารถกรอกข้อมูลต้นทุนจริงได้ตามปกติ
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLock}>ยืนยันการอนุมัติ</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
