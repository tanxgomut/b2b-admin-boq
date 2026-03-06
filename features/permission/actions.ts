"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { RoleSchema, ResourceSchema, PermissionSchema } from "./types"
import type { ActionResult } from "./types"

// ─────────────────────────────────────────
// ROLE ACTIONS
// ─────────────────────────────────────────

export async function createRole(formData: FormData): Promise<ActionResult> {
    const parsed = RoleSchema.safeParse({
        name: formData.get("name"),
        level: formData.get("level"),
    })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }
    try {
        await prisma.role.create({ data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ชื่อ Role นี้มีอยู่แล้ว" }
    }
}

export async function updateRole(
    id: string,
    formData: FormData
): Promise<ActionResult> {
    const parsed = RoleSchema.safeParse({
        name: formData.get("name"),
        level: formData.get("level"),
    })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }
    try {
        await prisma.role.update({ where: { id }, data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถอัปเดต Role ได้" }
    }
}

export async function deleteRole(id: string): Promise<ActionResult> {
    try {
        await prisma.role.delete({ where: { id } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถลบ Role ได้ (อาจมีสมาชิกที่ใช้อยู่)" }
    }
}

// ─────────────────────────────────────────
// RESOURCE ACTIONS
// ─────────────────────────────────────────

export async function createResource(formData: FormData): Promise<ActionResult> {
    const parsed = ResourceSchema.safeParse({ type: formData.get("type") })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }
    try {
        await prisma.resource.create({ data: { type: parsed.data.type } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "Resource นี้มีอยู่แล้ว" }
    }
}

export async function updateResource(
    id: string,
    formData: FormData
): Promise<ActionResult> {
    const parsed = ResourceSchema.safeParse({ type: formData.get("type") })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }
    try {
        await prisma.resource.update({ where: { id }, data: { type: parsed.data.type } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถอัปเดต Resource ได้" }
    }
}

export async function deleteResource(id: string): Promise<ActionResult> {
    try {
        await prisma.resource.delete({ where: { id } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถลบ Resource ได้ (กรุณาลบ Permissions ที่อยู่ใน Resource นี้ก่อน)" }
    }
}

// ─────────────────────────────────────────
// PERMISSION ACTIONS
// ─────────────────────────────────────────

export async function createPermission(
    formData: FormData
): Promise<ActionResult> {
    const parsed = PermissionSchema.safeParse({
        key: formData.get("key"),
        description: formData.get("description") || undefined,
        resourceId: formData.get("resourceId"),
    })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }
    try {
        await prisma.permission.create({ data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "Permission key นี้มีอยู่แล้ว" }
    }
}

export async function updatePermission(
    id: string,
    formData: FormData
): Promise<ActionResult> {
    const parsed = PermissionSchema.safeParse({
        key: formData.get("key"),
        description: formData.get("description") || undefined,
        resourceId: formData.get("resourceId"),
    })
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }
    try {
        await prisma.permission.update({ where: { id }, data: parsed.data })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถอัปเดต Permission ได้" }
    }
}

export async function deletePermission(id: string): Promise<ActionResult> {
    try {
        await prisma.permission.delete({ where: { id } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถลบ Permission ได้" }
    }
}

// ─────────────────────────────────────────
// ROLE PERMISSION ACTIONS
// ─────────────────────────────────────────

export async function assignPermission(
    roleId: string,
    permissionId: string
): Promise<ActionResult> {
    try {
        await prisma.rolePermission.create({ data: { roleId, permissionId } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "Permission นี้ถูกกำหนดไว้แล้ว" }
    }
}

export async function revokePermission(
    roleId: string,
    permissionId: string
): Promise<ActionResult> {
    try {
        await prisma.rolePermission.deleteMany({ where: { roleId, permissionId } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถเพิกถอน Permission ได้" }
    }
}

// Batch sync: set exact permissions for a role
export async function syncRolePermissions(
    roleId: string,
    permissionIds: string[]
): Promise<ActionResult> {
    try {
        await prisma.$transaction([
            prisma.rolePermission.deleteMany({ where: { roleId } }),
            prisma.rolePermission.createMany({
                data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
                skipDuplicates: true,
            }),
        ])
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถบันทึกสิทธิ์ได้" }
    }
}
