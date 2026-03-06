"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserSchema, CreateUserSchema, ChangePasswordSchema } from "./types"
import type { ActionResult } from "@/features/organization/types"

// ─────────────────────────────────────────
// User CRUD
// ─────────────────────────────────────────

export async function createUser(formData: FormData): Promise<ActionResult> {
    const parsed = CreateUserSchema.safeParse({
        email: formData.get("email"),
        name: formData.get("name") || undefined,
        image: formData.get("image") || undefined,
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        const hashed = await bcrypt.hash(parsed.data.password, 10)
        await prisma.user.create({
            data: {
                email: parsed.data.email,
                name: parsed.data.name,
                image: parsed.data.image || null,
                credentials: { create: { password: hashed } },
            },
        })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "อีเมลนี้มีในระบบแล้ว" }
    }
}

export async function updateUser(id: string, formData: FormData): Promise<ActionResult> {
    const parsed = UserSchema.safeParse({
        email: formData.get("email"),
        name: formData.get("name") || undefined,
        image: formData.get("image") || undefined,
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        await prisma.user.update({
            where: { id },
            data: {
                email: parsed.data.email,
                name: parsed.data.name,
                image: parsed.data.image || null,
            },
        })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถอัปเดตผู้ใช้ได้ อีเมลอาจซ้ำ" }
    }
}

export async function deleteUser(id: string): Promise<ActionResult> {
    try {
        await prisma.user.delete({ where: { id } })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถลบผู้ใช้ได้" }
    }
}

export async function changePassword(userId: string, formData: FormData): Promise<ActionResult> {
    const parsed = ChangePasswordSchema.safeParse({
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }
    try {
        const hashed = await bcrypt.hash(parsed.data.password, 10)
        await prisma.authCredential.upsert({
            where: { userId },
            update: { password: hashed },
            create: { userId, password: hashed },
        })
        revalidatePath("/", "layout")
        return { success: true }
    } catch {
        return { success: false, error: "ไม่สามารถเปลี่ยนรหัสผ่านได้" }
    }
}
