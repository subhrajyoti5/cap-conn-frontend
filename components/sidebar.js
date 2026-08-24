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
  switch (label) {
    case "Dashboard":
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "Courses":
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case "Certifications":
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      );
    case "Messages":
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "Pending Users":
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      );
    case "All Users":
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case "Subjects":
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m-15 0a2.25 2.25 0 00-1.5 2.122v4.878A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25v-4.878a2.25 2.25 0 00-1.5-2.122m-15 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128" />
        </svg>
      );
    case "Notifications":
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
        </svg>
      );
  }
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
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