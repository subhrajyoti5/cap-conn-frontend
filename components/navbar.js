"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";

export function Navbar({ onMenuClick }) {
  const { isSignedIn, signOut, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {isSignedIn && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden btn-icon text-muted-foreground hover:text-foreground"
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-body text-base font-bold">C</span>
            </span>
            <span className="font-body text-lg font-semibold text-foreground hidden sm:inline">
              Capacity Connect
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!isSignedIn ? (
            <>
              <Link href="/sign-in" className="btn-tertiary hidden sm:inline-flex">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary">
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Get Started</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline max-w-[180px] truncate">
                {user?.email}
              </span>
              <button
                onClick={signOut}
                className="btn-tertiary border border-border hidden sm:inline-flex"
              >
                Sign Out
              </button>
              <button
                onClick={signOut}
                className="btn-icon text-muted-foreground sm:hidden"
                aria-label="Sign out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
