"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  async function load() {
    try {
      const res = await apiFetch("/dashboard/admin");
      setData(res.data || res);
    } catch (e) {
      console.error("Error loading admin dashboard:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleQuickApprove(userId) {
    setActionId(userId);
    try {
      await apiFetch(`/admin/users/${userId}/approve`, {
        method: "PATCH",
      });
      await load();
    } catch (e) {
      console.error("Failed to approve user:", e);
      alert("Error approving user");
    } finally {
      setActionId(null);
    }
  }

  async function handleQuickReject(userId) {
    if (!confirm("Are you sure you want to reject this registration?")) return;
    setActionId(userId);
    try {
      await apiFetch(`/admin/users/${userId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason: "Rejected from quick-action dashboard" }),
      });
      await load();
    } catch (e) {
      console.error("Failed to reject user:", e);
      alert("Error rejecting user");
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-44 w-full bg-muted rounded-2xl" />

        {/* Content Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in stagger-1">
      {/* Slate Admin Banner (Polished: no MoES reference) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-indigo-950 text-white p-8 shadow-lg shadow-indigo-950/10">
        <div className="relative z-10 max-w-2xl">
          <span className="badge bg-white/10 text-white border-transparent text-xs font-mono uppercase tracking-wider">
            Administration Portal
          </span>
          <h1 className="font-display text-display-lg text-white mt-3 leading-tight">
            System Administration Center
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Monitor system performance, coordinate user roles, and manage course offerings across the training platforms.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16" />
      </div>

      {/* Split Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Integrated Control Panel & Feeds */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions & Stats Integrated Control Grid */}
          <div className="card border border-border p-6 bg-card">
            <h2 className="font-display text-sm font-bold text-foreground mb-4">
              System Admin Controls
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/admin/users"
                className="p-5 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all text-left flex justify-between items-center group"
              >
                <div className="space-y-1.5">
                  <span className="text-2xl">👥</span>
                  <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">Manage Accounts</p>
                  <p className="text-[10px] text-muted-foreground leading-normal">Edit user roles and suspend status.</p>
                </div>
                <div className="bg-primary/5 text-primary text-xl font-bold p-3 rounded-lg min-w-[3.5rem] text-center font-mono">
                  {data?.totalUsers || 0}
                </div>
              </Link>
              
              <Link
                href="/admin/courses"
                className="p-5 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all text-left flex justify-between items-center group"
              >
                <div className="space-y-1.5">
                  <span className="text-2xl">📚</span>
                  <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">Course Listing</p>
                  <p className="text-[10px] text-muted-foreground leading-normal">Supervise course statuses.</p>
                </div>
                <div className="bg-emerald-500/5 text-emerald-600 text-xl font-bold p-3 rounded-lg min-w-[3.5rem] text-center font-mono">
                  {data?.courses || 0}
                </div>
              </Link>
              
              <Link
                href="/admin/users/pending"
                className="p-5 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all text-left flex justify-between items-center group"
              >
                <div className="space-y-1.5">
                  <span className="text-2xl">⏳</span>
                  <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">Awaiting Approval</p>
                  <p className="text-[10px] text-muted-foreground leading-normal">Inspect pending registration queue.</p>
                </div>
                <div className="bg-amber-500/5 text-amber-600 text-xl font-bold p-3 rounded-lg min-w-[3.5rem] text-center font-mono">
                  {data?.pendingApprovals || 0}
                </div>
              </Link>
              
              <Link
                href="/admin/subjects"
                className="p-5 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all text-left flex justify-between items-center group"
              >
                <div className="space-y-1.5">
                  <span className="text-2xl">🏷️</span>
                  <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">Manage Subjects</p>
                  <p className="text-[10px] text-muted-foreground leading-normal">Configure topics and competency maps.</p>
                </div>
                <div className="bg-indigo-500/5 text-indigo-600 text-xl font-bold p-3 rounded-lg min-w-[3.5rem] text-center font-mono">
                  ★
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Courses Feed */}
          <div className="card border border-border p-6 bg-card space-y-4">
            <h2 className="font-display text-sm font-bold text-foreground">
              Recent Course Creations
            </h2>
            {data?.recentCourses?.length > 0 ? (
              <div className="divide-y divide-border">
                {data.recentCourses.map((course) => (
                  <div key={course.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{course.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Subject: {course.subject?.name || "General"} | Trainer: {course.trainer?.name || "Unassigned"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`badge text-[9px] uppercase font-bold tracking-wider ${course.status === "PUBLISHED" ? "badge-success" : "badge-neutral"}`}>
                        {course.status?.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                No courses created recently.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Approvals Sidebar Queue */}
        <div className="space-y-6">
          <div className="card border border-border p-6 bg-card space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="font-display text-sm font-bold text-foreground">
                Approval Queue
              </h2>
              <span className="badge badge-warning text-xs font-semibold">
                {data?.pendingApprovals || 0} Awaiting
              </span>
            </div>

            {data?.recentPendingUsers?.length > 0 ? (
              <div className="space-y-4">
                {data.recentPendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="p-3.5 rounded-xl border border-border bg-card space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-xs text-foreground truncate">{pendingUser.name}</p>
                        <span className="badge badge-neutral text-[9px] uppercase font-bold tracking-wider shrink-0">
                          {pendingUser.role?.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{pendingUser.email}</p>
                    </div>

                    {/* Inline Quick Action Controls */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleQuickApprove(pendingUser.id)}
                        disabled={actionId === pendingUser.id}
                        className="flex-1 btn-success py-1.5 px-2.5 text-[10px] font-semibold flex items-center justify-center gap-1 rounded-lg"
                      >
                        {actionId === pendingUser.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleQuickReject(pendingUser.id)}
                        disabled={actionId === pendingUser.id}
                        className="flex-1 btn-danger py-1.5 px-2.5 text-[10px] font-semibold flex items-center justify-center gap-1 rounded-lg"
                      >
                        {actionId === pendingUser.id ? "..." : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}

                <Link
                  href="/admin/users/pending"
                  className="text-xs font-semibold text-primary hover:underline block text-center mt-2"
                >
                  View All Pending Requests &rarr;
                </Link>
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/20 border border-dashed border-border rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">Queue is clear!</p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">No pending user registrations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
