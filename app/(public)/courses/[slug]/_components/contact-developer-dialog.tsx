"use client";

import { MessageCircle, Hash } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

interface ContactDeveloperDialogProps {
  price: number;
}

export function ContactDeveloperDialog({ price }: ContactDeveloperDialogProps) {
  const whatsappUrl = `https://wa.me/${env.NEXT_PUBLIC_WHATSAPP_NUMBER}`;
  const discordUrl = env.NEXT_PUBLIC_DISCORD_INVITE_URL;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className={cn(buttonVariants({ size: "default" }), "flex-1")}>
          Contact developer — <span className="font-semibold">{price} EGP</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get access to this course</DialogTitle>
          <DialogDescription>
            Reach out and we&apos;ll sort out payment and access together.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" className="w-full justify-start gap-2">
              <MessageCircle className="size-4" />
              WhatsApp
            </Button>
          </a>
          <a href={discordUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" className="w-full justify-start gap-2">
              <Hash className="size-4" />
              Discord
            </Button>
          </a>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}