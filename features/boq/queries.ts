import { prisma } from "@/lib/prisma"
import { BoqCategoryWithItems, BoqItemWithTotal, BoqProjectWithSummary } from "./types"

// ─── Projects ───────────────────────────────────────────────────
export async function getBoqProjects(orgId: string) {
    const projects = await prisma.boqProject.findMany({
        where: { orgId, deletedAt: null },
        include: {
            categories: {
                include: { items: true },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return projects.map((project) => {
        const grandTotal = project.categories.reduce((sum, cat) => {
            return sum + cat.items.reduce(
                (s, item) => s + Number(item.quantity) * Number(item.unitPrice),
                0
            )
        }, 0)

        const itemCount = project.categories.reduce((s, c) => s + c.items.length, 0)

        // Return only plain serializable fields — no Decimal, no nested Prisma objects
        return {
            id: project.id,
            orgId: project.orgId,
            name: project.name,
            description: project.description,
            location: project.location,
            status: project.status,
            isLocked: project.isLocked,
            createdBy: project.createdBy,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            grandTotal,
            itemCount,
        }
    })
}


// ─── Project by ID ───────────────────────────────────────────────
export async function getBoqProjectById(
    id: string,
    orgId: string
): Promise<BoqProjectWithSummary | null> {
    const project = await prisma.boqProject.findFirst({
        where: { id, orgId, deletedAt: null },
        include: {
            categories: {
                orderBy: { order: "asc" },
                include: {
                    items: { orderBy: { order: "asc" } },
                },
            },
            versions: {
                orderBy: { versionNo: "desc" },
                select: {
                    id: true,
                    versionNo: true,
                    label: true,
                    createdAt: true,
                    createdBy: true,
                },
            },
        },
    })

    if (!project) return null

    const categories: BoqCategoryWithItems[] = project.categories.map((cat) => {
        const items: BoqItemWithTotal[] = cat.items.map((item) => {
            const quantity = Number(item.quantity)
            const unitPrice = Number(item.unitPrice)
            const total = quantity * unitPrice
            const actualQuantity = item.actualQuantity != null ? Number(item.actualQuantity) : null
            const actualUnitPrice = item.actualUnitPrice != null ? Number(item.actualUnitPrice) : null
            const actualTotal = actualQuantity != null && actualUnitPrice != null
                ? actualQuantity * actualUnitPrice
                : null
            const variance = actualTotal != null ? actualTotal - total : null
            return {
                ...item,
                quantity,
                unitPrice,
                total,
                actualQuantity,
                actualUnitPrice,
                actualTotal,
                variance,
            }
        })
        const categoryTotal = items.reduce((s, i) => s + i.total, 0)
        return { ...cat, items, categoryTotal }
    })

    const grandTotal = categories.reduce((s, c) => s + c.categoryTotal, 0)

    return {
        ...project,
        status: project.status as BoqProjectWithSummary["status"],
        categories,
        grandTotal,
        versions: project.versions,
    }
}

