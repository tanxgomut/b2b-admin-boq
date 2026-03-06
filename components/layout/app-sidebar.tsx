"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavProjects } from "@/components/layout/nav-projects"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: any }) {

  const org = user?.user?.orgs?.[0]?.org?.name

  // ดึง permission keys ของ org ปัจจุบัน
  const currentOrgMember = user?.user?.orgs?.find(
    (o: any) => o.org.name === org
  )
  const permKeys: string[] = currentOrgMember?.role?.permissions?.map(
    (p: any) => p.permission.key
  ) ?? []

  const can = (key: string) => permKeys.includes(key)

  // sub-items ของ "Manage User" — กรองตาม read permission
  const manageUserItems = [
    can("user:read") && { title: "User", url: `/${org}/user` },
    can("permission:read") && { title: "Permissions", url: `/${org}/permissions` },
    can("organization:read") && { title: "Organization", url: `/${org}/organization` },
  ].filter(Boolean) as { title: string; url: string }[]

  const navMain = [
    // Dashboard ทุกคนเห็น
    {
      title: "Dashboard",
      url: `/${org}/dashboard`,
      icon: SquareTerminal,
      isActive: true,
    },
    // Manage User — แสดงเฉพาะเมื่อมี sub-items อย่างน้อย 1 รายการ
    ...(manageUserItems.length > 0
      ? [{ title: "Manage User", icon: Bot, items: manageUserItems }]
      : []),
    // Boq
    can("boq:read") && {
      title: "Boq",
      url: `/${org}/boq`,
      icon: SquareTerminal,
    },
  ].filter(Boolean) as { title: string; url?: string; icon?: any; isActive?: boolean; items?: { title: string; url: string }[] }[]


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher user={user?.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
