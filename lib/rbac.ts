
import { Session } from "next-auth"

export type PermissionKey = string

export const hasPermission = (
    session: Session | null,
    orgId: string,
    requiredPermission: PermissionKey
): boolean => {
    if (!session?.user?.orgs) return false

    const orgMember = session.user.orgs.find(
        (o) => o.org.name === orgId
    )

    if (!orgMember?.role?.permissions) return false

    return orgMember.role.permissions.some(
        (p: any) => p.permission.key === requiredPermission
    )
}
