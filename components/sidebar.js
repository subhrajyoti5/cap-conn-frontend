"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/trainee",
    roles: ["TRAINEE"],
  },
  {
    label: "My Courses",
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

export function Sidebar({ role }) {
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border-warm bg-white">
      <div className="gradient-accent-bar h-1" />
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "nav-link-active" : "nav-link"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-border-warm">
        <p className="text-xs text-muted font-mono">Capacity Connect</p>
      </div>
    </aside>
  );
}
