"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }) {
  const { user } = useAuth();
  const role = user?.role || "TRAINEE";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar 
        onMenuClick={() => setMobileNavOpen(true)} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          role={role}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
          collapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="page">
            <div className="page-section">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}