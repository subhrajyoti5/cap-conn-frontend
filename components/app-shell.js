"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }) {
  const { user } = useAuth();
  const role = user?.role || "TRAINEE";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-surface">
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          role={role}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
