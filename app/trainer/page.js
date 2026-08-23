"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TrainerDashboardPage() {
  const { getToken, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await apiFetch("/dashboard/trainer", {
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
    { label: "Total Courses", value: data?.courses || 0, desc: "Created courses" },
    { label: "Active Trainees", value: data?.totalTrainees || 0, desc: "Enrolled students" },
    { label: "Pending Submissions", value: data?.pendingToGrade || 0, desc: "Awaiting evaluation" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Trainer Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of your authored courses, resources, and trainee performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
          >
            My Courses
          </Link>
          <Link
            href="/courses/create"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            Create Course
          </Link>
        </div>
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

      {/* Quick Action Navigation */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Management
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/courses"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              Manage Courses
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add presentation slide decks, study blueprints, and documents.
            </p>
          </Link>

          <Link
            href="/certifications"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              Credentials & Badges
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View your professional certifications and instructor credentials.
            </p>
          </Link>

          <Link
            href="/courses/create"
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              Publish New Course
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Define competencies, curriculum modules, and assessments.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Feedback if present */}
      {data?.recentFeedback && data.recentFeedback.length > 0 && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">
            Recent Trainee Reviews
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentFeedback.map((fb) => (
              <div key={fb.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {fb.user?.name || "Trainee"} &bull; {fb.rating}/5 Stars
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">{fb.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
