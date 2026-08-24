"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

// Predefined premium color gradients for Google Classroom banners
const CARD_GRADIENTS = [
  "from-blue-600 to-indigo-700",
  "from-violet-600 to-purple-700",
  "from-emerald-600 to-teal-700",
  "from-rose-600 to-pink-700",
  "from-amber-600 to-orange-700",
];

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
        {/* Banner skeleton */}
        <div className="h-44 w-full bg-muted rounded-2xl" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="card-shell h-64" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in stagger-1">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-800 text-white p-8 shadow-lg shadow-primary/10">
        <div className="relative z-10 max-w-2xl">
          <span className="badge bg-white/20 text-white border-transparent text-xs font-mono uppercase tracking-wider">
            Trainee Portal
          </span>
          <h1 className="font-display text-display-lg text-white mt-3 leading-tight">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-white/80 text-sm mt-2 leading-relaxed">
            Expand your scientific skills, complete assessments, and track your verified professional certifications for the Ministry of Earth Sciences.
          </p>
        </div>
        
        {/* Decorative glass elements */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16" />
        <div className="absolute left-1/3 top-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enrolled Courses Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-lg font-bold text-foreground">
              My Classes
            </h2>
            <Link href="/courses" className="text-sm font-semibold text-primary hover:underline">
              Browse All Courses
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="empty-state bg-card border border-border rounded-2xl p-10">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="empty-state-title">No Enrolled Courses</p>
              <p className="empty-state-desc">You haven&apos;t enrolled in any capacity building programs yet.</p>
              <Link href="/courses" className="btn-primary mt-4">
                Explore Available Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enrollment, index) => {
                const course = enrollment.course;
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                return (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${course.id}`}
                    className="group card-shell flex flex-col justify-between overflow-hidden h-64 hover:shadow-elevated transition-all duration-300"
                  >
                    <div className="card h-full flex flex-col justify-between border border-border">
                      {/* Course Card Banner (Google Classroom style) */}
                      <div className={`bg-gradient-to-br ${gradient} p-4 text-white relative shrink-0`}>
                        <div className="relative z-10">
                          <p className="text-[10px] uppercase font-mono tracking-wider opacity-90 truncate">
                            {course.subject?.name || "LMS Subject"}
                          </p>
                          <h3 className="font-display text-base font-bold leading-tight mt-1 line-clamp-2 group-hover:underline">
                            {course.title}
                          </h3>
                          <p className="text-xs opacity-75 mt-3 truncate">
                            Trainer: {course.trainer?.name || "Unassigned"}
                          </p>
                        </div>
                        {/* Semi-transparent banner circle accents */}
                        <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                      </div>

                      {/* Course Details (Trainee specifics) */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                          <span className="badge badge-success text-[10px]">
                            Enrolled
                          </span>
                          <span className="text-xs text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Go to Class
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Info Section */}
        <div className="space-y-6">
          {/* Profile Completion Panel */}
          <div className="card border border-border p-5 bg-card">
            <h3 className="font-semibold text-sm text-foreground">
              Professional Profile
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Add your qualifications, work experience, and certifications to help MoES match you to optimal competencies.
            </p>
            <div className="mt-4">
              <Link href="/trainee/profile" className="btn-secondary btn-sm w-full block text-center">
                Configure Profile
              </Link>
            </div>
          </div>

          {/* Todo Tasks / Deadlines Panel */}
          <div className="card border border-border p-5 bg-card">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
              Todo List
            </h3>
            
            {dashboardData?.pendingAssessments > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="p-3 bg-accent/5 border border-accent/10 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Pending Quizzes</p>
                    <p className="text-[10px] text-muted-foreground">Due soon</p>
                  </div>
                  <span className="badge badge-accent text-xs">
                    {dashboardData.pendingAssessments}
                  </span>
                </div>
                <Link href="/courses" className="text-xs font-medium text-primary hover:underline block text-center mt-2">
                  View assessments in classwork
                </Link>
              </div>
            ) : (
              <div className="mt-4 text-center py-4 bg-muted/20 border border-dashed border-border rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">Woohoo, no work due!</p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">All assignments completed.</p>
              </div>
            )}
          </div>

          {/* Graded Performance Stats */}
          {dashboardData?.recentResults?.length > 0 && (
            <div className="card border border-border p-5 bg-card">
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
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
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