"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import {
  Clock,
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function PendingUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectingUser, setRejectingUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await apiFetch("/admin/users/pending");
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

  async function handleApprove(id) {
    const token = await getToken();
    if (!token) return;
    setActionId(id);
    try {
      await apiFetch(`/admin/users/${id}/approve`, { method: "PATCH" });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  async function handleConfirmReject() {
    if (!rejectingUser) return;
    const token = await getToken();
    if (!token) return;
    setActionId(rejectingUser.id);
    try {
      await apiFetch(`/admin/users/${rejectingUser.id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRejectingUser(null);
      setRejectReason("");
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      !query ||
      (u.name || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl">
        <div className="h-32 w-full bg-muted rounded-2xl" />
        <div className="h-40 w-full bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-200">
      {/* Dark Hero Section Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
              Pending Queue ({users.length})
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pending Registration Approvals
            </h1>
            <p className="text-xs text-slate-400">
              Review and grant access to newly registered trainees and trainers on the platform.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setLoading(true);
                load();
              }}
              className="btn-secondary bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs py-2 px-3.5 flex items-center gap-1.5 font-medium shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
            <Link
              href="/admin"
              className="btn-secondary bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs py-2 px-3.5 flex items-center gap-1.5 font-medium shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {users.length > 0 && (
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter pending users by name or email..."
              className="input text-xs pl-9 pr-4 py-2 w-full"
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono font-medium">
            Showing {filteredUsers.length} of {users.length} pending
          </span>
        </div>
      )}

      {/* Pending Queue List */}
      {users.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-foreground">No Pending Registrations</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              All user registration requests have been reviewed and processed.
            </p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
          <Clock className="w-8 h-8 mx-auto text-muted-foreground opacity-60" />
          <h3 className="font-display font-bold text-sm text-foreground">No matching pending requests</h3>
          <p className="text-xs text-muted-foreground">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((u) => {
            const isActioning = actionId === u.id;
            return (
              <div
                key={u.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-indigo-300 font-bold text-base flex items-center justify-center shrink-0 border border-slate-700 shadow-xs">
                    {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-foreground truncate">
                        {u.name || "Unnamed Registrant"}
                      </h4>
                      <span className="badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full">
                        Requested Role: {u.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{u.email}</span>
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Registered: {new Date(u.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <button
                    onClick={() => setRejectingUser(u)}
                    disabled={isActioning}
                    className="btn-secondary text-xs py-2 px-4 rounded-xl text-rose-600 hover:bg-rose-500/10 border-rose-500/20 font-semibold flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(u.id)}
                    disabled={isActioning}
                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 rounded-xl font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    {isActioning ? (
                      <span>Approving...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-display font-bold text-sm text-foreground text-rose-600">Reject Registration Request</h3>
              <button
                onClick={() => {
                  setRejectingUser(null);
                  setRejectReason("");
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-muted-foreground leading-normal">
                Are you sure you want to reject the registration request for <strong className="text-foreground">{rejectingUser.name || rejectingUser.email}</strong>?
              </p>
              <div className="flex flex-col gap-1 text-left w-full">
                <label htmlFor="rejectReason" className="label text-xs font-semibold">Reason (Optional)</label>
                <textarea
                  id="rejectReason"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  className="input text-xs w-full py-2 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingUser(null);
                    setRejectReason("");
                  }}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={actionId === rejectingUser.id}
                  className="btn-primary bg-rose-600 hover:bg-rose-700 text-white text-xs py-1.5 px-4 font-semibold"
                >
                  {actionId === rejectingUser.id ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}