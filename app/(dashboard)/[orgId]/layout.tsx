import { AppSidebar } from "@/components/layout/app-sidebar"
import BreadcrumbMain from "@/components/layout/breadcrumb-main"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { ModeToggle } from "@/components/assets/theme-button";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params
    const session = await auth()

    const currentOrg = session?.user?.orgs?.find(
        (o) => o.org.name === orgId
    )

    if (!currentOrg) {
        return notFound()
    }

    return (
        <SidebarProvider>
            <AppSidebar user={session} />
            <SidebarInset>
                <header className="flex sticky top-0 z-50 bg-background justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <BreadcrumbMain />
                    </div>
                    <div className="sm:flex hidden items-center gap-2 px-4">
                        <ModeToggle />
                    </div>
                </header>
                <main className="@container/main flex flex-1 flex-col p-4 w-full">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
