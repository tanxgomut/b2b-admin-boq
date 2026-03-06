import { z } from "zod"

// ─── Zod Schemas ───────────────────────────────────────────────
export const createBoqProjectSchema = z.object({
    name: z.string().min(1, "กรุณาระบุชื่อโปรเจ็ก"),
    description: z.string().optional(),
    location: z.string().optional(),
})

export const updateBoqProjectSchema = createBoqProjectSchema.partial().extend({
    status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
})

export const createBoqCategorySchema = z.object({
    name: z.string().min(1, "กรุณาระบุชื่อหมวดหมู่"),
    order: z.number().int().default(0),
})

export const createBoqItemSchema = z.object({
    name: z.string().min(1, "กรุณาระบุชื่อรายการ"),
    unit: z.string().min(1, "กรุณาระบุหน่วย"),
    quantity: z.number().positive("ปริมาณต้องมากกว่า 0"),
    unitPrice: z.number().min(0, "ราคาต้องไม่ติดลบ"),
    note: z.string().optional(),
    order: z.number().int().default(0),
})

export const updateBoqItemSchema = createBoqItemSchema.partial().extend({
    actualQuantity: z.number().min(0).optional().nullable(),
    actualUnitPrice: z.number().min(0).optional().nullable(),
})

// ─── TypeScript Types ───────────────────────────────────────────
export type CreateBoqProjectInput = z.infer<typeof createBoqProjectSchema>
export type UpdateBoqProjectInput = z.infer<typeof updateBoqProjectSchema>
export type CreateBoqCategoryInput = z.infer<typeof createBoqCategorySchema>
export type CreateBoqItemInput = z.infer<typeof createBoqItemSchema>
export type UpdateBoqItemInput = z.infer<typeof updateBoqItemSchema>

export type BoqStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export const BOQ_STATUS_LABEL: Record<BoqStatus, string> = {
    DRAFT: "ร่าง",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    CANCELLED: "ยกเลิก",
}

export const BOQ_STATUS_COLOR: Record<BoqStatus, string> = {
    DRAFT: "secondary",
    IN_PROGRESS: "default",
    COMPLETED: "default",
    CANCELLED: "destructive",
}

// ─── Result Types ───────────────────────────────────────────────
export type BoqItemWithTotal = {
    id: string
    categoryId: string
    name: string
    unit: string
    quantity: number
    unitPrice: number
    total: number
    actualQuantity: number | null
    actualUnitPrice: number | null
    actualTotal: number | null
    variance: number | null  // actualTotal - total (negative = over budget)
    note: string | null
    order: number
}

export type BoqCategoryWithItems = {
    id: string
    projectId: string
    name: string
    order: number
    items: BoqItemWithTotal[]
    categoryTotal: number
}

export type BoqVersion = {
    id: string
    versionNo: number
    label: string | null
    createdAt: Date
    createdBy: string
}

export type BoqProjectWithSummary = {
    id: string
    orgId: string
    name: string
    description: string | null
    location: string | null
    status: BoqStatus
    isLocked: boolean
    lockedAt: Date | null
    lockedBy: string | null
    createdBy: string
    createdAt: Date
    updatedAt: Date
    categories: BoqCategoryWithItems[]
    grandTotal: number
    versions: BoqVersion[]
}
