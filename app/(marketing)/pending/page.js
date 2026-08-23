"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function PendingPage() {
  const { user, signOut } = useAuth();

  // Poll /me every 5 seconds — redirect as soon as status changes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await apiFetch("/me");
        const status = res?.data?.status;
        const role = res?.data?.role;


        if (status === "APPROVED") {
          clearInterval(interval);
          if (role === "ADMIN") window.location.href = "/admin";
          else if (role === "TRAINER") window.location.href = "/trainer";
          else window.location.href = "/trainee";
        } else if (status === "REJECTED" || status === "SUSPENDED") {
          clearInterval(interval);
        }
      } catch {
        signOut();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [signOut]);

  const status = user?.status || "PENDING";

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full gradient-accent-bar mx-auto mb-6 flex items-center justify-center">
          <span className="text-white font-bold text-xl">C</span>
        </div>

        {status === "PENDING" && (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="font-display text-display-md text-primary mb-3">
              Account Pending Approval
            </h1>
            <p className="text-muted mb-6">
              Your account is being reviewed by an admin. This page will
              automatically redirect you once approved. Hang tight!
            </p>
          </>
        )}

        {status === "REJECTED" && (
          <>
            <h1 className="font-display text-display-md text-red-600 mb-3">
              Account Rejected
            </h1>
            <p className="text-muted mb-6">
              Your account request was not approved. Please contact an
              administrator for more information.
            </p>
          </>
        )}

        {status === "SUSPENDED" && (
          <>
            <h1 className="font-display text-display-md text-red-600 mb-3">
              Account Suspended
            </h1>
            <p className="text-muted mb-6">
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
