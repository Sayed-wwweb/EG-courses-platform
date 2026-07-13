"use client";

import { useState } from "react";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startCheckout } from "./checkout-actions";

interface PaymobCheckoutButton {
  mount: (selector: string) => void;
}

interface PaymobInstance {
  checkoutButton: (clientSecret: string) => PaymobCheckoutButton;
}

declare global {
  interface Window {
    Paymob?: (publicKey: string) => PaymobInstance;
  }
}

interface CheckoutClientProps {
  course: { id: string; title: string; price: number };
}

export function CheckoutClient({ course }: CheckoutClientProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  async function handleStart() {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    setIsLoading(true);
    const result = await startCheckout(course.id, phoneNumber.trim());
    setIsLoading(false);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    const { clientSecret, publicKey } = result.data;

    if (typeof window !== "undefined" && window.Paymob) {
      setCheckoutReady(true);
      window.Paymob(publicKey).checkoutButton(clientSecret).mount("#paymob-checkout");
    } else {
      toast.error("Payment SDK failed to load. Please refresh and try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <Script
        src="https://checkout.paymob.com/paymob.js"
        onLoad={() => setSdkLoaded(true)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{course.title}</p>
            <p className="text-xl font-semibold">{course.price} EGP</p>
          </div>

          {!checkoutReady ? (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button
                onClick={handleStart}
                disabled={isLoading || !sdkLoaded}
                className="w-full mt-2"
              >
                {isLoading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
                Continue to payment
              </Button>
            </div>
          ) : (
            <div id="paymob-checkout" className="min-h-24" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}