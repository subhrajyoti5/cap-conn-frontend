"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await apiFetch("/dashboard/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in stagger-1">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-5 skeleton h-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-5 skeleton h-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: data.totalUsers, icon: "👥", color: "text-primary", href: "/admin/users" },
    { label: "Active Courses", value: data.activeCourses, icon: "📚", color: "text-success", href: "/admin/courses" },
    { label: "Pending Approvals", value: data.pendingApprovals, icon: "⏳", color: "text-warning", href: "/admin/users/pending" },
    { label: "Total Revenue", value: data.totalRevenue ? `$${data.totalRevenue.toLocaleString()}` : "$0", icon: "💰", color: "text-accent", href: "/admin/revenue" },
  ];

  const recentUsers = data.recentUsers || [];
  const recentActivity = data.recentActivity || [];

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="System statistics">
        {stats.map((stat, index) => (
          <Link key={stat.label} href={stat.href} className="card-shell hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value font-display">{stat.value}</p>
                </div>
                <span className={`text-3xl ${stat.color}`} aria-hidden="true">{stat.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card-shell" aria-labelledby="recent-users-heading">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-users-heading" className="font-body text-lg font-semibold text-foreground">
                Recent Users
              </h2>
              <Link href="/admin/users" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            {recentUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium text-sm">{user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{user.name || "Unnamed"}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className={`badge text-xs ${
                        user.status === "APPROVED" ? "badge-success" :
                        user.status === "PENDING" ? "badge-warning" :
                        "badge-danger"
                      }`}>
                        {user.status}
                      </span>
                      <span className="badge badge-neutral text-xs capitalize">{user.role.toLowerCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card-shell" aria-labelledby="recent-activity-heading">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-activity-heading" className="font-body text-lg font-semibold text-foreground">
                Recent Activity
              </h2>
              <Link href="/admin/activity" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                    {activity.user && (
                      <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <Link href="/admin/users/pending" className="btn-secondary">Review Pending Users</Link>
        <Link href="/admin/courses" className="btn-tertiary">Manage Courses</Link>
        <Link href="/admin/subjects" className="btn-tertiary">Manage Subjects</Link>
        <Link href="/admin/notifications" className="btn-tertiary">Notifications</Link>
      </div>
    </div>
  );
}