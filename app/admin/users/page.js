"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function AllUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await apiFetch("/admin/users");
      setUsers(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleSuspend(user) {
    const token = await getToken();
    if (!token) return;
    setActionId(user.id);
    try {
      if (user.status === "SUSPENDED") {
        // Unsuspend = Approve
        await apiFetch(`/admin/users/${user.id}/approve`, { method: "PATCH" });
      } else {
        // Suspend
        await apiFetch(`/admin/users/${user.id}/suspend`, { method: "PATCH" });
      }
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  async function handleRoleChange(id, newRole) {
    const token = await getToken();
    if (!token) return;
    setActionId(id);
    try {
      await apiFetch(`/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <span className="badge badge-success text-xs">Approved</span>;
      case "PENDING":
        return <span className="badge badge-warning text-xs">Pending Approval</span>;
      case "SUSPENDED":
        return <span className="badge badge-danger text-xs">Suspended</span>;
      case "REJECTED":
        return <span className="badge badge-neutral text-xs">Rejected</span>;
      default:
        return <span className="badge badge-neutral text-xs">{status.toLowerCase()}</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-8 w-48" />
        <div className="card-shell">
          <div className="card p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">All Users</h1>
        <p className="page-subtitle">Manage system users, adjust roles, and control account status.</p>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="empty-state-title">No users registered</p>
          <p className="empty-state-desc">There are no user accounts found in the database.</p>
        </div>
      ) : (
        <div className="card-shell">
          <div className="card overflow-hidden">
            <ul className="divide-y divide-border">
              {users.map((u) => (
                <li key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="avatar-md bg-primary/10 text-primary font-semibold flex-shrink-0">
                      {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{u.name || "No name profile"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(u.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {/* Role selector */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-muted-foreground font-medium hidden md:inline">Role:</label>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={actionId === u.id || u.status === "PENDING" || u.status === "REJECTED"}
                        className="select py-1 px-3 text-xs w-32 border border-border rounded-lg bg-card focus:outline-none"
                      >
                        <option value="TRAINEE">Trainee</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    {/* Suspend / Unsuspend button */}
                    <button
                      onClick={() => handleToggleSuspend(u)}
                      disabled={actionId === u.id || u.status === "PENDING" || u.status === "REJECTED"}
                      className={`btn-sm px-4 ${
                        u.status === "SUSPENDED" 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" 
                          : "btn-danger"
                      }`}
                    >
                      {actionId === u.id 
                        ? "..." 
                        : u.status === "SUSPENDED" 
                          ? "Unsuspend" 
                          : "Suspend"
                      }
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
