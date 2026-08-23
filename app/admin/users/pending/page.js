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
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-surface-alt rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-20" />
        ))}
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
          <p className="empty-state-title">No pending users</p>
          <p className="empty-state-desc">All user registrations have been reviewed.</p>
        </div>
      ) : (
        <ul className="data-list">
          {users.map((u) => (
            <li key={u.id} className="data-row">
              <div className="min-w-0">
                <p className="font-medium text-sm text-ink">{u.name || u.email}</p>
                <p className="text-sm text-muted">{u.email}</p>
                <span className="badge badge-info mt-1">{u.role?.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(u.id)}
                  disabled={actionId === u.id}
                  className="btn-success text-sm"
                >
                  {actionId === u.id ? "..." : "Approve"}
                </button>
                <button
                  onClick={() => handleReject(u.id)}
                  disabled={actionId === u.id}
                  className="btn-danger text-sm"
                >
                  {actionId === u.id ? "..." : "Reject"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
