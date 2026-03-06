"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Props {
    estimatedTotal: number
    actualTotal: number | null
    grandVariance: number | null
    categoryCount: number
    itemCount: number
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function BoqSummaryBar({
    estimatedTotal,
    actualTotal,
    grandVariance,
    categoryCount,
    itemCount,
}: Props) {
    const hasActual = actualTotal != null

    // Percentage of actual vs. estimated (capped at 100 for bar display)
    const usagePercent = hasActual && estimatedTotal > 0
        ? Math.min((actualTotal! / estimatedTotal) * 100, 100)
        : 0

    const isOverBudget = grandVariance != null && grandVariance > 0

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            {/* Top row: 4 stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
                {/* Category count */}
                <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">หมวดหมู่</p>
                    <p className="text-2xl font-bold mt-1">{categoryCount}</p>
                </div>
                {/* Item count */}
                <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">รายการทั้งหมด</p>
                    <p className="text-2xl font-bold mt-1">{itemCount}</p>
                </div>
                {/* Estimated total */}
                <div className="p-4 text-center">
                    <p className="text-xs text-blue-600">งบประมาณ (ประเมิน)</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(estimatedTotal)}</p>
                </div>
                {/* Actual total */}
                <div className="p-4 text-center">
                    <p className="text-xs text-orange-600">ต้นทุนจริง</p>
                    <p className={cn(
                        "text-2xl font-bold mt-1",
                        !hasActual ? "text-muted-foreground" : isOverBudget ? "text-red-600" : "text-green-600"
                    )}>
                        {hasActual ? formatCurrency(actualTotal!) : "—"}
                    </p>
                </div>
            </div>

            {/* Budget usage bar */}
            {hasActual && estimatedTotal > 0 && (
                <div className="px-5 pb-4 pt-2 border-t bg-muted/30">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">การใช้งบประมาณ</span>
                        <span className={cn("font-semibold", isOverBudget ? "text-red-600" : "text-green-600")}>
                            {usagePercent.toFixed(1)}%
                            {grandVariance != null && (
                                <span className="ml-2">
                                    ({isOverBudget ? "+" : ""}{formatCurrency(grandVariance)})
                                </span>
                            )}
                        </span>
                    </div>
                    <Progress
                        value={usagePercent}
                        className={cn("h-2.5 rounded-full", isOverBudget ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500")}
                    />
                </div>
            )}
        </div>
    )
}
