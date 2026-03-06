"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Save } from "lucide-react"
import { syncRolePermissions } from "@/features/permission/actions"
import type { RoleRow, PermissionRow, ResourceRow, RolePermissionRow } from "@/features/permission/types"

type Props = {
    roles: RoleRow[]
    resources: ResourceRow[]
    permissions: PermissionRow[]
    rolePermissions: RolePermissionRow[]
    onRefresh: () => void
}

export function RolePermissionMatrix({
    roles,
    resources,
    permissions,
    rolePermissions,
    onRefresh,
}: Props) {
    const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id ?? "")
    // local state: set of permissionIds assigned to currently selected role
    const [checked, setChecked] = useState<Set<string>>(() => {
        const initial = rolePermissions
            .filter((rp) => rp.roleId === (roles[0]?.id ?? ""))
            .map((rp) => rp.permissionId)
        return new Set(initial)
    })
    const [isDirty, setIsDirty] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleRoleChange = (roleId: string) => {
        setSelectedRoleId(roleId)
        const assigned = rolePermissions
            .filter((rp) => rp.roleId === roleId)
            .map((rp) => rp.permissionId)
        setChecked(new Set(assigned))
        setIsDirty(false)
    }

    const handleToggle = (permissionId: string) => {
        setChecked((prev) => {
            const next = new Set(prev)
            if (next.has(permissionId)) {
                next.delete(permissionId)
            } else {
                next.add(permissionId)
            }
            return next
        })
        setIsDirty(true)
    }

    const handleSave = () => {
        if (!selectedRoleId) return
        startTransition(async () => {
            const result = await syncRolePermissions(selectedRoleId, Array.from(checked))
            if (result.success) {
                toast.success("บันทึกสิทธิ์สำเร็จ")
                setIsDirty(false)
                onRefresh()
            } else {
                toast.error(result.error)
            }
        })
    }

    // Group permissions by resource
    const permsByResource = resources.map((res) => ({
        resource: res,
        perms: permissions.filter((p) => p.resourceId === res.id),
    })).filter((g) => g.perms.length > 0)

    const selectedRole = roles.find((r) => r.id === selectedRoleId)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Role Permissions</h3>
                    <p className="text-sm text-muted-foreground">
                        กำหนดสิทธิ์การใช้งานของแต่ละ Role
                    </p>
                </div>
                <Button onClick={handleSave} disabled={!isDirty || isPending} size="sm">
                    <Save className="mr-1 h-4 w-4" />
                    {isPending ? "กำลังบันทึก..." : "บันทึกสิทธิ์"}
                </Button>
            </div>

            {/* Role Selector */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium whitespace-nowrap">เลือก Role:</span>
                <Select value={selectedRoleId} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="เลือก Role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                                {role.name}
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    Lv.{role.level}
                                </Badge>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isDirty && (
                    <Badge variant="outline" className="text-orange-500 border-orange-400">
                        มีการเปลี่ยนแปลง (ยังไม่บันทึก)
                    </Badge>
                )}
            </div>

            {/* Permission Matrix — grouped by Resource */}
            {permsByResource.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">
                    ยังไม่มี Permission ในระบบ กรุณาเพิ่ม Resource และ Permission ก่อน
                </p>
            ) : (
                <div className="space-y-4">
                    {permsByResource.map(({ resource, perms }) => (
                        <div key={resource.id} className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono text-sm">
                                    {resource.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    ({perms.length} permissions)
                                </span>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {perms.map((perm) => {
                                    const isChecked = checked.has(perm.id)
                                    return (
                                        <label
                                            key={perm.id}
                                            className={`
                        flex items-start gap-2 p-2 rounded-md border cursor-pointer transition-colors
                        ${isChecked
                                                    ? "bg-primary/5 border-primary/30"
                                                    : "bg-muted/30 border-transparent hover:border-border"
                                                }
                      `}
                                        >
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={() => handleToggle(perm.id)}
                                                className="mt-0.5"
                                            />
                                            <div className="space-y-0.5">
                                                <code className="text-xs font-mono font-semibold block">
                                                    {perm.key.split(":")[1]}
                                                </code>
                                                {perm.description && (
                                                    <p className="text-xs text-muted-foreground leading-tight">
                                                        {perm.description}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {selectedRole && (
                <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                    <strong>{selectedRole.name}</strong> มีสิทธิ์ทั้งหมด{" "}
                    <Badge variant="secondary">{checked.size}</Badge> รายการ
                    จากทั้งหมด{" "}
                    <Badge variant="outline">{permissions.length}</Badge> รายการ
                </div>
            )}
        </div>
    )
}
