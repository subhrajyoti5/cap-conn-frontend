"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TrainerDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await apiFetch("/dashboard/trainer", {
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
    { label: "Courses", value: data.courses, icon: "📚", color: "text-primary" },
    { label: "Total Trainees", value: data.totalTrainees, icon: "👥", color: "text-success" },
    { label: "Pending to Grade", value: data.pendingToGrade, icon: "📝", color: "text-warning" },
  ];

  const myCourses = data.myCourses || [];
  const pendingSubmissions = data.pendingSubmissions || [];

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your teaching activities.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/courses" className="btn-secondary">My Courses</Link>
          <Link href="/courses/create" className="btn-primary">Create Course</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="list" aria-label="Teaching statistics">
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
        <section className="card-shell" aria-labelledby="my-courses-heading">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="my-courses-heading" className="font-body text-lg font-semibold text-foreground">
                My Courses
              </h2>
              {myCourses.length > 0 && (
                <Link href="/courses" className="text-sm text-primary hover:underline">View all</Link>
              )}
            </div>
            {myCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No courses created yet</p>
                <Link href="/courses/create" className="btn-primary text-sm">Create Your First Course</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myCourses.slice(0, 3).map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent font-medium">{course.title?.charAt(0) || "C"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-accent">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.enrollmentCount || 0} trainees enrolled</p>
                    </div>
                    <span className={course.published ? "badge badge-success text-xs" : "badge badge-warning text-xs"}>
                      {course.published ? "Published" : "Draft"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card-shell" aria-labelledby="pending-grading-heading">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="pending-grading-heading" className="font-body text-lg font-semibold text-foreground">
                Pending to Grade
              </h2>
              {pendingSubmissions.length > 0 && (
                <Link href="/submissions" className="text-sm text-primary hover:underline">View all</Link>
              )}
            </div>
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nothing to grade right now</p>
                <span className="badge badge-success text-sm">All caught up!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.slice(0, 3).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{submission.assessment?.title || "Assessment"}</p>
                        <p className="text-sm text-muted-foreground">{submission.trainee?.name || "Trainee"} · {submission.course?.title || "Course"}</p>
                      </div>
                    </div>
                    <Link href={`/submissions/${submission.id}`} className="btn-primary text-sm">Grade</Link>
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