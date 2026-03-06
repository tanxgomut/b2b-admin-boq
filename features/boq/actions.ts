"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"
import { revalidatePath } from "next/cache"
import {
    createBoqProjectSchema,
    updateBoqProjectSchema,
    createBoqCategorySchema,
    createBoqItemSchema,
    updateBoqItemSchema,
    CreateBoqProjectInput,
    UpdateBoqProjectInput,
    CreateBoqCategoryInput,
    CreateBoqItemInput,
    UpdateBoqItemInput,
} from "./types"

// ─── Helper ─────────────────────────────────────────────────────
async function getAuthedSession(orgId: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")
    return session
}

// ══════════════════════════════════════════
// Projects
// ══════════════════════════════════════════

export async function createBoqProject(orgId: string, data: CreateBoqProjectInput) {
    try {
        const session = await getAuthedSession(orgId)
        if (!hasPermission(session, orgId, "boq:create")) throw new Error("Permission denied")

        const validated = createBoqProjectSchema.parse(data)
        const project = await prisma.boqProject.create({
            data: {
                ...validated,
                orgId: session.user.orgs!.find((o) => o.org.name === orgId)!.org.id,
                createdBy: session.user.id || 'unknown',
            },
        })
        revalidatePath(`/${orgId}/boq`)
        return { success: true, project }
    } catch (e) {
        console.error("🔥 Error in createBoqProject:", e);
        throw e;
    }
}

export async function updateBoqProject(
    projectId: string,
    orgId: string,
    data: UpdateBoqProjectInput
) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:update")) throw new Error("Permission denied")

    const validated = updateBoqProjectSchema.parse(data)
    const project = await prisma.boqProject.update({
        where: { id: projectId },
        data: validated,
    })
    revalidatePath(`/${orgId}/boq`)
    revalidatePath(`/${orgId}/boq/${projectId}`)
    return { success: true, project }
}

export async function deleteBoqProject(projectId: string, orgId: string) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:delete")) throw new Error("Permission denied")

    await prisma.boqProject.update({
        where: { id: projectId },
        data: { deletedAt: new Date() },
    })
    revalidatePath(`/${orgId}/boq`)
    return { success: true }
}

// ══════════════════════════════════════════
// Categories
// ══════════════════════════════════════════

export async function createBoqCategory(
    projectId: string,
    orgId: string,
    data: CreateBoqCategoryInput
) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:update")) throw new Error("Permission denied")

    const validated = createBoqCategorySchema.parse(data)
    const category = await prisma.boqCategory.create({
        data: { ...validated, projectId },
    })
    revalidatePath(`/${orgId}/boq/${projectId}`)
    return { success: true, category }
}

export async function deleteBoqCategory(categoryId: string, projectId: string, orgId: string) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:update")) throw new Error("Permission denied")

    await prisma.boqCategory.delete({ where: { id: categoryId } })
    revalidatePath(`/${orgId}/boq/${projectId}`)
    return { success: true }
}

// ══════════════════════════════════════════
// Items
// ══════════════════════════════════════════

export async function createBoqItem(
    categoryId: string,
    projectId: string,
    orgId: string,
    data: CreateBoqItemInput
) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:update")) throw new Error("Permission denied")

    const validated = createBoqItemSchema.parse(data)
    const item = await prisma.boqItem.create({
        data: {
            ...validated,
            categoryId,
            quantity: validated.quantity,
            unitPrice: validated.unitPrice,
        },
    })
    revalidatePath(`/${orgId}/boq/${projectId}`)
    return {
        success: true,
        item: {
            ...item,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
        }
    }
}

export async function updateBoqItem(
    itemId: string,
    projectId: string,
    orgId: string,
    data: UpdateBoqItemInput
) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:update")) throw new Error("Permission denied")

    const validated = updateBoqItemSchema.parse(data)
    const item = await prisma.boqItem.update({
        where: { id: itemId },
        data: validated,
    })
    revalidatePath(`/${orgId}/boq/${projectId}`)
    return {
        success: true,
        item: {
            ...item,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            actualQuantity: item.actualQuantity != null ? Number(item.actualQuantity) : null,
            actualUnitPrice: item.actualUnitPrice != null ? Number(item.actualUnitPrice) : null,
        }
    }
}

