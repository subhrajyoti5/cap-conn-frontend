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
      const res = await apiFetch("/dashboard/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    }
    load();
  }, [getToken]);

  if (!data) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border p-4 rounded">
            <p className="text-sm text-gray-600 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
