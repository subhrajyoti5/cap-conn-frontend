"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Clock,
  Tag,
  Shield,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Layers,
} from "lucide-react";

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
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-44 w-full bg-muted/50 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-muted/40 rounded-2xl" />
            <div className="h-48 bg-muted/40 rounded-2xl" />
          </div>
          <div className="h-96 bg-muted/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const adminControls = [
    {
      title: "Manage Accounts",
      description: "Manage user roles and authorization statuses.",
      href: "/admin/users",
      icon: Users,
      count: data?.totalUsers || 0,
      badgeColor: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "Course Catalog",
      description: "Supervise course status and subject distribution.",
      href: "/admin/courses",
      icon: BookOpen,
      count: data?.courses || 0,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Registration Queue",
      description: "Inspect pending participant registration requests.",
      href: "/admin/users/pending",
      icon: Clock,
      count: data?.pendingApprovals || 0,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      title: "Manage Subjects",
      description: "Configure subjects and domain competency maps.",
      href: "/admin/subjects",
      icon: Tag,
      count: "active",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in stagger-1">
      {/* Sleek Enterprise Admin Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 space-y-1">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
            System Administration
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Admin Workspace
          </h1>
        </div>
      </div>

      {/* Split Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Control Panel & Recent Feeds */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Control Grid */}
          <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
            <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>System Operations & Management</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminControls.map((ctrl) => {
                const IconComp = ctrl.icon;
                return (
                  <Link
                    key={ctrl.title}
                    href={ctrl.href}
                    className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all text-left flex justify-between items-center group"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                          {ctrl.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {ctrl.description}
                      </p>
                    </div>

                    <div className={`badge ${ctrl.badgeColor} font-mono font-bold text-xs py-1.5 px-3 rounded-lg shrink-0`}>
                      {ctrl.count}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Courses Feed */}
          <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-border/70 pb-3">
              <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Recent Course Creations</span>
              </h2>
              <Link href="/admin/courses" className="text-xs font-semibold text-primary hover:underline">
                View All
              </Link>
            </div>

            {data?.recentCourses?.length > 0 ? (
              <div className="divide-y divide-border/60">
                {data.recentCourses.map((course) => (
                  <div key={course.id} className="py-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{course.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Subject: <strong className="text-foreground font-medium">{course.subject?.name || "General"}</strong> | Trainer: {course.trainer?.name || "Unassigned"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`badge text-[9px] uppercase font-bold tracking-wider ${
                        course.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {course.status?.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border/80 rounded-xl">
                No courses created recently.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Approvals Sidebar Queue */}
        <div className="space-y-6">
          <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-border/70 pb-3">
              <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Account Approvals</span>
              </h2>
              <span className="badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                {data?.pendingApprovals || 0} Pending
              </span>
            </div>

            {data?.recentPendingUsers?.length > 0 ? (
              <div className="space-y-3">
                {data.recentPendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2.5 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-xs text-foreground truncate">{pendingUser.name}</p>
                        <span className="badge bg-muted text-muted-foreground text-[8px] uppercase font-mono font-bold tracking-wider shrink-0">
                          {pendingUser.role?.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">{pendingUser.email}</p>
                    </div>

                    {/* Inline Quick Action Controls */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleQuickApprove(pendingUser.id)}
                        disabled={actionId === pendingUser.id}
                        className="flex-1 btn-primary py-1.5 px-2.5 text-[10px] font-semibold flex items-center justify-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{actionId === pendingUser.id ? "..." : "Approve"}</span>
                      </button>
                      <button
                        onClick={() => handleQuickReject(pendingUser.id)}
                        disabled={actionId === pendingUser.id}
                        className="flex-1 btn-secondary py-1.5 px-2.5 text-[10px] font-medium flex items-center justify-center gap-1 hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>{actionId === pendingUser.id ? "..." : "Reject"}</span>
                      </button>
                    </div>
                  </div>
                ))}

                <Link
                  href="/admin/users/pending"
                  className="text-xs font-semibold text-primary hover:underline block text-center pt-2"
                >
                  View complete registration queue &rarr;
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/20 border border-dashed border-border/80 rounded-xl space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                <p className="text-xs font-medium text-foreground">Queue is clear!</p>
                <p className="text-[10px] text-muted-foreground">No pending user registrations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
