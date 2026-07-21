import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ReactNode } from "react"

export default async function AdminPage( { children  } : { children: ReactNode}) {
    const session = await auth.api.getSession({
      headers: await headers(),
    }); 

    if (!session) {
      redirect("/login");
  }

  // Session alone isn't enough — this route group is instructor-only.
  // Without this check, any logged-in student could open the full
  // instructor UI shell (sidebar, dashboard, course creation) even
  // though the individual server actions underneath still enforce
  // per-course ownership.
  if (session.user.role !== "INSTRUCTOR") {
    redirect("/");
  }
  

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 p-6">
                {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}