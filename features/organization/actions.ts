"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { OrgSchema, OrgMemberSchema, TeamSchema, TeamMemberSchema } from "./types"
import type { ActionResult } from "./types"

// ─────────────────────────────────────────
// ORGANIZATION ACTIONS
// ─────────────────────────────────────────

export async function createOrg(formData: FormData): Promise<ActionResult> {
    const parsed = OrgSchema.safeParse({
        name: formData.get("name"),
        slug: formData.get("slug"),
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        await prisma.organization.create({ data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ชื่อหรือ slug นี้มีอยู่แล้ว" }
    }
}

export async function updateOrg(id: string, formData: FormData): Promise<ActionResult> {
    const parsed = OrgSchema.safeParse({
        name: formData.get("name"),
        slug: formData.get("slug"),
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        await prisma.organization.update({ where: { id }, data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถอัปเดต Organization ได้" }
    }
}

export async function softDeleteOrg(id: string): Promise<ActionResult> {
    try {
        await prisma.organization.update({
            where: { id },
            data: { deletedAt: new Date() },
        })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถลบ Organization ได้" }
    }
}

export async function restoreOrg(id: string): Promise<ActionResult> {
    try {
        await prisma.organization.update({
            where: { id },
            data: { deletedAt: null },
        })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถกู้คืน Organization ได้" }
    }
}

// ─────────────────────────────────────────
// ORG MEMBER ACTIONS
// ─────────────────────────────────────────

export async function addOrgMember(formData: FormData): Promise<ActionResult> {
    const parsed = OrgMemberSchema.safeParse({
        userId: formData.get("userId"),
        orgId: formData.get("orgId"),
        roleId: formData.get("roleId"),
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        await prisma.organizationMember.create({ data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "สมาชิกนี้อยู่ใน Organization แล้ว" }
    }
}

export async function updateOrgMemberRole(id: string, roleId: string): Promise<ActionResult> {
    try {
        await prisma.organizationMember.update({ where: { id }, data: { roleId } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถอัปเดต Role ได้" }
    }
}

export async function removeOrgMember(id: string): Promise<ActionResult> {
    try {
        await prisma.organizationMember.delete({ where: { id } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถลบสมาชิกได้" }
    }
}

// ─────────────────────────────────────────
// TEAM ACTIONS
// ─────────────────────────────────────────

export async function createTeam(formData: FormData): Promise<ActionResult> {
    const parsed = TeamSchema.safeParse({
        name: formData.get("name"),
        orgId: formData.get("orgId"),
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        await prisma.team.create({ data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ชื่อ Team นี้มีอยู่แล้วใน Organization" }
    }
}

export async function updateTeam(id: string, formData: FormData): Promise<ActionResult> {
    const parsed = TeamSchema.safeParse({
        name: formData.get("name"),
        orgId: formData.get("orgId"),
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        await prisma.team.update({ where: { id }, data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถอัปเดต Team ได้" }
    }
}

export async function deleteTeam(id: string): Promise<ActionResult> {
    try {
        await prisma.team.delete({ where: { id } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถลบ Team ได้" }
    }
}

// ─────────────────────────────────────────
// TEAM MEMBER ACTIONS
// ─────────────────────────────────────────

export async function addTeamMember(formData: FormData): Promise<ActionResult> {
    const parsed = TeamMemberSchema.safeParse({
        userId: formData.get("userId"),
        teamId: formData.get("teamId"),
        roleId: formData.get("roleId"),
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        await prisma.teamMember.create({ data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "สมาชิกนี้อยู่ใน Team แล้ว" }
    }
}

export async function updateTeamMemberRole(id: string, roleId: string): Promise<ActionResult> {
    try {
        await prisma.teamMember.update({ where: { id }, data: { roleId } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถอัปเดต Role ได้" }
    }
}

export async function removeTeamMember(id: string): Promise<ActionResult> {
    try {
        await prisma.teamMember.delete({ where: { id } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถลบสมาชิกได้" }
    }
}
