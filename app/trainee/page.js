"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import {
  BookOpen,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  FileText,
  ChevronRight,
  Shield,
} from "lucide-react";

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
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-44 w-full bg-muted/50 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-6 w-44 bg-muted/60 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="h-60 bg-muted/40 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-muted/40 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeCount = enrollments.length;
  const pendingAssessmentsCount = dashboardData?.pendingAssessments || 0;
  const enrolledCourses = enrollments.map((e) => e.course || e).filter(Boolean);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in stagger-1">
      {/* Trainee Solid Green Theme Header */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
              Trainee Workspace
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.name || "Participant"}
            </h1>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center min-w-[100px]">
              <span className="text-xl font-bold font-display text-white block">
                {activeCount}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Enrolled Classes
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center min-w-[100px]">
              <span className="text-xl font-bold font-display text-amber-400 block">
                {pendingAssessmentsCount}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Pending Tasks
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enrolled Courses Main Grid */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>My Active Classes</span>
            </h2>
            <Link
              href="/courses"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore All Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-card border border-border/80 rounded-2xl p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-bold text-sm text-foreground font-display">No Enrolled Courses</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You are not enrolled in any training programs yet. Explore the catalog to enroll in courses.
                </p>
              </div>
              <Link href="/courses" className="btn-primary text-xs py-2 px-4 shadow-xs inline-flex items-center gap-2">
                <span>Browse Course Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course, idx) => {
                const DOMAIN_COLOR_THEMES = [
                  { bg: "bg-emerald-950 border-b border-emerald-900", badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
                  { bg: "bg-blue-950 border-b border-blue-900", badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
                  { bg: "bg-indigo-950 border-b border-indigo-900", badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
                  { bg: "bg-amber-950 border-b border-amber-900", badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
                  { bg: "bg-rose-950 border-b border-rose-900", badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
                  { bg: "bg-teal-950 border-b border-teal-900", badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
                  { bg: "bg-slate-900 border-b border-slate-800", badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
                ];
                const theme = DOMAIN_COLOR_THEMES[idx % DOMAIN_COLOR_THEMES.length];

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col justify-between h-[260px]"
                  >
                    {/* Header Banner */}
                    <div className={`p-5 ${theme.bg} min-h-[105px] flex flex-col justify-between shrink-0 text-white`}>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Enrolled</span>
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-white line-clamp-2 leading-snug mt-3">
                        {course.title}
                      </h3>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-card text-foreground">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {course.description || "Comprehensive scientific training curriculum."}
                      </p>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-500/20">
                            {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "T"}
                          </div>
                          <span className="truncate text-xs font-medium text-foreground">{course.trainer?.name || "Trainer"}</span>
                        </div>

                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Enter Course</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
          {/* Professional Profile Widget */}
          <div className="bg-card border border-border/80 p-5 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Professional Profile</span>
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keep your qualifications, skills, and work experience up to date for domain matching.
            </p>
            <Link
              href="/trainee/profile"
              className="btn-secondary w-full text-xs py-2 font-medium flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Configure Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Pending Tasks Widget */}
          <div className="bg-card border border-border/80 p-5 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
              <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Action Items</span>
              </h3>
              {pendingAssessmentsCount > 0 && (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                  {pendingAssessmentsCount} Due
                </span>
              )}
            </div>

            {pendingAssessmentsCount > 0 ? (
              <div className="space-y-2">
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                  <p className="text-xs font-semibold text-foreground">Pending Assessment Submissions</p>
                  <p className="text-[11px] text-muted-foreground">Course assessments awaiting your completion.</p>
                </div>
                <Link
                  href="/courses"
                  className="text-xs font-semibold text-primary hover:underline block text-center pt-1"
                >
                  View pending classwork &rarr;
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/20 border border-dashed border-border/80 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">All caught up!</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">No pending quizzes or assignments.</p>
              </div>
            )}
          </div>

          {/* Recent Scores */}
          {dashboardData?.recentResults?.length > 0 && (
            <div className="bg-card border border-border/80 p-5 rounded-2xl space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" />
                <span>Recent Scorecard</span>
              </h3>
              <div className="space-y-2.5 divide-y divide-border/50">
                {dashboardData.recentResults.map((sub) => (
                  <div key={sub.id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{sub.assessment?.title}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs px-2 py-0.5">
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