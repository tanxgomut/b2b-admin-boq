"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, Layers, Key, Lock } from "lucide-react"
import { RoleTable } from "./roles/RoleTable"
import { ResourceTable } from "./resources/ResourceTable"
import { PermissionTable } from "./permissions/PermissionTable"
import { RolePermissionMatrix } from "./role-permissions/RolePermissionMatrix"
import type {
    RoleRow,
    ResourceRow,
    PermissionRow,
    RolePermissionRow,
} from "@/features/permission/types"

type Props = {
    initialRoles: RoleRow[]
    initialResources: ResourceRow[]
    initialPermissions: PermissionRow[]
    initialRolePermissions: RolePermissionRow[]
}

export function PermissionPageClient({
    initialRoles,
    initialResources,
    initialPermissions,
    initialRolePermissions,
}: Props) {
    const router = useRouter()
    const [, startTransition] = useTransition()

    // Re-fetch server data without resetting client state (tab stays in place)
    const refresh = () => {
        startTransition(() => {
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Permission Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    จัดการ Roles, Resources, Permissions และสิทธิ์การใช้งานในระบบ
                </p>
            </div>

            <Tabs defaultValue="roles">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="roles" className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Roles</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                            {initialRoles.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4" />
                        <span>Resources</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                            {initialResources.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center gap-1.5">
                        <Key className="h-4 w-4" />
                        <span>Permissions</span>
                        <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                            {initialPermissions.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="matrix" className="flex items-center gap-1.5">
                        <Lock className="h-4 w-4" />
                        <span>Role Permissions</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="mt-6">
                    <RoleTable roles={initialRoles} onRefresh={refresh} />
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                    <ResourceTable resources={initialResources} onRefresh={refresh} />
                </TabsContent>

                <TabsContent value="permissions" className="mt-6">
                    <PermissionTable
                        permissions={initialPermissions}
                        resources={initialResources}
                        onRefresh={refresh}
                    />
                </TabsContent>

                <TabsContent value="matrix" className="mt-6">
                    <RolePermissionMatrix
                        roles={initialRoles}
                        resources={initialResources}
                        permissions={initialPermissions}
                        rolePermissions={initialRolePermissions}
                        onRefresh={refresh}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
