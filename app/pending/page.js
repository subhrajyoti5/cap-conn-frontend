"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function PendingPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

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
        }
      } catch {
        signOut();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [router, signOut]);

  const status = user?.status || "PENDING";

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-card-lg bg-ink flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-display text-xl font-bold">C</span>
        </div>

        {status === "PENDING" && (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="font-display text-2xl text-ink mb-2">
              Account Pending Approval
            </h1>
            <p className="text-muted text-sm mb-6">
              Your account is being reviewed by an admin. This page will
              automatically redirect you once approved.
            </p>
          </>
        )}

        {status === "REJECTED" && (
          <>
            <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
            <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12V15z" />
            </svg>
            <h1 className="font-display text-2xl text-red-600 mb-2">
              Account Suspended
            </h1>
            <p className="text-muted text-sm mb-6">
              Your account has been suspended. Please contact an administrator.
            </p>
          </>
        )}

        <button onClick={signOut} className="btn-tertiary">
          Sign out
        </button>
      </div>
    </div>
  );
}