"use client"

import * as React from "react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboardIcon, 
  ListIcon, 
  Settings2Icon, 
  SearchIcon, 
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { APP_NAME, APP_LOGO } from "@/lib/constants";
import { cn } from "@/lib/utils"


const data = {

  navMain: [
    {
      title: "Dashboard",
      url: "/instructor",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Your courses",
      url: "/instructor/courses",
      icon: (
        <ListIcon
        />
      ),
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 w-full rounded-md p-3 text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Image src={APP_LOGO} alt="logo" width={26} height={26}/>
              <span className="text-base font-semibold">{APP_NAME}</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}