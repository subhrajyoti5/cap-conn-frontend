"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function PendingUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await apiFetch("/users/pending");
      setUsers(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id) {
    try {
      await apiFetch(`/users/${id}/approve`, { method: "POST" });
      load();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleReject(id) {
    try {
      await apiFetch(`/users/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "" }),
      });
      load();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Pending Approvals</h1>
      {users.length === 0 ? (
        <p className="text-muted">No pending users.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => (
            <li
              key={u.id}
              className="border border-border-warm p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{u.name || u.email}</p>
                <p className="text-sm text-muted">{u.email}</p>
                <p className="text-sm text-muted">Role: {u.role}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(u.id)}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(u.id)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
