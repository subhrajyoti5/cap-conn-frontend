"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

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
      <div className="space-y-6 animate-in">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-6 skeleton h-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-6 skeleton h-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: data.totalUsers, icon: "👥", href: "/admin/users" },
    { label: "Active Courses", value: data.courses, icon: "📚", href: "/admin/courses" },
    { label: "Pending Users", value: data.pendingApprovals, icon: "⏳", href: "/admin/users/pending" },
    { label: "Active Enrollments", value: data.activeEnrollments, icon: "📝", href: "/admin/enrollments" },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Quick overview of your system.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-shell hover:shadow-lg transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="card p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <Image 
                    src="/trainer/Artboard 1.png" 
                    alt="Icon" 
                    width={48} 
                    height={48} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data.recentPendingUsers?.length > 0 && (
        <section className="card-shell">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Recent Pending Users</h2>
            <div className="space-y-3">
              {data.recentPendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="badge badge-warning text-xs capitalize">{user.role.toLowerCase()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/users/pending" className="text-primary hover:underline">
                View all pending users
              </Link>
            </div>
          </div>
        </section>
      )}

      {data.recentCourses?.length > 0 && (
        <section className="card-shell">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Recent Courses</h2>
            <div className="space-y-3">
              {data.recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="badge badge-neutral text-xs capitalize">{course.status?.toLowerCase() || "draft"}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/courses" className="text-primary hover:underline">
                View all courses
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
