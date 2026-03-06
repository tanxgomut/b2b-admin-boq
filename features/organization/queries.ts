import { prisma } from "@/lib/prisma"
import type { OrgRow, OrgMemberRow, TeamRow, TeamMemberRow, UserOption, RoleOption, OrgOption, TeamOption } from "./types"

// ─────────────────────────────────────────
// Organizations
// ─────────────────────────────────────────

export async function getOrgs(): Promise<OrgRow[]> {
    return prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { members: true, teams: true } },
        },
    })
}

// ─────────────────────────────────────────
// Organization Members
// ─────────────────────────────────────────

export async function getOrgMembers(): Promise<OrgMemberRow[]> {
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
// Teams
// ─────────────────────────────────────────

export async function getTeams(): Promise<TeamRow[]> {
    return prisma.team.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            org: { select: { id: true, name: true } },
            _count: { select: { members: true } },
        },
    })
}

// ─────────────────────────────────────────
// Team Members
// ─────────────────────────────────────────

export async function getTeamMembers(): Promise<TeamMemberRow[]> {
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
// Options (สำหรับ Select ใน Dialog)
// ─────────────────────────────────────────

export async function getUserOptions(): Promise<UserOption[]> {
    return prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { email: "asc" },
    })
}

export async function getRoleOptions(): Promise<RoleOption[]> {
    return prisma.role.findMany({
        select: { id: true, name: true },
        orderBy: { level: "asc" },
    })
}

export async function getOrgOptions(): Promise<OrgOption[]> {
    return prisma.organization.findMany({
        select: { id: true, name: true },
        where: { deletedAt: null },
        orderBy: { name: "asc" },
    })
}

export async function getTeamOptions(): Promise<TeamOption[]> {
    return prisma.team.findMany({
        select: { id: true, name: true, org: { select: { name: true } } },
        orderBy: { name: "asc" },
    })
}

// ─────────────────────────────────────────
// All data (for page.tsx)
// ─────────────────────────────────────────

export async function getAllOrgData() {
    const [orgs, orgMembers, teams, teamMembers, users, roles] = await Promise.all([
        getOrgs(),
        getOrgMembers(),
        getTeams(),
        getTeamMembers(),
        getUserOptions(),
        getRoleOptions(),
    ])
    return { orgs, orgMembers, teams, teamMembers, users, roles }
}
