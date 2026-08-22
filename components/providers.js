"use client";

import { AuthProvider } from "@/features/auth/auth-context";

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
