"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TraineeDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await apiFetch("/dashboard/trainee", {
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-5 skeleton h-24" />
            </div>
          ))}
        </div>
        <div className="skeleton h-6 w-32" />
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
    { label: "Active Courses", value: data.activeCourses, icon: "📚", color: "text-primary" },
    { label: "Pending Assessments", value: data.pendingAssessments, icon: "📝", color: "text-warning" },
    { label: "Completed", value: data.completedAssessments, icon: "✅", color: "text-success" },
  ];

  const recentCourses = data.recentCourses || [];
  const upcomingAssessments = data.upcomingAssessments || [];

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your learning progress.</p>
        </div>
        <Link href="/courses" className="btn-primary">
          Browse Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="list" aria-label="Learning statistics">
        {stats.map((stat, index) => (
          <div key={stat.label} className="card-shell" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value font-display">{stat.value}</p>
                </div>
                <span className={`text-3xl ${stat.color}`} aria-hidden="true">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card-shell" aria-labelledby="recent-courses-heading">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-courses-heading" className="font-body text-lg font-semibold text-foreground">
                Recent Courses
              </h2>
              {recentCourses.length > 0 && (
                <Link href="/courses" className="text-sm text-primary hover:underline">View all</Link>
              )}
            </div>
            {recentCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No courses yet</p>
                <Link href="/courses" className="btn-primary text-sm">Explore Courses</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCourses.slice(0, 3).map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-medium">{course.title?.charAt(0) || "C"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.subject?.name || "General"}</p>
                    </div>
                    <span className="badge badge-info text-xs">Continue</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card-shell" aria-labelledby="upcoming-assessments-heading">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="upcoming-assessments-heading" className="font-body text-lg font-semibold text-foreground">
                Upcoming Assessments
              </h2>
              {upcomingAssessments.length > 0 && (
                <Link href="/assessments" className="text-sm text-primary hover:underline">View all</Link>
              )}
            </div>
            {upcomingAssessments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming assessments</p>
                <span className="badge badge-success text-sm">All caught up!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAssessments.slice(0, 3).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{assessment.title}</p>
                        <p className="text-sm text-muted-foreground">{assessment.course?.title || "Course"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-warning">Due: {new Date(assessment.dueDate).toLocaleDateString()}</p>
                      <Link href={`/assessments/${assessment.id}`} className="btn-tertiary-sm text-xs mt-1">Start</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}