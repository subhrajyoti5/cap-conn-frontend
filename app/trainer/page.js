"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

export default function TrainerDashboardPage() {
  const { getToken } = useAuth();
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
    { label: "Courses", value: data.courses, icon: "📖" },
    { label: "Trainees", value: data.totalTrainees, icon: "👥" },
    { label: "Pending", value: data.pendingToGrade, icon: "📝" },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your teaching activities.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/courses" className="btn-secondary">My Courses</Link>
          <Link href="/courses/create" className="btn-primary">Create Course</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="card-shell" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-3 rounded-xl overflow-hidden bg-muted">
                <Image 
                  src="/trainer/Artboard 1.png" 
                  alt="Trainer Icon" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="card-shell">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/courses" className="p-4 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="text-xl mb-2 block">📖</span>
              <p className="font-medium">View My Courses</p>
              <p className="text-sm text-muted-foreground">Manage your course content</p>
            </Link>
            <Link href="/courses/create" className="p-4 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="text-xl mb-2 block">➕</span>
              <p className="font-medium">Create New Course</p>
              <p className="text-sm text-muted-foreground">Start teaching today</p>
            </Link>
            <Link href="/submissions" className="p-4 rounded-lg hover:bg-muted transition-colors text-left">
              <span className="text-xl mb-2 block">📝</span>
              <p className="font-medium">Grade Submissions</p>
              <p className="text-sm text-muted-foreground">{data.pendingToGrade} items pending</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
