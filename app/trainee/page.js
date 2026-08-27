"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TraineeDashboardPage() {
  const { getToken, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;

      const [dashRes, enrollmentsRes] = await Promise.all([
        apiFetch("/dashboard/trainee"),
        apiFetch("/me/enrollments?status=ACTIVE"),
      ]);

      setDashboardData(dashRes.data || dashRes);
      setEnrollments(enrollmentsRes.data || enrollmentsRes || []);
    } catch (e) {
      console.error("Error loading trainee dashboard:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 w-full bg-muted rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="card-shell h-52" />
              ))}
            </div>
          </div>
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in stagger-1">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="page-subtitle">
          Expand your scientific skills, complete assessments, and track your verified professional certifications for the Ministry of Earth Sciences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enrolled Courses Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-semibold text-base text-foreground">
              My Classes
            </h2>
            <Link href="/courses" className="text-sm font-medium text-primary hover:text-primary-hover">
              Browse All
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="empty-state bg-card border border-border rounded-xl p-10">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="empty-state-title">No Enrolled Courses</p>
              <p className="empty-state-desc">You haven&apos;t enrolled in any capacity building programs yet.</p>
              <Link href="/courses" className="btn-primary mt-4">
                Explore Available Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                return (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${course.id}`}
                    className="group card card-interactive flex flex-col overflow-hidden"
                  >
                    {/* Neutral consistent card header */}
                    <div className="bg-muted border-b border-border px-4 py-3 shrink-0">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground truncate">
                        {course.subject?.name || "LMS Subject"}
                      </p>
                      <h3 className="font-semibold text-sm text-foreground leading-tight mt-0.5 line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    {/* Card body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground truncate">
                          Trainer: {course.trainer?.name || "Unassigned"}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-2">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                        <span className="badge-success">Enrolled</span>
                        <span className="text-xs text-primary font-medium">
                          Go to Class
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Info Section */}
        <div className="space-y-5">
          {/* Profile Panel */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-foreground">
              Professional Profile
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Add your qualifications, work experience, and certifications to help MoES match you to optimal competencies.
            </p>
            <div className="mt-4">
              <Link href="/trainee/profile" className="btn-secondary btn-sm w-full block text-center">
                Configure Profile
              </Link>
            </div>
          </div>

          {/* Todo / Pending Assessments */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground">To Do</h3>
              {dashboardData?.pendingAssessments > 0 && (
                <span className="badge-warning">{dashboardData.pendingAssessments}</span>
              )}
            </div>

            {dashboardData?.pendingAssessments > 0 ? (
              <div className="space-y-2">
                <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Pending Quizzes</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Due soon</p>
                </div>
                <Link href="/courses" className="text-xs font-medium text-primary hover:text-primary-hover block text-center mt-2">
                  View assessments in classwork
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/30 border border-dashed border-border rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">All caught up!</p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">No assignments due.</p>
              </div>
            )}
          </div>

          {/* Recent Scores */}
          {dashboardData?.recentResults?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">
                Recent Scores
              </h3>
              <div className="space-y-3">
                {dashboardData.recentResults.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center text-xs">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{sub.assessment?.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="badge-success font-mono font-bold">
                      {sub.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
