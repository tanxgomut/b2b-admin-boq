"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { saveBoqVersion, getBoqVersionSnapshot } from "@/features/boq/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { History, Plus, Eye } from "lucide-react"

interface Version {
    id: string
    versionNo: number
    label: string | null
    createdAt: Date
}

interface SnapshotItem {
    id: string
    name: string
    unit: string
    quantity: number
    unitPrice: number
    actualQuantity: number | null
    actualUnitPrice: number | null
    note: string | null
}

interface SnapshotCategory {
    id: string
    name: string
    items: SnapshotItem[]
}

interface SnapshotData {
    name: string
    categories: SnapshotCategory[]
}

interface Props {
    projectId: string
    orgId: string
    versions: Version[]
}

function formatNum(n: number) {
    return new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2 }).format(n)
}

export function BoqVersionPanel({ projectId, orgId, versions }: Props) {
    const [label, setLabel] = useState("")
    const [isPending, startTransition] = useTransition()
    const [snapshot, setSnapshot] = useState<SnapshotData | null>(null)
    const [snapshotLabel, setSnapshotLabel] = useState("")
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleSave = () => {
        startTransition(async () => {
            try {
                const result = await saveBoqVersion(projectId, orgId, label.trim() || undefined)
                toast.success(`บันทึก "${result.label}" สำเร็จ`)
                setLabel("")
            } catch {
                toast.error("เกิดข้อผิดพลาดในการบันทึกเวอร์ชัน")
            }
        })
    }

    const handleView = async (versionId: string, vLabel: string | null, vNo: number) => {
        setLoadingId(versionId)
        try {
            const data = await getBoqVersionSnapshot(versionId, orgId)
            if (data?.snapshot) {
                setSnapshot(data.snapshot as unknown as SnapshotData)
                setSnapshotLabel(vLabel ?? `Version ${vNo}`)
            }
        } catch {
            toast.error("ไม่สามารถโหลด snapshot ได้")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <>
            {/* Snapshot Viewer Dialog */}
            <Dialog open={!!snapshot} onOpenChange={(open) => !open && setSnapshot(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>📄 {snapshotLabel}</DialogTitle>
                    </DialogHeader>
                    {snapshot && (
                        <div className="space-y-4 mt-2">
                            {snapshot.categories.map((cat) => {
                                const catTotal = cat.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
                                return (
                                    <div key={cat.id} className="border rounded-lg overflow-hidden">
                                        <div className="flex justify-between items-center px-4 py-2 bg-muted/50 font-semibold text-sm">
                                            <span>{cat.name}</span>
                                            <span className="text-primary">฿{formatNum(catTotal)}</span>
                                        </div>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b bg-muted/20">
                                                    <th className="text-left px-3 py-1.5">รายการ</th>
                                                    <th className="text-right px-3 py-1.5">จำนวน</th>
                                                    <th className="text-right px-3 py-1.5">หน่วย</th>
                                                    <th className="text-right px-3 py-1.5">ราคา/หน่วย</th>
                                                    <th className="text-right px-3 py-1.5">รวม</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cat.items.map((item) => (
                                                    <tr key={item.id} className="border-b last:border-0">
                                                        <td className="px-3 py-1.5">{item.name}</td>
                                                        <td className="px-3 py-1.5 text-right">{formatNum(item.quantity)}</td>
                                                        <td className="px-3 py-1.5 text-right">{item.unit}</td>
                                                        <td className="px-3 py-1.5 text-right">{formatNum(item.unitPrice)}</td>
                                                        <td className="px-3 py-1.5 text-right font-medium">
                                                            ฿{formatNum(item.quantity * item.unitPrice)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            })}

                            {/* Grand total */}
                            <div className="flex justify-end">
                                <div className="rounded-lg border bg-primary/5 px-6 py-3 text-right">
                                    <p className="text-xs text-muted-foreground mb-0.5">ยอดรวมทั้งสิ้น</p>
                                    <p className="text-xl font-bold text-primary">
                                        ฿{formatNum(snapshot.categories.reduce(
                                            (s, cat) => s + cat.items.reduce((si, i) => si + i.quantity * i.unitPrice, 0), 0
                                        ))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Sheet Panel */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <History className="h-3.5 w-3.5" />
                        เวอร์ชัน ({versions.length})
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-[380px] sm:w-[420px] px-2">
                    <SheetHeader>
                        <SheetTitle>ประวัติเวอร์ชัน BOQ</SheetTitle>
                    </SheetHeader>

                    {/* Save new version */}
                    <div className="mt-4 space-y-2 border rounded-lg p-3 bg-muted/30 mx-2">
                        <p className="text-xs text-muted-foreground font-medium">บันทึกเวอร์ชันปัจจุบัน</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder={`Version ${versions.length + 1}`}
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="h-8 text-sm"
                            />
                            <Button size="sm" className="h-8 shrink-0" onClick={handleSave} disabled={isPending}>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                บันทึก
                            </Button>
                        </div>
                    </div>

                    {/* Version list */}
                    <div className="mt-4 space-y-2 mx-2">
                        {versions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                ยังไม่มีเวอร์ชันที่บันทึกไว้
                            </p>
                        ) : (
                            versions.map((v) => (
                                <div key={v.id} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium">{v.label ?? `Version ${v.versionNo}`}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {new Date(v.createdAt).toLocaleString("th-TH", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                                            v{v.versionNo}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            disabled={loadingId === v.id}
                                            onClick={() => handleView(v.id, v.label, v.versionNo)}
                                            title="ดูรายละเอียด"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
