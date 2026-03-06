"use client"

import { useState, useTransition } from "react"
import { BoqCategoryWithItems, BoqItemWithTotal } from "@/features/boq/types"
import { createBoqItem, deleteBoqItem, deleteBoqCategory, updateBoqItem } from "@/features/boq/actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table"
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
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Props {
    category: BoqCategoryWithItems
    projectId: string
    orgId: string
    canEdit: boolean
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2 }).format(n)
}

function VarianceBadge({ variance }: { variance: number | null }) {
    if (variance == null) return <span className="text-muted-foreground text-xs">—</span>
    const overBudget = variance > 0
    return (
        <span className={cn(
            "text-xs font-semibold px-1.5 py-0.5 rounded",
            overBudget ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        )}>
            {overBudget ? "+" : ""}{formatCurrency(variance)}
        </span>
    )
}

const DEFAULT_ITEM = { name: "", unit: "ชุด", quantity: 1, unitPrice: 0, order: 0 }
const DEFAULT_EDIT = { name: "", unit: "", quantity: 0, unitPrice: 0, order: 0, actualQuantity: null as number | null, actualUnitPrice: null as number | null }

export function BoqCategorySection({ category, projectId, orgId, canEdit }: Props) {
    const [collapsed, setCollapsed] = useState(false)
    const [showAddRow, setShowAddRow] = useState(false)
    const [newItem, setNewItem] = useState(DEFAULT_ITEM)
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [editItemData, setEditItemData] = useState(DEFAULT_EDIT)
    const [isPending, startTransition] = useTransition()

    const handleEditItem = (item: BoqItemWithTotal) => {
        setEditingItemId(item.id)
        setEditItemData({
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            order: item.order,
            actualQuantity: item.actualQuantity,
            actualUnitPrice: item.actualUnitPrice,
        })
    }

    const handleUpdateItem = (itemId: string) => {
        if (!editItemData.name || !editItemData.unit) {
            toast.error("กรุณาระบุชื่อรายการและหน่วย")
            return
        }
        startTransition(async () => {
            try {
                await updateBoqItem(itemId, projectId, orgId, editItemData)
                toast.success("อัพเดทรายการสำเร็จ")
                setEditingItemId(null)
            } catch {
                toast.error("เกิดข้อผิดพลาดในการอัพเดท")
            }
        })
    }

    const handleAddItem = () => {
        if (!newItem.name || !newItem.unit) {
            toast.error("กรุณาระบุชื่อรายการและหน่วย")
            return
        }
        startTransition(async () => {
            try {
                await createBoqItem(category.id, projectId, orgId, { ...newItem, order: category.items.length })
                toast.success("เพิ่มรายการสำเร็จ")
                setNewItem(DEFAULT_ITEM)
                setShowAddRow(false)
            } catch {
                toast.error("เกิดข้อผิดพลาด")
            }
        })
    }

    const handleDeleteItem = (itemId: string) => {
        startTransition(async () => {
            try {
                await deleteBoqItem(itemId, projectId, orgId)
                toast.success("ลบรายการสำเร็จ")
            } catch {
                toast.error("เกิดข้อผิดพลาด")
            }
        })
    }

    const handleDeleteCategory = () => {
        startTransition(async () => {
            try {
                await deleteBoqCategory(category.id, projectId, orgId)
                toast.success("ลบหมวดหมู่สำเร็จ")
            } catch {
                toast.error("เกิดข้อผิดพลาด")
            }
        })
    }

    const hasAnyActual = category.items.some(i => i.actualQuantity != null || i.actualUnitPrice != null)

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Category Header */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-muted/50 cursor-pointer select-none"
                onClick={() => setCollapsed(!collapsed)}
            >
                <div className="flex items-center gap-2 font-semibold text-sm">
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {category.name}
                    <span className="text-muted-foreground font-normal ml-1">
                        ({category.items.length} รายการ)
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">
                        ฿{formatCurrency(category.categoryTotal)}
                    </span>
                    {canEdit && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); }}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>ลบหมวดหมู่นี้?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        คุณต้องการลบหมวดหมู่ &quot;{category.name}&quot; และรายการทั้งหมดที่อยู่ข้างในใช่หรือไม่? ข้อมูลที่ถูกลบไปแล้วจะไม่สามารถกู้คืนได้
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeleteCategory(); }}>
                                        ยืนยันการลบ
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Table */}
            {!collapsed && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[25%]">รายการ</TableHead>
                            <TableHead>หน่วย</TableHead>
                            <TableHead className="text-right text-blue-700">ประมาณการ (จำนวน)</TableHead>
                            <TableHead className="text-right text-blue-700">ราคา/หน่วย (฿)</TableHead>
                            <TableHead className="text-right text-blue-700">รวมประมาณการ (฿)</TableHead>
                            <TableHead className="text-right text-orange-700">ใช้จริง (จำนวน)</TableHead>
                            <TableHead className="text-right text-orange-700">ราคาจริง/หน่วย (฿)</TableHead>
                            <TableHead className="text-right text-orange-700">รวมจริง (฿)</TableHead>
                            <TableHead className="text-right">ส่วนต่าง (฿)</TableHead>
                            {canEdit && <TableHead className="w-20" />}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {category.items.map((item) => {
                            const isEditing = editingItemId === item.id;
                            const editActualTotal = editItemData.actualQuantity != null && editItemData.actualUnitPrice != null
                                ? editItemData.actualQuantity * editItemData.actualUnitPrice
                                : null
                            const editVariance = editActualTotal != null ? editActualTotal - (editItemData.quantity * editItemData.unitPrice) : null

                            return (
                                <TableRow key={item.id} className={cn("group", item.variance != null && item.variance > 0 && "bg-red-50/50")}>
                                    {/* Name */}
                                    <TableCell>
                                        {isEditing ? (
                                            <Input value={editItemData.name} onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })} className="h-8 text-sm" />
                                        ) : (
                                            <>
                                                <div>{item.name}</div>
                                                {item.note && <div className="text-xs text-muted-foreground">{item.note}</div>}
                                            </>
                                        )}
                                    </TableCell>
                                    {/* Unit */}
                                    <TableCell>
                                        {isEditing ? (
                                            <Input value={editItemData.unit} onChange={(e) => setEditItemData({ ...editItemData, unit: e.target.value })} className="h-8 text-sm w-20" />
                                        ) : item.unit}
                                    </TableCell>
                                    {/* Estimated Quantity */}
                                    <TableCell className="text-right text-blue-800">
                                        {isEditing ? (
                                            <Input type="number" min={0} value={editItemData.quantity} onChange={(e) => setEditItemData({ ...editItemData, quantity: Number(e.target.value) })} className="h-8 text-sm text-right w-24 ml-auto" />
                                        ) : formatCurrency(item.quantity)}
                                    </TableCell>
                                    {/* Estimated Unit Price */}
                                    <TableCell className="text-right text-blue-800">
                                        {isEditing ? (
                                            <Input type="number" min={0} value={editItemData.unitPrice} onChange={(e) => setEditItemData({ ...editItemData, unitPrice: Number(e.target.value) })} className="h-8 text-sm text-right w-28 ml-auto" />
                                        ) : formatCurrency(item.unitPrice)}
                                    </TableCell>
                                    {/* Estimated Total */}
                                    <TableCell className="text-right font-medium text-blue-900">
                                        {isEditing ? `฿${formatCurrency(editItemData.quantity * editItemData.unitPrice)}` : formatCurrency(item.total)}
                                    </TableCell>
                                    {/* Actual Quantity */}
                                    <TableCell className="text-right text-orange-800">
                                        {isEditing ? (
                                            <Input type="number" min={0} placeholder="—" value={editItemData.actualQuantity ?? ""} onChange={(e) => setEditItemData({ ...editItemData, actualQuantity: e.target.value === "" ? null : Number(e.target.value) })} className="h-8 text-sm text-right w-24 ml-auto" />
                                        ) : (item.actualQuantity != null ? formatCurrency(item.actualQuantity) : <span className="text-muted-foreground text-xs">—</span>)}
                                    </TableCell>
                                    {/* Actual Unit Price */}
                                    <TableCell className="text-right text-orange-800">
                                        {isEditing ? (
                                            <Input type="number" min={0} placeholder="—" value={editItemData.actualUnitPrice ?? ""} onChange={(e) => setEditItemData({ ...editItemData, actualUnitPrice: e.target.value === "" ? null : Number(e.target.value) })} className="h-8 text-sm text-right w-28 ml-auto" />
                                        ) : (item.actualUnitPrice != null ? formatCurrency(item.actualUnitPrice) : <span className="text-muted-foreground text-xs">—</span>)}
                                    </TableCell>
                                    {/* Actual Total */}
                                    <TableCell className="text-right font-medium text-orange-900">
                                        {isEditing
                                            ? (editActualTotal != null ? `฿${formatCurrency(editActualTotal)}` : <span className="text-muted-foreground text-xs">—</span>)
                                            : (item.actualTotal != null ? formatCurrency(item.actualTotal) : <span className="text-muted-foreground text-xs">—</span>)
                                        }
                                    </TableCell>
                                    {/* Variance */}
                                    <TableCell className="text-right">
                                        {isEditing
                                            ? <VarianceBadge variance={editVariance} />
                                            : <VarianceBadge variance={item.variance} />
                                        }
                                    </TableCell>
                                    {/* Actions */}
                                    {canEdit && (
                                        <TableCell>
                                            {isEditing ? (
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateItem(item.id)} disabled={isPending}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingItemId(null)} disabled={isPending}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditItem(item)} disabled={isPending}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" disabled={isPending}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>ลบรายการนี้?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    คุณต้องการลบรายการ &quot;{item.name}&quot; ใช่หรือไม่?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                                                    ยืนยันการลบ
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })}

                        {/* Add Item Row */}
                        {canEdit && showAddRow && (
                            <TableRow>
                                <TableCell>
                                    <Input placeholder="ชื่อรายการ" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="h-8 text-sm" />
                                </TableCell>
                                <TableCell>
                                    <Input placeholder="หน่วย" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="h-8 text-sm w-20" />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" min={0} value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} className="h-8 text-sm text-right w-24" />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" min={0} value={newItem.unitPrice} onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })} className="h-8 text-sm text-right w-28" />
                                </TableCell>
                                <TableCell className="text-right font-medium text-sm text-blue-900">
                                    ฿{formatCurrency(newItem.quantity * newItem.unitPrice)}
                                </TableCell>
                                <TableCell colSpan={3} className="text-muted-foreground text-xs text-center">
                                    (กรอกข้อมูลจริงหลังบันทึก)
                                </TableCell>
                                <TableCell />
                                {canEdit && (
                                    <TableCell>
                                        <Button type="button" size="sm" className="h-7 px-2 text-xs" onClick={handleAddItem} disabled={isPending}>
                                            บันทึก
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                    {canEdit && (
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={10}>
                                    {showAddRow ? (
                                        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setShowAddRow(false); setNewItem(DEFAULT_ITEM) }}>
                                            ยกเลิก
                                        </Button>
                                    ) : (
                                        <Button type="button" variant="ghost" size="sm" className="text-primary" onClick={() => setShowAddRow(true)}>
                                            <Plus className="h-3.5 w-3.5 mr-1" />
                                            เพิ่มรายการ
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            )}
        </div>
    )
}
