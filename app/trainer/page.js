"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TrainerDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);

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
      }
    }
    load();
  }, [getToken]);

  if (!data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-surface-alt rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your teaching overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-label">Courses</p>
          <p className="stat-value">{data.courses}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Trainees</p>
          <p className="stat-value">{data.totalTrainees}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending to Grade</p>
          <p className="stat-value">{data.pendingToGrade}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg text-ink mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/courses" className="btn-secondary">
            My Courses
          </Link>
          <Link href="/courses/create" className="btn-primary">
            Create Course
          </Link>
        </div>
      </div>
    </div>
  );
}
