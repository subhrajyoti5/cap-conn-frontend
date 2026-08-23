"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function PendingUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;
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
    const token = await getToken();
    if (!token) return;
    setActionId(id);
    try {
      await apiFetch(`/users/${id}/approve`, { method: "POST" });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id) {
    const token = await getToken();
    if (!token) return;
    setActionId(id);
    try {
      await apiFetch(`/users/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "" }),
      });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="card-shell">
          <div className="card p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pending Approvals</h1>
        <p className="page-subtitle">Review and approve new user registrations</p>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="empty-state-title">No pending users</p>
          <p className="empty-state-desc">All user registrations have been reviewed.</p>
        </div>
      ) : (
        <ul className="data-list">
          {users.map((u) => (
            <li key={u.id} className="data-row">
              <div className="min-w-0 flex items-center gap-3">
                <div className="avatar-md bg-primary-100 text-primary">
                  {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-ink truncate">{u.name || u.email}</p>
                  <p className="text-sm text-muted truncate">{u.email}</p>
                  <span className="badge badge-info mt-1">{u.role?.toLowerCase()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(u.id)}
                  disabled={actionId === u.id}
                  className="btn px-3 py-1.5 text-xs rounded-button bg-green-700 text-white hover:bg-green-800 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all duration-fast"
                >
                  {actionId === u.id ? "Approving..." : "Approve"}
                </button>
                <button
                  onClick={() => handleReject(u.id)}
                  disabled={actionId === u.id}
                  className="btn px-3 py-1.5 text-xs rounded-button bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all duration-fast"
                >
                  {actionId === u.id ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}