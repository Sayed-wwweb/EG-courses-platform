"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSignout } from "@/hooks/use-signout"
import { cn } from "@/lib/utils"
import { Book, Home, LayoutDashboard, LogOut, User } from "lucide-react"
import Link from "next/link"

interface iAppProps {
    name: string;
    email: string;
    image: string;
    square?: boolean;
}

export function AvatarDropdown({name, image, square = false}: iAppProps) {
  const handleSignout = useSignout();

  return (
    <DropdownMenu>

        <DropdownMenuTrigger asChild>
            <Button variant={square ? "ghost" : "outline"} size="icon" className={square ? "rounded-md" : "rounded-full"}>
                <Avatar className={square ? "rounded-md" : undefined}>
                    <AvatarImage src={image || ""} alt={name || ""} className={square ? "rounded-md" : undefined} />
                    <AvatarFallback className={square ? "rounded-md" : undefined}>{name?.charAt(0) || ""}</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">

         <DropdownMenuGroup>
            {name && (
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <User className="size-4 mr-2" />
                        <span>{name}</span>
                    </Link>
                </DropdownMenuItem>
            )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>

          <DropdownMenuItem asChild>
            <Link href="/">
                <Home className="size-4 mr-2" />
                <span>Home</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
                <Link href="/courses">
                <Book className="size-4 mr-2" />
                <span>Courses</span>
                </Link>
            </DropdownMenuItem>

          <DropdownMenuItem asChild>
                <Link href="/instructor">
                    <LayoutDashboard className="size-4 mr-2" />
                    <span>Instructor</span>
                </Link>
            </DropdownMenuItem>

        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" asChild>
            <button className="w-full flex items-center justify-start" onClick={handleSignout}>
                <LogOut className="size-4 mr-2" />
                <span>Log out</span>
            </button>
            </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}