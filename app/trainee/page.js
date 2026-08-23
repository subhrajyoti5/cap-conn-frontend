"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TraineeDashboardPage() {
  const { getToken } = useAuth();
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
      <div className="space-y-6 animate-in">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-6 skeleton h-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Active Courses", value: data.activeCourses, icon: "📚" },
    { label: "Pending", value: data.pendingAssessments, icon: "⏳" },
    { label: "Completed", value: data.completedAssessments, icon: "✅" },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your learning progress at a glance.</p>
        </div>
        <Link href="/courses" className="btn-primary">
          Browse Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="card-shell" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="card p-6 flex flex-col items-center text-center">
              <span className="text-3xl mb-2">{stat.icon}</span>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="card-shell">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Next Steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/courses" className="p-4 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="text-xl mb-2 block">🎓</span>
              <p className="font-medium">Continue Learning</p>
              <p className="text-sm text-muted-foreground">{data.activeCourses} active courses</p>
            </Link>
            <Link href="/assessments" className="p-4 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="text-xl mb-2 block">📝</span>
              <p className="font-medium">Pending Assessments</p>
              <p className="text-sm text-muted-foreground">{data.pendingAssessments} items due</p>
            </Link>
            <Link href="/certifications" className="p-4 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="text-xl mb-2 block">🏆</span>
              <p className="font-medium">Your Certifications</p>
              <p className="text-sm text-muted-foreground">{data.completedAssessments} completed</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
