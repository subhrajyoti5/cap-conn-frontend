"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { AuraBackground } from "@/components/aura-background";

export function AppShell({ children }) {
  const { user } = useAuth();
  const role = user?.role || "TRAINEE";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <AuraBackground isFixed={true} />
      <div className="aura-overlay" />
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <div className="flex flex-1 overflow-hidden content-above-aura">
        <Sidebar
          role={role}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="page">
            <div className="page-section">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}