"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRound, Building2, Users } from "lucide-react"
import { UserTable } from "./users/UserTable"
import { UserOrgMemberTable } from "./org-members/UserOrgMemberTable"
import { UserTeamMemberTable } from "./team-members/UserTeamMemberTable"
import type { UserRow } from "@/features/user/types"
import type { OrgMemberRow, TeamMemberRow, RoleOption, OrgOption, TeamOption, UserOption } from "@/features/organization/types"

type Props = {
    initialUsers: UserRow[]
    initialOrgMembers: OrgMemberRow[]
    initialTeamMembers: TeamMemberRow[]
    roles: RoleOption[]
    orgs: OrgOption[]
    teams: TeamOption[]
}

export function UserPageClient({ initialUsers, initialOrgMembers, initialTeamMembers, roles, orgs, teams }: Props) {
    const router = useRouter()
    const [, startTransition] = useTransition()

    const refresh = () => startTransition(() => { router.refresh() })

    const userOptions: UserOption[] = initialUsers.map(u => ({ id: u.id, name: u.name, email: u.email }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground text-sm mt-1">จัดการผู้ใช้, สมาชิก Organizations และ Teams</p>
            </div>

            <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users" className="flex items-center gap-1.5">
                        <UserRound className="h-4 w-4" />
                        <span>Users</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{initialUsers.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="org-members" className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        <span>Org Members</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{initialOrgMembers.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="team-members" className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>Team Members</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{initialTeamMembers.length}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-6">
                    <UserTable users={initialUsers} onRefresh={refresh} />
                </TabsContent>

                <TabsContent value="org-members" className="mt-6">
                    <UserOrgMemberTable members={initialOrgMembers} users={userOptions} roles={roles} orgs={orgs} onRefresh={refresh} />
                </TabsContent>

                <TabsContent value="team-members" className="mt-6">
                    <UserTeamMemberTable members={initialTeamMembers} users={userOptions} roles={roles} teams={teams} onRefresh={refresh} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
