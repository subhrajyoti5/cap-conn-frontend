"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function Navbar() {
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
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-secondary">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-primary">Sign Up</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
}
