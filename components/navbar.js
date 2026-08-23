"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";

export function Navbar({ onMenuClick }) {
  const { isSignedIn, signOut, user } = useAuth();

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-border-warm bg-white shrink-0">
      <div className="flex items-center gap-3">
        {isSignedIn && onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-md hover:bg-surface-alt transition-colors"
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md gradient-accent-bar flex items-center justify-center">
            <span className="text-white font-display text-sm font-bold">C</span>
          </span>
          <span className="font-display text-lg text-primary hidden sm:inline">
            Capacity Connect
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {!isSignedIn ? (
          <>
            <Link href="/sign-in" className="btn-secondary text-sm">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary text-sm">
              Sign Up
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden md:inline max-w-[200px] truncate">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="btn-tertiary border border-border-warm"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
