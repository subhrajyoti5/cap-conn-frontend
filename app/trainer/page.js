"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function TrainerDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      const res = await apiFetch("/dashboard/trainer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    }
    load();
  }, [getToken]);

  if (!data) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Trainer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded">
          <p className="text-sm text-gray-600">Courses</p>
          <p className="text-2xl font-bold">{data.courses}</p>
        </div>
        <div className="border p-4 rounded">
          <p className="text-sm text-gray-600">Total Trainees</p>
          <p className="text-2xl font-bold">{data.totalTrainees}</p>
        </div>
        <div className="border p-4 rounded">
          <p className="text-sm text-gray-600">Pending to Grade</p>
          <p className="text-2xl font-bold">{data.pendingToGrade}</p>
        </div>
      </div>
    </main>
  );
}
