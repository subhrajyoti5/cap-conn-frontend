"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function PendingPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Poll /me every 10 seconds — redirect as soon as status changes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await apiFetch("/me");
        const status = res?.data?.status;
        const role = res?.data?.role;

        if (status === "APPROVED") {
          clearInterval(interval);
          if (role === "ADMIN") router.push("/admin");
          else if (role === "TRAINER") router.push("/trainer");
          else router.push("/trainee");
        } else if (status === "REJECTED" || status === "SUSPENDED") {
          clearInterval(interval);
          // Stay on page but show updated message (handled below)
        }
      } catch {
        // Token invalid — sign out
        signOut();
      }
    }, 10000); // check every 10 seconds

    return () => clearInterval(interval);
  }, [router, signOut]);

  const status = user?.status || "PENDING";

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-xl gradient-accent-bar mx-auto mb-6 flex items-center justify-center">
          <span className="text-white font-bold text-xl">C</span>
        </div>

        {status === "PENDING" && (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="font-display text-2xl text-primary mb-2">
              Account Pending Approval
            </h1>
            <p className="text-muted text-sm mb-6">
              Your account is being reviewed by an admin. This page will
              automatically redirect you once approved. Hang tight!
            </p>
          </>
        )}

        {status === "REJECTED" && (
          <>
            <h1 className="font-display text-2xl text-red-600 mb-2">
              Account Rejected
            </h1>
            <p className="text-muted text-sm mb-6">
              Your account request was not approved. Please contact an
              administrator for more information.
            </p>
          </>
        )}

        {status === "SUSPENDED" && (
          <>
            <h1 className="font-display text-2xl text-red-600 mb-2">
              Account Suspended
            </h1>
            <p className="text-muted text-sm mb-6">
              Your account has been suspended. Please contact an administrator.
            </p>
          </>
        )}

        <button
          onClick={signOut}
          className="text-sm text-muted hover:text-ink transition-colors underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
