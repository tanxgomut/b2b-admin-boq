import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import { getBoqProjects } from "@/features/boq/queries"
import { BoqProjectList } from "@/components/boq/BoqProjectList"
import { BoqProjectForm } from "@/components/boq/BoqProjectForm"
import SetBreadcrumbs from "@/components/check/set-breadcrumb"

export default async function BoqPage({
    params,
}: {
    params: Promise<{ orgId: string }>
}) {
    const { orgId } = await params
    const session = await auth()

    const canCreate = hasPermission(session, orgId, "boq:create")
    const canDelete = hasPermission(session, orgId, "boq:delete")

    // ดึง orgId จริงจาก session
    const realOrgId = session?.user?.orgs?.find((o) => o.org.name === orgId)?.org.id ?? ""
    const projects = realOrgId ? await getBoqProjects(realOrgId) : []

    return (
        <>
            <SetBreadcrumbs items={[{ title: "BOQ", url: `/${orgId}/boq` }]} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">BOQ (ประมาณราคา)</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            จัดการโปรเจ็กประมาณราคาการก่อสร้าง
                        </p>
                    </div>
                    {canCreate && <BoqProjectForm orgId={orgId} />}
                </div>

                {/* Project List */}
                <BoqProjectList
                    projects={projects}
                    orgId={orgId}
                    canDelete={canDelete}
                />
            </div>
        </>
    )
}