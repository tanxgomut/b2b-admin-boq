import { getAllOrgData } from "@/features/organization/queries"
import { OrgPageClient } from "@/features/organization/components/OrgPageClient"
import SetBreadcrumbs from "@/components/check/set-breadcrumb"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/rbac"
import { PermissionProvider } from "@/components/providers/permission-provider"

export default async function OrganizationPage({
    params,
}: {
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params
    const session = await auth()

    if (!hasPermission(session, orgId, "organization:read")) redirect(`/${orgId}/dashboard`)

    const currentOrg = session?.user?.orgs?.find(o => o.org.name === orgId)
    const userPermissions = currentOrg?.role?.permissions.map((p: any) => p.permission.key) || []

    const { orgs, orgMembers, teams, teamMembers, users, roles } = await getAllOrgData()

    return (
        <>
            <SetBreadcrumbs items={[
                { title: "Manage Organization" },
                { title: "Organization", url: `/${orgId}/organization` }
            ]} />
            <PermissionProvider permissions={userPermissions}>
                <OrgPageClient
                    initialOrgs={orgs}
                    initialOrgMembers={orgMembers}
                    initialTeams={teams}
                    initialTeamMembers={teamMembers}
                    users={users}
                    roles={roles}
                />
            </PermissionProvider>
        </>
    )
}