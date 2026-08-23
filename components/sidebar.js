"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
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
    label: "Dashboard",
    href: "/admin",
    roles: ["ADMIN"],
  },
  {
    label: "Pending Users",
    href: "/admin/users/pending",
    roles: ["ADMIN"],
  },
  {
    label: "All Users",
    href: "/admin/users",
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
    label: "Notifications",
    href: "/admin/notifications",
    roles: ["ADMIN"],
  },
];

export function Sidebar({ role, mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const navContent = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {items.map((item, index) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={active ? "nav-link-active relative" : "nav-link"}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0">
        <div className="px-3 py-3 border-b border-border">
          <p className="text-xs font-mono text-muted uppercase tracking-wider">
            Navigation
          </p>
        </div>
        {navContent}
        <div className="flex-1" />
        <div className="px-3 py-4 border-t border-border">
          <p className="text-xs text-muted font-mono">Capacity Connect</p>
        </div>
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
              <span className="font-body text-lg font-semibold text-text">Menu</span>
              <button
                onClick={onMobileClose}
                className="btn-icon text-muted"
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
              <p className="text-xs text-muted font-mono">Capacity Connect</p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}