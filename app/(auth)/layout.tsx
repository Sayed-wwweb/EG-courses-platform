import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6">

      <Link href="/" className={buttonVariants({ 
        variant: "ghost",
        className: "absolute left-4 top-4 md:left-8 md:top-8 text-xl"
      })}>
        <ArrowLeft className="size-5" /> 
        <span className="ml-1">back</span>
      </Link>

      <div className="flex w-full max-w-lg flex-col gap-6">

        <Link 
            className="flex items-center justify-center gap-2 font-large text-xl " 
            href="/"
        >
            elsayed platform
        </Link>

        {children}

        <div className="text-center text-balance text-sm text-muted-foreground">
            by clicking continue, you agree to our <span className="hover:underline hover:text-primary">Terms of
             Service</span> and <span className="hover:underline hover:text-primary">Privacy Policy</span>.       
        </div>
      </div>

    </div>
  );
}