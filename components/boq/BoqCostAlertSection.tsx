import { AlertTriangle, TrendingUp } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface OverBudgetCategory {
    id: string
    name: string
    estimated: number
    actual: number
    variance: number
    percentOver: number
}

interface Props {
    overBudgetCategories: OverBudgetCategory[]
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n)
}

export function BoqCostAlertSection({ overBudgetCategories }: Props) {
    if (overBudgetCategories.length === 0) return null

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>หมวดงานที่เกินงบประมาณ ({overBudgetCategories.length} หมวด)</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
                {overBudgetCategories.map((cat) => (
                    <div key={cat.id} className={cn(
                        "flex items-start justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 gap-3"
                    )}>
                        <div>
                            <p className="text-sm font-medium text-red-800">{cat.name}</p>
                            <p className="text-xs text-red-600 mt-0.5">
                                งบ: {formatCurrency(cat.estimated)} → จริง: {formatCurrency(cat.actual)}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-red-700">+{formatCurrency(cat.variance)}</p>
                            <p className="text-xs text-red-500">เกิน {cat.percentOver.toFixed(1)}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
