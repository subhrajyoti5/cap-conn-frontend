"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  // Trainee items
  {
    label: "Dashboard",
    href: "/trainee",
    roles: ["TRAINEE"],
  },
  {
    label: "Courses",
    href: "/courses",
    roles: ["TRAINEE"],
  },
  {
    label: "Certifications",
    href: "/certifications",
    roles: ["TRAINEE"],
  },
  {
    label: "Messages",
    href: "/messages",
    roles: ["TRAINEE"],
  },
  {
    label: "Profile",
    href: "/trainee/profile",
    roles: ["TRAINEE"],
  },

  // Trainer items
  {
    label: "Dashboard",
    href: "/trainer",
    roles: ["TRAINER"],
  },
  {
    label: "Courses",
    href: "/courses",
    roles: ["TRAINER"],
  },
  {
    label: "Certifications",
    href: "/certifications",
    roles: ["TRAINER"],
  },
  {
    label: "Messages",
    href: "/messages",
    roles: ["TRAINER"],
  },
  {
    label: "Profile",
    href: "/trainer/profile",
    roles: ["TRAINER"],
  },

  // Admin items
  {
    label: "Dashboard",
    href: "/admin",
    roles: ["ADMIN"],
  },
  {
    label: "All Users",
    href: "/admin/users",
    roles: ["ADMIN"],
  },
  {
    label: "Pending Users",
    href: "/admin/users/pending",
    roles: ["ADMIN"],
  },
  {
    label: "Courses",
    href: "/admin/courses",
    roles: ["ADMIN"],
  },
  {
    label: "Subjects",
    href: "/admin/subjects",
    roles: ["ADMIN"],
  },
  {
    label: "Certifications",
    href: "/certifications",
    roles: ["ADMIN"],
  },
];

function getIcon(label) {
  const names = {
    "Dashboard":      "dashboard",
    "Courses":        "menu_book",
    "Certifications": "workspace_premium",
    "Messages":       "mail",
    "Profile":        "account_circle",
    "Pending Users":  "person_add",
    "All Users":      "group",
    "Subjects":       "category",
  };
  const name = names[label] ?? "circle";
  return <span className="icon" aria-hidden="true">{name}</span>;
}

export function Sidebar({ role, mobileOpen, onMobileClose, collapsed }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const navContent = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {items.map((item, index) => {
        // Strict active check to prevent prefix overlaps (e.g. /admin/users vs /admin/users/pending)
        const active =
          pathname === item.href ||
          (item.href !== "/admin" &&
           item.href !== "/admin/users" &&
           item.href !== "/trainee" &&
           item.href !== "/trainer" &&
           item.href !== "/courses" &&
           pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href + index}
            href={item.href}
            onClick={onMobileClose}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              active
                ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-xs"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            } ${collapsed ? "justify-center px-0" : ""}`}
          >
            <span className="shrink-0">{getIcon(item.label)}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Backdrop & Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <span className="font-bold text-sm text-foreground">Menu Navigation</span>
          <button
            onClick={onMobileClose}
            className="btn-icon text-muted-foreground hover:text-foreground"
          >
            <span className="icon">close</span>
          </button>
        </div>
        {navContent}
      </aside>

      {/* Desktop Sidebar Column */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border shrink-0 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}