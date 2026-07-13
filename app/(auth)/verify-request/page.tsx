"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/dist/client/components/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

function VerifyRequestForm() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [emailPending, startTransition] = useTransition()
    const params = useSearchParams();
    const email = params.get("email") as string;
    const isOtpCompleted = otp.length === 6;

    function verifyOtp() {
        startTransition(async () => {
            await authClient.signIn.emailOtp({
                email: email,
                otp: otp,
                fetchOptions: {
                    onSuccess: () => {
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

export default function VerifyRequest() {
  return (
    <Suspense fallback={null}>
      <VerifyRequestForm />
    </Suspense>
  );
}