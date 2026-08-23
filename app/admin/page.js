"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await apiFetch("/dashboard/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: data?.totalUsers || 0, desc: "Trainees & Trainers", href: "/admin/users" },
    { label: "Pending Approvals", value: data?.pendingApprovals || 0, desc: "Awaiting review", href: "/admin/users/pending" },
    { label: "Published Courses", value: data?.courses || 0, desc: "Active curriculum", href: "/admin/courses" },
    { label: "Active Enrollments", value: data?.activeEnrollments || 0, desc: "Student engagements", href: "/admin/courses" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            System Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global metrics, pending approvals, and institutional oversight.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/subjects"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            Manage Subjects
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {stat.value}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Navigation Sections */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Admin Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/users/pending"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                Pending Approvals
              </p>
              {data?.pendingApprovals > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {data.pendingApprovals}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review and approve newly registered trainers and trainees.
            </p>
          </Link>

          <Link
            href="/admin/courses"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              Course Catalog
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse published courses, learning presentations, and materials.
            </p>
          </Link>

          <Link
            href="/certifications"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              System Certifications
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Access Google Drive certificate documents and accreditation records.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
