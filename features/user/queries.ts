import { prisma } from "@/lib/prisma"
import type { UserRow } from "./types"
import type { OrgMemberRow, TeamMemberRow, RoleOption, OrgOption, TeamOption } from "@/features/organization/types"

// ─────────────────────────────────────────
// Users
// ─────────────────────────────────────────

export async function getUsers(): Promise<UserRow[]> {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            credentials: { select: { id: true } },
            _count: { select: { orgs: true, teams: true } },
        },
    })
    return users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        image: u.image,
        createdAt: u.createdAt,
        hasCredential: !!u.credentials,
        _count: u._count,
    }))
}

// ─────────────────────────────────────────
// Org Members (reuse same structure)
// ─────────────────────────────────────────

export async function getUserOrgMembers(): Promise<OrgMemberRow[]> {
    return prisma.organizationMember.findMany({
        orderBy: { joinedAt: "desc" },
        include: {
            user: { select: { id: true, name: true, email: true } },
            org: { select: { id: true, name: true } },
            role: { select: { id: true, name: true } },
        },
    })
}

// ─────────────────────────────────────────
// Team Members (reuse same structure)
// ─────────────────────────────────────────

export async function getUserTeamMembers(): Promise<TeamMemberRow[]> {
    return prisma.teamMember.findMany({
        orderBy: { id: "desc" },
        include: {
            user: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true, org: { select: { name: true } } } },
            role: { select: { id: true, name: true } },
        },
    })
}

// ─────────────────────────────────────────
// Options
// ─────────────────────────────────────────

export async function getUserPageOptions() {
    const [roles, orgs, teams] = await Promise.all([
        prisma.role.findMany({ select: { id: true, name: true }, orderBy: { level: "asc" } }) as Promise<RoleOption[]>,
        prisma.organization.findMany({ select: { id: true, name: true }, where: { deletedAt: null }, orderBy: { name: "asc" } }) as Promise<OrgOption[]>,
        prisma.team.findMany({ select: { id: true, name: true, org: { select: { name: true } } }, orderBy: { name: "asc" } }) as Promise<TeamOption[]>,
    ])
    return { roles, orgs, teams }
}

// ─────────────────────────────────────────
// All data for page.tsx
// ─────────────────────────────────────────

export async function getAllUserPageData() {
    const [users, orgMembers, teamMembers, { roles, orgs, teams }] = await Promise.all([
        getUsers(),
        getUserOrgMembers(),
        getUserTeamMembers(),
        getUserPageOptions(),
    ])
    return { users, orgMembers, teamMembers, roles, orgs, teams }
}
