import { prisma } from "@/lib/prisma"
import type {
    RoleRow,
    ResourceRow,
    PermissionRow,
    RolePermissionRow,
} from "./types"

// ─────────────────────────────────────────
// Roles
// ─────────────────────────────────────────

export async function getRoles(): Promise<RoleRow[]> {
    return prisma.role.findMany({
        orderBy: { level: "asc" },
        include: {
            _count: { select: { permissions: true } },
        },
    })
}

// ─────────────────────────────────────────
// Resources
// ─────────────────────────────────────────

export async function getResources(): Promise<ResourceRow[]> {
    return prisma.resource.findMany({
        orderBy: { type: "asc" },
        include: {
            _count: { select: { permissions: true } },
        },
    })
}

// ─────────────────────────────────────────
// Permissions
// ─────────────────────────────────────────

export async function getPermissions(): Promise<PermissionRow[]> {
    return prisma.permission.findMany({
        orderBy: [{ resourceId: "asc" }, { key: "asc" }],
        include: {
            resource: { select: { id: true, type: true } },
        },
    })
}

// ─────────────────────────────────────────
// RolePermissions
// ─────────────────────────────────────────

export async function getRolePermissions(): Promise<RolePermissionRow[]> {
    return prisma.rolePermission.findMany({
        select: { id: true, roleId: true, permissionId: true },
    })
}

// ─────────────────────────────────────────
// All data (for page.tsx single fetch)
// ─────────────────────────────────────────

export async function getAllPermissionData() {
    const [roles, resources, permissions, rolePermissions] = await Promise.all([
        getRoles(),
        getResources(),
        getPermissions(),
        getRolePermissions(),
    ])
    return { roles, resources, permissions, rolePermissions }
}
