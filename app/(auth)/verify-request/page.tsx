"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export default function VerifyRequest() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [emailPending, startTransition] = useTransition()
    const [email, setEmail] = useState<string | null>(null);
    const isOtpCompleted = otp.length === 6;

    // Email is read from sessionStorage (set by LoginForm right before the
    // redirect here) instead of a ?email= URL param — keeps it out of
    // browser history and server logs. If it's missing — direct
    // navigation to this URL, or the tab/session was cleared — there's
    // nothing to verify, so send them back to request a fresh code.
    //
    // This intentionally runs inside an effect rather than during render:
    // sessionStorage doesn't exist during Next's server-side render, so
    // reading it directly in the component body would make the server's
    // HTML and the client's first paint disagree (a hydration mismatch) —
    // worse than this lint warning. Deferring the read until after mount
    // is the documented exception to this rule, not a workaround.
    useEffect(() => {
        const stored = sessionStorage.getItem("pendingVerificationEmail");
        if (!stored) {
            router.push("/login");
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
        setEmail(stored);
    }, [router]);

    function verifyOtp() {
        if (!email) return;
        startTransition(async () => {
            await authClient.signIn.emailOtp({
                email: email,
                otp: otp,
                fetchOptions: {
                    onSuccess: () => {
                        sessionStorage.removeItem("pendingVerificationEmail");
                        toast.success("email verified successfully!");
                        router.push("/");
                    },
                    onError: () => {
                        toast.error("Failed to verify email");
                    }
                }
            });
        })
    }

  if (!email) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Check your email</CardTitle>
        <CardDescription className="text-center text-sm text-balance">
          We have sent a verification code to your email.
          Please check your inbox and enter the code to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-2">
          <InputOTP 
          value={otp} 
          onChange={(value) => setOtp(value)} 
          maxLength={6} 
          className="gap-2 flex" >
            <InputOTPGroup >
              <InputOTPSlot className="size-9" index={0} />
              <InputOTPSlot className="size-9" index={1} />
              <InputOTPSlot className="size-9" index={2} />
            </InputOTPGroup>

            <InputOTPSeparator className="text-muted-foreground" />

            <InputOTPGroup>
              <InputOTPSlot className="size-9" index={3} />
              <InputOTPSlot className="size-9" index={4} />
              <InputOTPSlot className="size-9" index={5} />
            </InputOTPGroup>
          </InputOTP>

        <p className="text-sm text-muted-foreground">
            Did not receive the code? Resend
        </p>
        </div>
        <Button 
        className="mt-4 w-full p-4.5" 
        type="submit"
        onClick={verifyOtp}
        disabled={emailPending || !isOtpCompleted}
        >
            {emailPending ? (
                <>
                <Loader2 className="size-4 animated-spin"/>
                </>
            ) : (
                "verify"
            )
            }
        </Button>
      </CardContent>
    </Card>
  );
}