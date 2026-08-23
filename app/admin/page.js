"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);

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
      }
    }
    load();
  }, [getToken]);

  if (!data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-surface-alt rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card h-24" />
          ))}
        </div>
      </div>
    );
  }

  const stats = Object.entries(data).map(([key, value]) => ({
    label: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    value,
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
