"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TraineeDashboardPage() {
  const { getToken, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await apiFetch("/dashboard/trainee", {
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Active Courses", value: data?.activeCourses || 0, desc: "Currently enrolled" },
    { label: "Pending Assessments", value: data?.pendingAssessments || 0, desc: "Requires submission" },
    { label: "Completed Assessments", value: data?.completedAssessments || 0, desc: "Evaluated & graded" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your ongoing courses, assignments, and verified credentials.
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm self-start sm:self-auto"
        >
          Browse All Courses
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {stat.value}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/courses"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              Enrolled Courses
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View study materials and presentation slide decks.
            </p>
          </Link>

          <Link
            href="/certifications"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              Certifications
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Preview verified certificate documents with Drive viewer.
            </p>
          </Link>

          <Link
            href="/courses"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              Assessments & Quizzes
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Take pending quizzes and review graded scores.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Certifications if available */}
      {data?.certifications && data.certifications.length > 0 && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Verified Certifications
            </h3>
            <Link href="/certifications" className="text-xs text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{cert.name}</p>
                  <p className="text-slate-400">{cert.issuer}</p>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
