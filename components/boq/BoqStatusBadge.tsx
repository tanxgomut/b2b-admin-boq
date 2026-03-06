import { Badge } from "@/components/ui/badge"
import { BoqStatus, BOQ_STATUS_LABEL } from "@/features/boq/types"
import { cn } from "@/lib/utils"

interface Props {
    status: BoqStatus
}

const statusVariant: Record<BoqStatus, "secondary" | "default" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    IN_PROGRESS: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
}

export function BoqStatusBadge({ status }: Props) {
    return (
        <Badge variant={statusVariant[status]}>
            {BOQ_STATUS_LABEL[status]}
        </Badge>
    )
}
