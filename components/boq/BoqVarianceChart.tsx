"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface CategoryData {
    name: string
    estimated: number
    actual: number | null
}

interface Props {
    categories: CategoryData[]
}

const chartConfig: ChartConfig = {
    estimated: {
        label: "งบประมาณ (ประมาณการ)",
        color: "hsl(220 9% 64%)",
    },
    actual: {
        label: "ต้นทุนจริง",
        color: "hsl(340 60% 80%)",
    },
}

export function BoqVarianceChart({ categories }: Props) {
    const hasAnyActual = categories.some(c => c.actual != null)

    if (!hasAnyActual) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                ยังไม่มีข้อมูลต้นทุนจริง — กรอกข้อมูลในตารางด้านล่างก่อน
            </div>
        )
    }

    const data = categories.map((c) => ({
        name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
        fullName: c.name,
        estimated: c.estimated,
        actual: c.actual ?? 0,
        overBudget: c.actual != null && c.actual > c.estimated,
    }))

    return (
        <ChartContainer config={chartConfig} className="max-h-[280px] w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tickFormatter={(v: number) =>
                        v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v)
                    }
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value) =>
                                new Intl.NumberFormat("th-TH", {
                                    style: "currency",
                                    currency: "THB",
                                    maximumFractionDigits: 0,
                                }).format(value as number)
                            }
                        />
                    }
                />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <ChartLegend content={(props: any) => <ChartLegendContent {...props} />} />
                <Bar dataKey="estimated" fill="var(--color-estimated)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={index}
                            fill={entry.overBudget ? "hsl(0 72% 51%)" : "hsl(340 60% 80%)"}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}
