"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, Layers, UserCheck } from "lucide-react"
import { OrgTable } from "./organizations/OrgTable"
import { OrgMemberTable } from "./org-members/OrgMemberTable"
import { TeamTable } from "./teams/TeamTable"
import { TeamMemberTable } from "./team-members/TeamMemberTable"
import type { OrgRow, OrgMemberRow, TeamRow, TeamMemberRow, UserOption, RoleOption, OrgOption, TeamOption } from "@/features/organization/types"

type Props = {
    initialOrgs: OrgRow[]
    initialOrgMembers: OrgMemberRow[]
    initialTeams: TeamRow[]
    initialTeamMembers: TeamMemberRow[]
    users: UserOption[]
    roles: RoleOption[]
}

export function OrgPageClient({ initialOrgs, initialOrgMembers, initialTeams, initialTeamMembers, users, roles }: Props) {
    const router = useRouter()
    const [, startTransition] = useTransition()

    const refresh = () => startTransition(() => { router.refresh() })

    const orgs: OrgOption[] = initialOrgs.filter(o => !o.deletedAt).map(o => ({ id: o.id, name: o.name }))
    const teams: TeamOption[] = initialTeams.map(t => ({ id: t.id, name: t.name, org: t.org }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Organization Management</h1>
                <p className="text-muted-foreground text-sm mt-1">จัดการ Organizations, Teams และสมาชิก</p>
            </div>

            <Tabs defaultValue="organizations">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="organizations" className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        <span>Organizations</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{initialOrgs.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="members" className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>Org Members</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{initialOrgMembers.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4" />
                        <span>Teams</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{initialTeams.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="team-members" className="flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4" />
                        <span>Team Members</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{initialTeamMembers.length}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="organizations" className="mt-6">
                    <OrgTable orgs={initialOrgs} onRefresh={refresh} />
                </TabsContent>

                <TabsContent value="members" className="mt-6">
                    <OrgMemberTable members={initialOrgMembers} users={users} roles={roles} orgs={orgs} onRefresh={refresh} />
                </TabsContent>

                <TabsContent value="teams" className="mt-6">
                    <TeamTable teams={initialTeams} orgs={orgs} onRefresh={refresh} />
                </TabsContent>

                <TabsContent value="team-members" className="mt-6">
                    <TeamMemberTable members={initialTeamMembers} users={users} roles={roles} teams={teams} onRefresh={refresh} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
