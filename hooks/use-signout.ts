"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function useSignout() {
    const router = useRouter()
    const handleSignout = async function logout() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/"); // redirect to login page
                    toast.success("Logged out successfully");
                },
                onError: () => {
                    toast.error("Failed to sign out") 
                }
            },
        });
    }

    return handleSignout;
}