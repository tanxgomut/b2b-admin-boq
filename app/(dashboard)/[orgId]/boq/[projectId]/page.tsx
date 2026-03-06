import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { hasPermission } from "@/lib/rbac"
import { getBoqProjectById } from "@/features/boq/queries"
import { BoqCategorySection } from "@/components/boq/BoqCategorySection"
import { BoqStatusBadge } from "@/components/boq/BoqStatusBadge"
import { BoqStatusSelect } from "@/components/boq/BoqStatusSelect"
import { BoqAddCategoryForm } from "@/components/boq/BoqAddCategoryForm"
import { BoqSummaryBar } from "@/components/boq/BoqSummaryBar"
import { BoqVarianceChart } from "@/components/boq/BoqVarianceChart"
import { BoqCostAlertSection } from "@/components/boq/BoqCostAlertSection"
import { BoqLockButton } from "@/components/boq/BoqLockButton"
import { BoqVersionPanel } from "@/components/boq/BoqVersionPanel"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, FolderOpen, BarChart2 } from "lucide-react"
import Link from "next/link"
import SetBreadcrumbs from "@/components/check/set-breadcrumb"

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 2,
    }).format(amount)
}

export default async function BoqDetailPage({
    params,
}: {
    params: Promise<{ orgId: string; projectId: string }>
}) {
    const { orgId, projectId } = await params
    const session = await auth()

    // const realOrgId = session?.user?.orgs?.find((o) => o.org.name === orgId)?.orgId ?? ""
    const realOrgId = session?.user?.orgs?.find((o) => o.org.name === orgId)?.org.id ?? ""
    const project = realOrgId ? await getBoqProjectById(projectId, realOrgId) : null

    if (!project) return notFound()

    const canEdit = hasPermission(session, orgId, "boq:update") && !project.isLocked
    const canApprove = hasPermission(session, orgId, "boq:approve")

    // ── Compute aggregate numbers for dashboard ──────────────────────────────
    const allItems = project.categories.flatMap(c => c.items)
    const estimatedTotal = project.grandTotal

    // Actual total: only count items that have both actual fields filled in
    const itemsWithActual = allItems.filter(i => i.actualTotal != null)
    const actualTotal = itemsWithActual.length > 0
        ? itemsWithActual.reduce((s, i) => s + i.actualTotal!, 0)
        : null

    const grandVariance = actualTotal != null ? actualTotal - estimatedTotal : null

    const itemCount = allItems.length

    // Per-category data for chart
    const categoryChartData = project.categories.map(cat => {
        const catActualItems = cat.items.filter(i => i.actualTotal != null)
        const catActual = catActualItems.length > 0
            ? catActualItems.reduce((s, i) => s + i.actualTotal!, 0)
            : null
        return {
            name: cat.name,
            estimated: cat.categoryTotal,
            actual: catActual,
        }
    })

    // Over-budget categories
    const overBudgetCategories = project.categories
        .map(cat => {
            const catActualItems = cat.items.filter(i => i.actualTotal != null)
            if (catActualItems.length === 0) return null
            const catActual = catActualItems.reduce((s, i) => s + i.actualTotal!, 0)
            const variance = catActual - cat.categoryTotal
            if (variance <= 0) return null
            return {
                id: cat.id,
                name: cat.name,
                estimated: cat.categoryTotal,
                actual: catActual,
                variance,
                percentOver: (variance / cat.categoryTotal) * 100,
            }
        })
        .filter((c): c is NonNullable<typeof c> => c != null)
        .sort((a, b) => b.variance - a.variance)

    return (
        <>
            <SetBreadcrumbs items={[{ title: "BOQ", url: `/${orgId}/boq` }]} />
            <div className="space-y-6">
                {/* Back + Header */}
                <div className="flex flex-col gap-3">
                    <Button asChild variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground">
                        <Link href={`/${orgId}/boq`}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            กลับรายการโปรเจ็ก
                        </Link>
                    </Button>

                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                                <BoqStatusBadge status={project.status} />
                                {canEdit && (
                                    <BoqStatusSelect
                                        projectId={project.id}
                                        orgId={orgId}
                                        currentStatus={project.status}
                                        canEdit={canEdit}
                                    />
                                )}
                            </div>
                            {project.location && (
                                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {project.location}
                                </p>
                            )}
                            {project.description && (
                                <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {canEdit && <BoqAddCategoryForm projectId={projectId} orgId={orgId} />}
                            <BoqVersionPanel
                                projectId={projectId}
                                orgId={orgId}
                                versions={project.versions}
                            />
                            <BoqLockButton
                                projectId={projectId}
                                orgId={orgId}
                                isLocked={project.isLocked}
                                lockedAt={project.lockedAt}
                                canApprove={canApprove}
                            />
                        </div>
                    </div>
                </div>

                {/* Cost Alert Banner */}
                <BoqCostAlertSection overBudgetCategories={overBudgetCategories} />

                {/* Summary Bar */}
                <BoqSummaryBar
                    estimatedTotal={estimatedTotal}
                    actualTotal={actualTotal}
                    grandVariance={grandVariance}
                    categoryCount={project.categories.length}
                    itemCount={itemCount}
                />

                {/* Variance Chart */}
                {project.categories.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <BarChart2 className="h-4 w-4 text-primary" />
                                งบประมาณ vs ต้นทุนจริง (แยกตามหมวด)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BoqVarianceChart categories={categoryChartData} />
                        </CardContent>
                    </Card>
                )}

                <Separator />

                {/* Categories */}
                {project.categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                        <FolderOpen className="h-12 w-12 opacity-30" />
                        <p className="text-sm">ยังไม่มีหมวดหมู่ — กดปุ่ม &quot;เพิ่มหมวดหมู่&quot; เพื่อเริ่ม</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {project.categories.map((category) => (
                            <BoqCategorySection
                                key={category.id}
                                category={category}
                                projectId={projectId}
                                orgId={orgId}
                                canEdit={canEdit}
                            />
                        ))}

                        {/* Grand Total Footer */}
                        <div className="flex justify-end gap-3 pt-2">
                            <div className="rounded-lg border bg-blue-50 px-6 py-3 text-right">
                                <p className="text-xs text-blue-600 mb-0.5">ยอดประมาณการรวม</p>
                                <p className="text-xl font-bold text-blue-700">{formatCurrency(estimatedTotal)}</p>
                            </div>
                            {actualTotal != null && (
                                <div className={`rounded-lg border px-6 py-3 text-right ${grandVariance! > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                                    <p className={`text-xs mb-0.5 ${grandVariance! > 0 ? "text-red-600" : "text-green-600"}`}>
                                        ต้นทุนจริงรวม {grandVariance! > 0 ? "🔴 เกินงบ" : "🟢 อยู่ในงบ"}
                                    </p>
                                    <p className={`text-xl font-bold ${grandVariance! > 0 ? "text-red-700" : "text-green-700"}`}>
                                        {formatCurrency(actualTotal)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
