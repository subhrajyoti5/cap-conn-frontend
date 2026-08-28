"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AllUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
        await apiFetch(`/admin/users/${user.id}/approve`, { method: "PATCH" });
      } else {
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

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = (u.name || "").toLowerCase().includes(query);
    const emailMatch = (u.email || "").toLowerCase().includes(query);
    const matchesSearch = !query || nameMatch || emailMatch;

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate Metrics
  const totalUsers = users.length;
  const traineesCount = users.filter((u) => u.role === "TRAINEE").length;
  const trainersCount = users.filter((u) => u.role === "TRAINER").length;
  const suspendedCount = users.filter((u) => u.status === "SUSPENDED").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Approved</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Pending</span>
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="badge bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold flex items-center gap-1">
            <UserX className="w-3 h-3 text-rose-500" />
            <span>Suspended</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="badge bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-[10px] font-semibold">
            Rejected
          </span>
        );
      default:
        return (
          <span className="badge bg-muted text-muted-foreground text-[10px] font-semibold">
            {status?.toLowerCase()}
          </span>
        );
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="badge bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] font-semibold">
            Admin
          </span>
        );
      case "TRAINER":
        return (
          <span className="badge bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px] font-semibold">
            Trainer
          </span>
        );
      case "TRAINEE":
        return (
          <span className="badge bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-semibold">
            Trainee
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-6xl">
        <div className="h-32 w-full bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-64 w-full bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-200">
      {/* Dark Hero Section Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
              User Directory Management
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              All Users & Access Control
            </h1>
            <p className="text-xs text-slate-400">
              Manage system accounts, assign user roles, and monitor account active states.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setLoading(true);
                load();
              }}
              className="bg-white/10 hover:bg-white/20 text-white hover:text-white border border-white/20 text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-medium transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
              <span className="text-white hover:text-white">Refresh Data</span>
            </button>
            <Link
              href="/admin"
              className="bg-white/10 hover:bg-white/20 text-white hover:text-white border border-white/20 text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-medium transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" />
              <span className="text-white hover:text-white">Admin Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Total Users</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{totalUsers}</p>
          <p className="text-[11px] text-muted-foreground">Registered in platform</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Active Trainees</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{traineesCount}</p>
          <p className="text-[11px] text-muted-foreground">Enrolled trainees</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Trainers</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{trainersCount}</p>
          <p className="text-[11px] text-muted-foreground">Instructors & trainers</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Suspended</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-display font-bold text-rose-600 dark:text-rose-400">{suspendedCount}</p>
          <p className="text-[11px] text-muted-foreground">Restricted accounts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email address..."
            className="input text-xs pl-9 pr-4 py-2 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="select py-1.5 pl-3 pr-8 text-xs border border-border rounded-lg bg-card text-foreground cursor-pointer font-medium"
            >
              <option value="ALL">All Roles</option>
              <option value="TRAINEE">Trainees</option>
              <option value="TRAINER">Trainers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select py-1.5 pl-3 pr-8 text-xs border border-border rounded-lg bg-card text-foreground cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List Container */}
      {filteredUsers.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted/40 text-muted-foreground flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-sm text-foreground">No matching users found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL"
              ? "Try adjusting your search query or filter criteria."
              : "There are no registered accounts in the system yet."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-border">
            {filteredUsers.map((u) => {
              const isActioning = actionId === u.id;
              const isSuspended = u.status === "SUSPENDED";
              const isPending = u.status === "PENDING";
              const isRejected = u.status === "REJECTED";

              return (
                <div
                  key={u.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                >
                  {/* User Profile Summary */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0 border border-slate-700 shadow-xs">
                      {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {u.name || "Unnamed User"}
                        </h4>
                        {getRoleBadge(u.role)}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span>{u.email}</span>
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        {getStatusBadge(u.status)}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Role Select */}
                  <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-semibold">Role:</span>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={isActioning || isPending || isRejected}
                        className="select py-1 pl-3 pr-8 text-xs border border-border rounded-lg bg-card text-foreground cursor-pointer font-medium focus:ring-1 focus:ring-primary min-w-[110px]"
                      >
                        <option value="TRAINEE">Trainee</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleToggleSuspend(u)}
                      disabled={isActioning || isPending || isRejected}
                      className={`btn-sm text-xs py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                        isSuspended
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {isActioning ? (
                        <span className="text-[11px]">Updating...</span>
                      ) : isSuspended ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Restore Access</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
