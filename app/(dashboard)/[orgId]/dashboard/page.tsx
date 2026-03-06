import SetBreadcrumbs from "@/components/check/set-breadcrumb"
import ThemeSkeleton from "@/components/assets/theme-skelaton"
import { SectionCards } from "@/features/dashboard/components/section-cards"

export default async function Page({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return (
    <>
      <SetBreadcrumbs items={[{ title: "Dashboard", url: `/${orgId}/dashboard` }]} />
      {/* <ThemeSkeleton /> */}
      <div className=" flex flex-1 flex-col ">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
        </div>

      </div>
    </>
  )
}
