"use client"

import { useBreadcrumbStore, BreadcrumbItem } from "@/store/breadcrumb-store"
import { useEffect } from "react"

export default function SetBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs)

    useEffect(() => {
        setBreadcrumbs(items)
    }, [items, setBreadcrumbs])

    return null
}
