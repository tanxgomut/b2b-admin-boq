"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { updateBoqProject } from "@/features/boq/actions"
import { BoqStatus, BOQ_STATUS_LABEL } from "@/features/boq/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Props {
    projectId: string
    orgId: string
    currentStatus: BoqStatus
    canEdit: boolean
}

export function BoqStatusSelect({ projectId, orgId, currentStatus, canEdit }: Props) {
    const [isPending, startTransition] = useTransition()

    if (!canEdit) {
        return null // If they can't edit, the badge is enough
    }

    const handleStatusChange = (newStatus: BoqStatus) => {
        startTransition(async () => {
            try {
                await updateBoqProject(projectId, orgId, { status: newStatus })
                toast.success("อัพเดทสถานะสำเร็จ")
            } catch {
                toast.error("เกิดข้อผิดพลาดในการอัพเดทสถานะ")
            }
        })
    }

    return (
        <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            disabled={isPending}
        >
            <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(BOQ_STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                        {label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
