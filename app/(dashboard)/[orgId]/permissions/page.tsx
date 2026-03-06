import { getAllPermissionData } from "@/features/permission/queries"
import { PermissionPageClient } from "@/features/permission/components/PermissionPageClient"
import SetBreadcrumbs from "@/components/check/set-breadcrumb";
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/rbac";
import { PermissionProvider } from "@/components/providers/permission-provider"

export default async function PermissionPage({
    params,
}: {
    params: Promise<{ orgId: string }>
}) {

    const { orgId } = await params
    const session = await auth()

    if (!hasPermission(session, orgId, "permission:read")) redirect(`/${orgId}/dashboard`)
    const currentOrg = session?.user?.orgs?.find(o => o.org.name === orgId)
    const userPermissions = currentOrg?.role?.permissions.map((p: any) => p.permission.key) || []

    const { roles, resources, permissions, rolePermissions } =
        await getAllPermissionData()

    return (
        <>
            <SetBreadcrumbs items={[
                { title: "Manage Permissions" },
                { title: "Permissions", url: `/${orgId}/permissions` }
            ]} />
            <PermissionProvider permissions={userPermissions}>
                <PermissionPageClient
                    initialRoles={roles}
                    initialResources={resources}
                    initialPermissions={permissions}
                    initialRolePermissions={rolePermissions}
                />
            </PermissionProvider>
        </>
    )
}
