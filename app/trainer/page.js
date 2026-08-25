"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

const CARD_GRADIENTS = [
  "from-teal-600 to-emerald-700",
  "from-cyan-600 to-blue-700",
  "from-violet-600 to-indigo-700",
  "from-amber-600 to-orange-700",
];

export default function TrainerDashboardPage() {
  const { getToken, user } = useAuth();
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;

      const [dashRes, coursesRes, profileRes, invitesRes] = await Promise.all([
        apiFetch("/dashboard/trainer"),
        apiFetch("/courses"),
        apiFetch("/profiles/me"),
        apiFetch("/courses/invitations/pending"),
      ]);

      setData(dashRes.data || dashRes);
      setProfile(profileRes.data || null);
      setInvitations(invitesRes.data || []);
      
      const allCourses = coursesRes.data || coursesRes || [];
      const trainerCourses = allCourses.filter((c) => 
        c.trainerId === user?.id || 
        (c.trainers && c.trainers.some((ct) => ct.trainerId === user?.id))
      );
      setCourses(trainerCourses);
    } catch (e) {
      console.error("Error loading trainer dashboard:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  async function handleAcceptInvite(courseId) {
    setActionLoadingId(courseId);
    setActionMessage("");
    try {
      await apiFetch(`/courses/${courseId}/accept-invitation`, { method: "POST" });
      setActionMessage("Successfully joined course as co-trainer.");
      setTimeout(() => setActionMessage(""), 4000);
      load();
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to accept invitation.");
      setTimeout(() => setActionMessage(""), 4000);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRejectInvite(courseId) {
    setActionLoadingId(courseId);
    setActionMessage("");
    try {
      await apiFetch(`/courses/${courseId}/reject-invitation`, { method: "POST" });
      setActionMessage("Invitation rejected.");
      setTimeout(() => setActionMessage(""), 4000);
      load();
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to reject invitation.");
      setTimeout(() => setActionMessage(""), 4000);
    } finally {
      setActionLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 w-full bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "My Courses", 
      value: data?.courses || 0, 
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    },
    { 
      label: "Active Trainees", 
      value: data?.totalTrainees || 0, 
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.97 5.97 0 00-.75-2.985m-.939-2.618A5.006 5.006 0 0018 12.5a3.375 3.375 0 00-3.375-3.375H12a3.375 3.375 0 00-3.375 3.375c0 .324.032.64.093.945m8.25.109a6.375 6.375 0 01-12.75 0v-.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766" />
        </svg>
      )
    },
    { 
      label: "Pending to Grade", 
      value: data?.pendingToGrade || 0, 
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-8 shadow-lg shadow-emerald/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="badge bg-white/20 text-white border-transparent text-xs font-mono uppercase tracking-wider">
              Trainer Portal
            </span>
            <h1 className="font-display text-display-lg text-white mt-3 leading-tight">
              {profile?.fullName || user?.name || "Trainer"}
            </h1>
            <p className="text-white/80 text-xs mt-2 leading-relaxed italic max-w-xl">
              {profile?.bio || "No biography details configured yet. Update your profile info to add a biography."}
            </p>
            {profile?.qualifications?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.qualifications.map((q) => (
                  <span key={q.id} className="text-[10px] bg-white/10 text-white/95 border border-white/25 px-2.5 py-0.5 rounded-full font-medium">
                    🎓 {q.degree} ({q.institution} - {q.year})
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link href="/trainer/profile" className="btn-secondary bg-white text-emerald-800 border-transparent hover:bg-white/90 shrink-0 self-start sm:self-center">
            Edit Profile
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.label} className="card-shell hover:shadow-elevated transition-all duration-300" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="card p-6 flex items-center justify-between bg-card border border-border">
              <div className="space-y-1">
                <p className="text-2xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/40">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {invitations.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-xs text-foreground flex items-center gap-1.5">
                ✉️ Pending Co-Trainer Invitations
              </h3>
              {actionMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl">
                  {actionMessage}
                </div>
              )}
              <div className="space-y-3">
                {invitations.map((invite) => (
                  <div key={invite.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">{invite.course?.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Invited by: {invite.course?.trainer?.name || invite.course?.trainer?.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvite(invite.courseId)}
                        disabled={actionLoadingId !== null}
                        className="btn-primary text-[10px] py-1 px-3"
                      >
                        {actionLoadingId === invite.courseId ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleRejectInvite(invite.courseId)}
                        disabled={actionLoadingId !== null}
                        className="btn-secondary text-[10px] py-1 px-3 border border-border"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-lg font-bold text-foreground">
              My Classrooms
            </h2>
            <div className="flex gap-2">
              <Link href="/courses/create" className="btn-primary btn-sm flex items-center gap-1">
                <span>➕</span>
                Create Course
              </Link>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="empty-state bg-card border border-border rounded-2xl p-10">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="empty-state-title">No Courses Created</p>
              <p className="empty-state-desc">You haven&apos;t created any courses yet. Start teaching by creating a new classroom.</p>
              <Link href="/courses/create" className="btn-primary mt-4">
                Create First Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course, index) => {
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group card-shell flex flex-col justify-between overflow-hidden h-64 hover:shadow-elevated transition-all duration-300"
                  >
                    <div className="card h-full flex flex-col justify-between border border-border">
                      {/* Course Card Banner */}
                      <div className={`bg-gradient-to-br ${gradient} p-4 text-white relative shrink-0`}>
                        <div className="relative z-10">
                          <p className="text-[10px] uppercase font-mono tracking-wider opacity-90 truncate">
                            {course.subject?.name || "LMS Subject"}
                          </p>
                          <h3 className="font-display text-base font-bold leading-tight mt-1 line-clamp-2 group-hover:underline">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-3">
                            <span className={`badge text-[9px] uppercase tracking-wider ${course.status === "PUBLISHED" ? "bg-white/20 text-white" : "bg-black/20 text-white"}`}>
                              {course.status}
                            </span>
                          </div>
                        </div>
                        <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                      </div>

                      {/* Course Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                          <span className="text-xs font-mono text-muted-foreground">
                            Enrolled: {course.enrollments?.length || 0}
                          </span>
                          <span className="text-xs text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Edit Classwork
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

        {/* Right Column: Alerts & Feedback Queue */}
        <div className="space-y-6">
          {/* Grading Queue Alert */}
          <div className="card border border-border p-5 bg-card">
            <h3 className="font-semibold text-sm text-foreground">
              Grading Queue
            </h3>
            
            {data?.pendingToGrade > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Submissions Pending</p>
                    <p className="text-[10px] text-muted-foreground">Requires grading</p>
                  </div>
                  <span className="badge badge-warning text-xs">
                    {data.pendingToGrade}
                  </span>
                </div>
                <Link href="/courses" className="btn-secondary btn-sm w-full block text-center mt-2">
                  Review Submissions
                </Link>
              </div>
            ) : (
              <div className="mt-4 text-center py-4 bg-muted/20 border border-dashed border-border rounded-lg">
                <p className="text-xs text-muted-foreground font-medium">All caught up!</p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">No trainee submissions to grade.</p>
              </div>
            )}
          </div>

          {/* Recent Course Feedback */}
          {data?.recentFeedback?.length > 0 && (
            <div className="card border border-border p-5 bg-card">
              <h3 className="font-semibold text-sm text-foreground mb-3">
                Student Reviews
              </h3>
              <div className="space-y-3">
                {data.recentFeedback.map((fb) => (
                  <div key={fb.id} className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{fb.user?.name || "Trainee"}</span>
                      <span className="font-bold text-accent">★ {fb.rating}/5</span>
                    </div>
                    <p className="text-muted-foreground italic">&ldquo;{fb.comment}&rdquo;</p>
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