export async function deleteBoqItem(itemId: string, projectId: string, orgId: string) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:update")) throw new Error("Permission denied")

    await prisma.boqItem.delete({ where: { id: itemId } })
    revalidatePath(`/${orgId}/boq/${projectId}`)
    return { success: true }
}

// ══════════════════════════════════════════
// Lock / Approve
// ══════════════════════════════════════════

export async function lockBoqProject(projectId: string, orgId: string) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:approve")) throw new Error("Permission denied")

    await prisma.boqProject.update({
        where: { id: projectId },
        data: {
            isLocked: true,
            lockedAt: new Date(),
            lockedBy: session.user.id,
        },
    })
    revalidatePath(`/${orgId}/boq/${projectId}`)
    return { success: true }
}

export async function unlockBoqProject(projectId: string, orgId: string) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:approve")) throw new Error("Permission denied")

    await prisma.boqProject.update({
        where: { id: projectId },
        data: {
            isLocked: false,
            lockedAt: null,
            lockedBy: null,
        },
    })
    revalidatePath(`/${orgId}/boq/${projectId}`)
    return { success: true }
}

// ══════════════════════════════════════════
// Versions
// ══════════════════════════════════════════

export async function saveBoqVersion(projectId: string, orgId: string, label?: string) {
    try {
        const session = await getAuthedSession(orgId)
        if (!hasPermission(session, orgId, "boq:update")) throw new Error("Permission denied")

        const realOrgId = session.user.orgs?.find((o) => o.org.name === orgId)?.org.id ?? ""
        if (!realOrgId) throw new Error(`Cannot resolve orgId for slug: ${orgId}`)

        // Fetch full project snapshot
        const project = await prisma.boqProject.findFirst({
            where: { id: projectId, orgId: realOrgId },
            include: {
                categories: {
                    orderBy: { order: "asc" },
                    include: { items: { orderBy: { order: "asc" } } },
                },
            },
        })
        if (!project) throw new Error(`Project not found: projectId=${projectId} orgId=${realOrgId}`)

        // Determine next version number
        const lastVersion = await prisma.boqVersion.findFirst({
            where: { projectId },
            orderBy: { versionNo: "desc" },
        })
        const versionNo = (lastVersion?.versionNo ?? 0) + 1

        const snapshot = {
            name: project.name,
            description: project.description,
            location: project.location,
            categories: project.categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                order: cat.order,
                items: cat.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    unit: item.unit,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    actualQuantity: item.actualQuantity != null ? Number(item.actualQuantity) : null,
                    actualUnitPrice: item.actualUnitPrice != null ? Number(item.actualUnitPrice) : null,
                    note: item.note,
                    order: item.order,
                })),
            })),
        }

        const version = await prisma.boqVersion.create({
            data: {
                projectId,
                versionNo,
                label: label ?? `Version ${versionNo}`,
                snapshot,
                createdBy: session.user.id ?? session.user.email ?? "unknown",
            },
        })

        revalidatePath(`/${orgId}/boq/${projectId}`)
        return { success: true, versionNo, label: version.label }
    } catch (e) {
        console.error("🔥 saveBoqVersion error:", e)
        throw e
    }
}

export async function getBoqVersions(projectId: string, orgId: string) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:read")) throw new Error("Permission denied")

    const versions = await prisma.boqVersion.findMany({
        where: { projectId },
        orderBy: { versionNo: "desc" },
        select: {
            id: true,
            versionNo: true,
            label: true,
            createdAt: true,
            createdBy: true,
        },
    })
    return versions
}

export async function getBoqVersionSnapshot(versionId: string, orgId: string) {
    const session = await getAuthedSession(orgId)
    if (!hasPermission(session, orgId, "boq:read")) throw new Error("Permission denied")

    const version = await prisma.boqVersion.findUnique({
        where: { id: versionId },
        select: {
            id: true,
            versionNo: true,
            label: true,
            snapshot: true,
            createdAt: true,
        },
    })
    return version
}

