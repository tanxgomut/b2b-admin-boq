"use client"

import { useState } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Field } from "@/components/ui/field"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Search, CalendarRange, Tag, X, ChevronDown, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────
export interface StatusOption {
    value: string
    label: string
}

export interface FilterValues {
    name: string
    status: string       // "" = all
    dateFrom: string     // ISO date string "YYYY-MM-DD" or ""
    dateTo: string
}

interface Props {
    statusOptions?: StatusOption[]
    onChange: (filters: FilterValues) => void
    defaultValues?: Partial<FilterValues>
    className?: string
}

const EMPTY: FilterValues = { name: "", status: "", dateFrom: "", dateTo: "" }

// ─── Component ──────────────────────────────────────────────────────
export function SearchFilterBar({ statusOptions, onChange, defaultValues, className }: Props) {
    const [filters, setFilters] = useState<FilterValues>({ ...EMPTY, ...defaultValues })

    const [openPanels, setOpenPanels] = useState({ name: true, status: true, date: true })

    // Calendar range state (keeps the Date objects for display)
    const [range, setRange] = useState<DateRange | undefined>(undefined)
    const [calendarOpen, setCalendarOpen] = useState(false)

    const togglePanel = (panel: keyof typeof openPanels) =>
        setOpenPanels((prev) => ({ ...prev, [panel]: !prev[panel] }))

    const update = (patch: Partial<FilterValues>) => {
        const next = { ...filters, ...patch }
        setFilters(next)
        onChange(next)
    }

    const reset = () => {
        setFilters({ ...EMPTY })
        setRange(undefined)
        onChange({ ...EMPTY })
    }

    const handleRangeSelect = (r: DateRange | undefined) => {
        setRange(r)
        update({
            dateFrom: r?.from ? format(r.from, "yyyy-MM-dd") : "",
            dateTo: r?.to ? format(r.to, "yyyy-MM-dd") : "",
        })
        if (r?.from && r?.to) setCalendarOpen(false)
    }

    const clearDate = () => {
        setRange(undefined)
        update({ dateFrom: "", dateTo: "" })
    }

    const hasActiveFilters = filters.name !== "" || filters.status !== "" || filters.dateFrom !== "" || filters.dateTo !== ""
    const activeCount = [filters.name !== "", filters.status !== "", filters.dateFrom !== "" || filters.dateTo !== ""].filter(Boolean).length

    const dateLabel = range?.from
        ? range.to
            ? `${format(range.from, "d MMM", { locale: th })} – ${format(range.to, "d MMM yy", { locale: th })}`
            : format(range.from, "d MMM yyyy", { locale: th })
        : "เลือกช่วงวันที่"

    return (
        <div className={cn("rounded-xl border bg-card shadow-sm overflow-hidden", className)}>
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/20">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">ค้นหาและกรอง</span>
                {activeCount > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">{activeCount}</Badge>
                )}
                <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                    <ToggleChip icon={<Search className="h-3 w-3" />} label="ชื่อ" active={openPanels.name} hasValue={filters.name !== ""} onClick={() => togglePanel("name")} />
                    {statusOptions && statusOptions.length > 0 && (
                        <ToggleChip icon={<Tag className="h-3 w-3" />} label="สถานะ" active={openPanels.status} hasValue={filters.status !== ""} onClick={() => togglePanel("status")} />
                    )}
                    <ToggleChip icon={<CalendarRange className="h-3 w-3" />} label="วันที่" active={openPanels.date} hasValue={filters.dateFrom !== "" || filters.dateTo !== ""} onClick={() => togglePanel("date")} />
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={reset}>
                            <X className="h-3 w-3 mr-1" /> ล้าง
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter panels */}
            {(openPanels.name || openPanels.status || openPanels.date) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 py-3 items-end">

                    {/* Name */}
                    {openPanels.name && (
                        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                            <label className="text-xs text-muted-foreground font-medium">ค้นหาชื่อ</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="พิมพ์ชื่อโปรเจ็ก..."
                                    value={filters.name}
                                    onChange={(e) => update({ name: e.target.value })}
                                    className="pl-8 h-8 text-sm"
                                />
                                {filters.name && (
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => update({ name: "" })}>
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    {openPanels.status && statusOptions && statusOptions.length > 0 && (
                        <div className="flex flex-col gap-1 min-w-[160px]">
                            <Field>
                                <label className="text-xs text-muted-foreground font-medium">สถานะ</label>
                                <Select value={filters.status || "__all__"} onValueChange={(v) => update({ status: v === "__all__" ? "" : v })}>
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="ทั้งหมด" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">ทั้งหมด</SelectItem>
                                        {statusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    )}

                    {/* Date range — Shadcn Calendar Popover */}
                    {openPanels.date && (

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-xs text-muted-foreground font-medium">ช่วงวันที่สร้าง</label>
                            <div className="flex items-center gap-2">
                                <Field>
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={cn(
                                                    "h-8 justify-start text-left font-normal text-sm min-w-[230px]",
                                                    !range?.from && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarDays className="mr-2 h-3.5 w-3.5" />
                                                {dateLabel}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                selected={range}
                                                onSelect={handleRangeSelect}
                                                numberOfMonths={2}
                                                captionLayout="dropdown"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </Field>
                                {(range?.from || range?.to) && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={clearDate}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>

                    )}
                </div>
            )}
        </div>
    )
}

// ─── Internal chip toggle button ─────────────────────────────────────
function ToggleChip({ icon, label, active, hasValue, onClick }: {
    icon: React.ReactNode
    label: string
    active: boolean
    hasValue: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors",
                active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-transparent text-muted-foreground hover:bg-accent",
                hasValue && !active && "border-orange-300 bg-orange-50 text-orange-700"
            )}
        >
            {icon}
            <span>{label}</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", active && "rotate-180")} />
        </button>
    )
}
