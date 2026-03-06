import { z } from "zod"

// ─────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────

export const OrgSchema = z.object({
    name: z.string().min(1, "กรุณาระบุชื่อ Organization"),
    slug: z
        .string()
        .min(1, "กรุณาระบุ slug")
        .regex(/^[a-z0-9-]+$/, "slug ใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น"),
})

export const OrgMemberSchema = z.object({
    userId: z.string().min(1, "กรุณาเลือก User"),
    orgId: z.string().min(1, "กรุณาเลือก Organization"),
    roleId: z.string().min(1, "กรุณาเลือก Role"),
})

export const TeamSchema = z.object({
    name: z.string().min(1, "กรุณาระบุชื่อ Team"),
    orgId: z.string().min(1, "กรุณาเลือก Organization"),
})

export const TeamMemberSchema = z.object({
    userId: z.string().min(1, "กรุณาเลือก User"),
    teamId: z.string().min(1, "กรุณาเลือก Team"),
    roleId: z.string().min(1, "กรุณาเลือก Role"),
})

// ─────────────────────────────────────────
// TypeScript Types
// ─────────────────────────────────────────

export type OrgFormData = z.infer<typeof OrgSchema>
export type OrgMemberFormData = z.infer<typeof OrgMemberSchema>
export type TeamFormData = z.infer<typeof TeamSchema>
export type TeamMemberFormData = z.infer<typeof TeamMemberSchema>

// ─────────────────────────────────────────
// DB Row Types
// ─────────────────────────────────────────

export type OrgRow = {
    id: string
    name: string
    slug: string
    createdAt: Date
    deletedAt: Date | null
    _count?: { members: number; teams: number }
}

export type OrgMemberRow = {
    id: string
    userId: string
    orgId: string
    roleId: string
    joinedAt: Date
    user: { id: string; name: string | null; email: string }
    org: { id: string; name: string }
    role: { id: string; name: string }
}

export type TeamRow = {
    id: string
    name: string
    orgId: string
    createdAt: Date
    org: { id: string; name: string }
    _count?: { members: number }
}

export type TeamMemberRow = {
    id: string
    userId: string
    teamId: string
    roleId: string
    user: { id: string; name: string | null; email: string }
    team: { id: string; name: string; org: { name: string } }
    role: { id: string; name: string }
}

export type UserOption = { id: string; name: string | null; email: string }
export type RoleOption = { id: string; name: string }
export type OrgOption = { id: string; name: string }
export type TeamOption = { id: string; name: string; org: { name: string } }

// ─────────────────────────────────────────
// Action Result
// ─────────────────────────────────────────

export type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string }
