"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";

export default function RedirectPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const status = user?.status || "PENDING";
    const role = user?.role || "TRAINEE";

    if (status === "PENDING" || status === "REJECTED" || status === "SUSPENDED") {
      router.push("/pending");
      return;
    }

    if (role === "ADMIN") router.push("/admin");
    else if (role === "TRAINER") router.push("/trainer");
    else router.push("/trainee");
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Setting up your account...</p>
      </div>
    </div>
  );
}
