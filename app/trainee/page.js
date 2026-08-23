"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TraineeDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);

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
      }
    }
    load();
  }, [getToken]);

  if (!data) {
    return (
      <div className="space-y-6 animate-in stagger-1">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-5 skeleton h-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your learning at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-shell">
          <div className="card p-5">
            <p className="stat-label">Active Courses</p>
            <p className="stat-value">{data.activeCourses}</p>
          </div>
        </div>
        <div className="card-shell">
          <div className="card p-5">
            <p className="stat-label">Pending Assessments</p>
            <p className="stat-value">{data.pendingAssessments}</p>
          </div>
        </div>
        <div className="card-shell">
          <div className="card p-5">
            <p className="stat-label">Completed</p>
            <p className="stat-value">{data.completedAssessments}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg text-ink mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/courses" className="btn-secondary">
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}