import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import { redirect } from "next/navigation"
import SetBreadcrumbs from "@/components/check/set-breadcrumb"
import { PermissionProvider } from "@/components/providers/permission-provider"
import { UserPageClient } from "@/features/user/components/UserPageClient"
import { getAllUserPageData } from "@/features/user/queries"

export default async function UserPage({
    params,
}: {
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params
    const session = await auth()

    if (!hasPermission(session, orgId, "user:read")) redirect(`/${orgId}/dashboard`)

    const currentOrg = session?.user?.orgs?.find(o => o.org.name === orgId)
    const permissions = currentOrg?.role?.permissions?.map((p: any) => p.permission.key) ?? []

    const { users, orgMembers, teamMembers, roles, orgs, teams } = await getAllUserPageData()

    return (
        <>
            <SetBreadcrumbs items={[
                { title: "Manage User" },
                { title: "User", url: `/${orgId}/user` }
            ]} />
            <PermissionProvider permissions={permissions}>
                <UserPageClient
                    initialUsers={users}
                    initialOrgMembers={orgMembers}
                    initialTeamMembers={teamMembers}
                    roles={roles}
                    orgs={orgs}
                    teams={teams}
                />
            </PermissionProvider>
        </>
    )
}