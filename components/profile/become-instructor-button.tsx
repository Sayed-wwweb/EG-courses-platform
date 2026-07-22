"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { becomeInstructor } from "@/app/(public)/profile/profile-actions";
import {
  becomeInstructorSchema,
  payoutMethods,
  type BecomeInstructorSchemaType,
} from "@/lib/zodSchemas";

const payoutMethodLabels: Record<(typeof payoutMethods)[number], string> = {
  MOBILE_WALLET: "Mobile wallet",
  BANK_ACCOUNT: "Bank account",
  INSTAPAY: "InstaPay",
};

const payoutFieldLabels: Record<(typeof payoutMethods)[number], string> = {
  MOBILE_WALLET: "Mobile wallet number",
  BANK_ACCOUNT: "IBAN",
  INSTAPAY: "Phone number or InstaPay ID",
};

const payoutPlaceholders: Record<(typeof payoutMethods)[number], string> = {
  MOBILE_WALLET: "01XXXXXXXXX",
  BANK_ACCOUNT: "EG380019000500000000263180002",
  INSTAPAY: "01XXXXXXXXX or yourname@instapay",
};

export function BecomeInstructorButton() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<BecomeInstructorSchemaType>({
    resolver: zodResolver(becomeInstructorSchema),
    defaultValues: {
      payoutMethod: undefined,
      payoutNumber: "",
    },
  });

  const payoutMethod = form.watch("payoutMethod");

  async function onSubmit(values: BecomeInstructorSchemaType) {
    setSubmitError(null);
    const result = await becomeInstructor(values);

    if (result.status === "error") {
      setSubmitError(result.message);
      return;
    }

    setOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset();
          setSubmitError(null);
        }
      }}
    >
      <DialogTrigger asChild className="md:w-full">
        <Button>Become an instructor</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Become an instructor</DialogTitle>
          <DialogDescription>
            Tell us how you&apos;d like to receive your course earnings.
            You can update this later from your profile.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="payoutMethod"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>Payout method</FormLabel>
                  <FormControl>
                    {/* Segmented control: three pill buttons, one highlighted */}
                    <div className="flex w-full rounded-full bg-muted p-1">
                      {payoutMethods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            field.onChange(method);
                            // Switching methods invalidates whatever number
                            // was typed for the previous method (different format).
                            form.setValue("payoutNumber", "");
                          }}
                          className={cn(
                            "flex-1 rounded-full py-2 text-xs sm:text-sm font-medium transition-colors",
                            field.value === method
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {payoutMethodLabels[method]}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {payoutMethod && (
              <FormField
                control={form.control}
                name="payoutNumber"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>{payoutFieldLabels[payoutMethod]}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={payoutPlaceholders[payoutMethod]}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? "Please wait..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}