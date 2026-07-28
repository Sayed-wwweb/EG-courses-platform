import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  // Admin-only route — students and instructors get sent home. This check
  // runs on every request (no caching), so a role change takes effect the
  // next time this layout renders.
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="size-5 text-primary" />
        <h1 className="text-2xl font-bold">Admin</h1>
        <Link href="/instructor" className="ml-auto text-sm text-muted-foreground hover:text-foreground">
          Back to instructor
        </Link>
      </div>
      {children}
    </div>
  );
}