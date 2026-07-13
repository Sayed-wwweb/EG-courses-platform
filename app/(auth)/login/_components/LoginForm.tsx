"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/icons/google";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

export function LoginForm (){
  const router = useRouter();
  const [googlePending, startGoogleTransition] = React.useTransition()
  const [emailPending, startEmailTransition] = React.useTransition()

  const [email, setEmail] = useState("");

  async function SigninWithGoogle() {
    startGoogleTransition(async () => {
          await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
            fetchOptions: {
              onSuccess: () => {
                toast.success("Logged in successfully!")
              },
              onError: () => {
                toast.error("internal server error")
              }
            }
          })
      }
    )
  }

  function signInWithEmail() {
    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp ({
        email:email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Verification code sent to your email!")
            router.push(`/verify-request?email=${email}`)
          },
          onError: () => {
            toast.error("Failed to send verification code")
          }
        }
      });
    });
  }

  return(
    <div className="flex max-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>
            Login with your Google Email Account
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button variant="outline"
           className="w-full text-lg p-5" 
           disabled={googlePending} 
           onClick={SigninWithGoogle}
           >
            {googlePending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Signing in...</span>
              </>
            ):(
              <>
                <GoogleIcon className="size-6" />
                Sign in with Google
              </>
              )
            }
          </Button>

          <div className="relative text-center text-sm after:absolute after:inset-0 
          after:top-1/2 after:z-0 after:flex after:items-center after:border-t 
          after:border-border">
            <span className="relative z-10 bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>

          <div className="grid gap-1">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  className="p-5" 
                  required
                />
            </div>
            <Button type="submit" className="mt-1 text-lg p-5" onClick={signInWithEmail} disabled={emailPending}>
              {emailPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Sending</span>
                </>
              ) : (
                <>
                <Send className="size-5" />
                <span>Continue</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    )
}