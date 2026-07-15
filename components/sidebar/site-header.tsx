"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../ui/themeToggle"
import { AvatarDropdown } from "@/app/(public)/_components/UserDropdown"
import { authClient } from "@/lib/auth-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Menu } from "lucide-react"
import { GlobalSearch } from "@/components/search/global-search"
import Link from "next/link"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"

const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Instructor', href: '/instructor' },
    { name: 'Profile', href: '/profile' },
    { name: 'Library', href: '/library' }
]

export function SiteHeader() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <header className="flex sticky top-0 z-50 bg-background/95 backdrop-blur-[backdrop-filter] h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger />

        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <GlobalSearch className="hidden lg:block w-84" />

          {isPending ? (
            <Skeleton className="size-9 rounded-md" />
          ) : session ? (
            <AvatarDropdown
              name={session.user.name || ""}
              email={session.user.email || ""}
              image={session.user.image || ""}
              square
            />
          ) : null}

          <ThemeToggle />

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-3/4">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                </SheetHeader>

                <div className="px-4 mb-2">
                  <GlobalSearch />
                </div>

                <div className="flex flex-col gap-2 px-4">
                  {navigationItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}