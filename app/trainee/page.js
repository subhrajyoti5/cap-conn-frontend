"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api";

export default function TraineeDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const res = await apiFetch("/dashboard/trainee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    }
    load();
  }, [getToken]);

  if (!data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-surface-alt rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-display-md text-primary mb-6">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs font-mono text-muted uppercase tracking-wider mb-1">
            Active Courses
          </p>
          <p className="text-3xl font-display text-primary">
            {data.activeCourses}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-mono text-muted uppercase tracking-wider mb-1">
            Pending Assessments
          </p>
          <p className="text-3xl font-display text-primary">
            {data.pendingAssessments}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-mono text-muted uppercase tracking-wider mb-1">
            Completed
          </p>
          <p className="text-3xl font-display text-primary">
            {data.completedAssessments}
          </p>
        </div>
      </div>
    </div>
  );
}
