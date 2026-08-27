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
    label: "Messages",
    href: "/messages",
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
    label: "Messages",
    href: "/messages",
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
    label: "Messages",
    href: "/messages",
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
  {
    label: "Notifications",
    href: "/admin/notifications",
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
    "Notifications":  "notifications",
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
        const active =
          pathname === item.href ||
          (item.href !== "/admin" &&
            item.href !== "/trainer" &&
            item.href !== "/trainee" &&
            !(item.href === "/admin/users" && pathname.startsWith("/admin/users/pending")) &&
            pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={active ? `nav-link-active relative ${collapsed ? "justify-center px-0" : ""}` : `nav-link ${collapsed ? "justify-center px-0" : ""}`}
            style={{ animationDelay: `${index * 40}ms` }}
            title={collapsed ? item.label : undefined}
          >
            {getIcon(item.label)}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col ${collapsed ? "w-16" : "w-64"} border-r border-border bg-surface shrink-0 transition-all duration-300`}>
        {!collapsed && (
          <div className="px-3 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Navigation
            </p>
          </div>
        )}
        {navContent}
        <div className="flex-1" />
        {!collapsed && (
          <div className="px-3 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-mono">Capacity Connect</p>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden animate-in fade-in-0 duration-fast"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-50 flex flex-col lg:hidden animate-in slide-in-from-left duration-normal ease-out-expo">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-display text-lg font-semibold text-foreground">Menu</span>
              <button
                onClick={onMobileClose}
                className="btn-icon text-muted-foreground"
                aria-label="Close navigation"
              >
                <span className="icon" aria-hidden="true">close</span>
              </button>
            </div>
            {navContent}
            <div className="flex-1" />
            <div className="px-4 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground font-mono">Capacity Connect</p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}