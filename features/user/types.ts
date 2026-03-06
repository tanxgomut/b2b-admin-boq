import { z } from "zod"

// ─────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────

export const UserSchema = z.object({
    email: z.string().email("อีเมลไม่ถูกต้อง"),
    name: z.string().optional(),
    image: z.string().url("URL ไม่ถูกต้อง").optional().or(z.literal("")),
})

export const CreateUserSchema = UserSchema.extend({
    password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
})

export const ChangePasswordSchema = z.object({
    password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
})

// ─────────────────────────────────────────
// TypeScript Types
// ─────────────────────────────────────────

export type UserFormData = z.infer<typeof UserSchema>
export type CreateUserFormData = z.infer<typeof CreateUserSchema>
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>

// ─────────────────────────────────────────
// DB Row Types
// ─────────────────────────────────────────

export type UserRow = {
    id: string
    email: string
    name: string | null
    image: string | null
    createdAt: Date
    hasCredential: boolean
    _count: { orgs: number; teams: number }
}

// reuse from organization types
export type { OrgMemberRow, TeamMemberRow, UserOption, RoleOption, OrgOption, TeamOption, ActionResult } from "@/features/organization/types"
