import { z } from "zod"

// ─────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────

export const RoleSchema = z.object({
    name: z.string().min(1, "กรุณาระบุชื่อ Role"),
    level: z.coerce.number().int().min(1, "Level ต้องมากกว่า 0"),
})

export const ResourceSchema = z.object({
    type: z.string().min(1, "กรุณาระบุชื่อ Resource").toLowerCase(),
})

export const PermissionSchema = z.object({
    key: z
        .string()
        .min(1, "กรุณาระบุ Permission key")
        .regex(/^[a-z_]+:[a-z_]+$/, "รูปแบบต้องเป็น resource:action เช่น users:read"),
    description: z.string().optional(),
    resourceId: z.string().min(1, "กรุณาเลือก Resource"),
})

// ─────────────────────────────────────────
// TypeScript Types (inferred from schema)
// ─────────────────────────────────────────

export type RoleFormData = z.infer<typeof RoleSchema>
export type ResourceFormData = z.infer<typeof ResourceSchema>
export type PermissionFormData = z.infer<typeof PermissionSchema>

// ─────────────────────────────────────────
// DB / Query Types
// ─────────────────────────────────────────

export type RoleRow = {
    id: string
    name: string
    level: number
    createdAt: Date
    _count?: { permissions: number }
}

export type ResourceRow = {
    id: string
    type: string
    _count?: { permissions: number }
}

export type PermissionRow = {
    id: string
    key: string
    description: string | null
    resourceId: string
    createdAt: Date
    resource: { id: string; type: string }
}

export type RolePermissionRow = {
    id: string
    roleId: string
    permissionId: string
}

// ─────────────────────────────────────────
// Action Response Types
// ─────────────────────────────────────────

export type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string }
