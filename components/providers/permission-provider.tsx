"use client"

import { createContext, useContext } from "react"
import { PermissionKey } from "@/lib/rbac"

type PermissionState = {
    permissions: PermissionKey[]
}

const PermissionContext = createContext<PermissionState | null>(null)

export function PermissionProvider({
    children,
    permissions
}: {
    children: React.ReactNode
    permissions: PermissionKey[]
}) {
    return (
        <PermissionContext.Provider value={{ permissions }}>
            {children}
        </PermissionContext.Provider>
    )
}

export function usePermission(requiredPermission: PermissionKey) {
    const context = useContext(PermissionContext)
    if (!context) {
        throw new Error("usePermission must be used within a PermissionProvider")
    }
    return context.permissions.includes(requiredPermission)
}