"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";

export function Navbar() {
  const { isSignedIn, signOut, user } = useAuth();

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-border-warm bg-white">
      <Link href="/" className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-md gradient-accent-bar flex items-center justify-center">
          <span className="text-white font-display text-sm font-bold">C</span>
        </span>
        <span className="font-display text-lg text-primary hidden sm:inline">
          Capacity Connect
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {!isSignedIn ? (
          <>
            <Link href="/sign-in" className="btn-secondary">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary">
              Sign Up
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-sm rounded-md border border-border-warm hover:bg-surface-alt transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
