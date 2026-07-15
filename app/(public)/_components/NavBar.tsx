"use client"

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client";
import { buttonVariants, Button } from "@/components/ui/button";
import { AvatarDropdown } from "./UserDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME, APP_LOGO } from "@/lib/constants";
import { Menu } from "lucide-react";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, FormEvent } from "react";
import { GlobalSearch } from "@/components/search/global-search";

const navigationItems = [
    {name: 'Home', href: '/'},
    {name: 'Courses', href: '/courses'},
    {name: 'Instructor', href: '/instructor'},
    {name: 'Profile', href: '/profile'},
    {name: 'Library', href: '/library'}
]

export default function NavBar() {
    const {data: session, isPending} = authClient.useSession();
    const pathname = usePathname();
    const hideAvatar = pathname === "/profile";
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    }
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95
         backdrop-blur-[backdrop-filter];bg-background/60">
            <div className="container flex min-h-16 items-center mx-auto px-4
             md:px-6 lg:px-8 gap-2">

                <Link href="/" className="flex items-center space-x-2 mr-10">
                    <Image src={APP_LOGO} alt="logo" width={28} height={28} />
                    <span className="font-bold text-base">{APP_NAME}</span>
                </Link>

                <nav className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between ">
                    <div className="flex item-center space-x-2 gap-6">
                    {navigationItems.map((item) => (  
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className="text-sm font-medium transition-colors hover:text-primary">
                            {item.name}
                        </Link>
                    ))}
                    </div>

                    <GlobalSearch className="flex-1 max-w-xs mx-6" />

                    <div className="flex items-center sapce-x-4 gap-4">
                        <ThemeToggle />

 {isPending ? <Skeleton className="size-9 rounded-md" /> : session && !hideAvatar ? (
    <AvatarDropdown name={session.user.name || ""} email={session.user.email || ""} image={session.user.image || ""} square />
): !session && !isPending ? (
    <>
        <Link href={"/login"} className={buttonVariants({variant: "secondary"})}>
            Login
        </Link>

        <Link href={"/login"} className={buttonVariants()}>
            Get started
        </Link>
    </>
) : null}
                    </div>

                </nav>

<div className="ml-auto flex items-center gap-2 lg:hidden">
    {isPending ? (
        <Skeleton className="size-9 rounded-md" />
    ) : session && !hideAvatar ? (
        <AvatarDropdown
            name={session.user.name || ""}
            email={session.user.email || ""}
            image={session.user.image || ""}
            square
        />
    ) : null}

    <ThemeToggle />

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
                <GlobalSearch onNavigate={() => {/* sheet closes automatically on route change */}} />
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
            {/* rest stays the same */}

            {!isPending && !session && (
                <div className="mt-auto flex flex-col gap-3 border-t px-4 py-4">
                    <SheetClose asChild>
                        <Link href={"/login"} className={buttonVariants({ variant: "secondary" })}>
                            Login
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link href={"/login"} className={buttonVariants()}>
                            Get started
                        </Link>
                    </SheetClose>
                </div>
            )}
        </SheetContent>
    </Sheet>
</div>
            </div>
         </header>
    )
}