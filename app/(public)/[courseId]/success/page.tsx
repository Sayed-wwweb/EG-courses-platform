import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-4">
      <CheckCircle2 className="size-16 text-green-500 mx-auto" />
      <h1 className="text-xl font-semibold">Payment received</h1>
      <p className="text-sm text-muted-foreground">
        Your enrollment will be activated shortly once the payment is confirmed.
      </p>
      <Link href="/profile" className={cn(buttonVariants(), "mt-4")}>
        Go to your profile
      </Link>
    </div>
  );
}