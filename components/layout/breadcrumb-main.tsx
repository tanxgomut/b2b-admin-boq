"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbStore } from "@/store/breadcrumb-store"

export default function BreadcrumbMain() {
    const breadcrumbLists = useBreadcrumbStore((state) => state.items)

    if (!breadcrumbLists || breadcrumbLists.length === 0) return null

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbLists?.slice(0, breadcrumbLists?.length - 1).map((item, index) => (
                    <BreadcrumbItem key={index}>
                        <BreadcrumbLink href={item?.url}>
                            {item?.title}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                ))}
                {breadcrumbLists?.length > 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                )}
                <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbLists[breadcrumbLists?.length - 1].title}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}