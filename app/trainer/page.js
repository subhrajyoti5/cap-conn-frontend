"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import {
  BookOpen,
  Users,
  CheckSquare,
  Plus,
  ArrowRight,
  Clock,
  Star,
  UserCheck,
  CheckCircle2,
  XCircle,
  Shield,
  FileCheck,
  ChevronRight,
  X,
} from "lucide-react";

export default function TrainerDashboardPage() {
  const { getToken, user } = useAuth();
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [activeView, setActiveView] = useState("classrooms"); // "classrooms" | "trainees"

  const [showTraineeModal, setShowTraineeModal] = useState(false);
  const [traineeProfile, setTraineeProfile] = useState(null);
  const [loadingTrainee, setLoadingTrainee] = useState(false);

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;

      const [dashRes, coursesRes, profileRes, invitesRes, pendingRes] = await Promise.all([
        apiFetch("/dashboard/trainer"),
        apiFetch("/courses"),
        apiFetch("/profiles/me"),
        apiFetch("/courses/invitations/pending"),
        apiFetch("/courses/enrollments/pending").catch(() => ({ data: [] })),
      ]);

      setData(dashRes.data || dashRes);
      setProfile(profileRes.data || null);
      setInvitations(invitesRes.data || []);
      setPendingEnrollments(pendingRes.data || []);

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

  async function handleApproveEnrollment(courseId, traineeId) {
    setActionLoadingId(`${courseId}-${traineeId}`);
    setActionMessage("");
    try {
      await apiFetch(`/courses/${courseId}/enrollments/${traineeId}/approve`, { method: "POST" });
      setActionMessage("Trainee enrollment request approved!");
      setTimeout(() => setActionMessage(""), 4000);
      load();
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to approve enrollment request.");
      setTimeout(() => setActionMessage(""), 4000);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRejectEnrollment(courseId, traineeId) {
    setActionLoadingId(`${courseId}-${traineeId}`);
    setActionMessage("");
    try {
      await apiFetch(`/courses/${courseId}/enrollments/${traineeId}/reject`, {
        method: "POST",
        body: JSON.stringify({ message: "Rejected by instructor from dashboard." }),
      });
      setActionMessage("Trainee enrollment request rejected.");
      setTimeout(() => setActionMessage(""), 4000);
      load();
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to reject enrollment request.");
      setTimeout(() => setActionMessage(""), 4000);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleViewTrainee(traineeId) {
    if (!traineeId) return;
    setShowTraineeModal(true);
    setLoadingTrainee(true);
    try {
      const res = await apiFetch(`/profiles/trainees/${traineeId}`);
      setTraineeProfile(res.data);
    } catch (e) {
      console.error("Error loading trainee public profile:", e);
      setTraineeProfile(null);
    } finally {
      setLoadingTrainee(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-44 w-full bg-muted/50 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted/40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "My Courses",
      value: data?.courses || 0,
      description: "Courses you instruct or co-teach",
      icon: BookOpen,
      active: activeView === "classrooms",
      onClick: () => {
        setActiveView("classrooms");
        document.getElementById("my-classrooms")?.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      label: "Active Trainees",
      value: data?.totalTrainees || 0,
      description: "Enrolled participants across courses",
      icon: Users,
      active: activeView === "trainees",
      onClick: () => {
        setActiveView(activeView === "trainees" ? "classrooms" : "trainees");
      },
    },
    {
      label: "Grading Queue",
      value: data?.pendingToGrade || 0,
      description: "Submissions awaiting evaluation",
      icon: FileCheck,
      active: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in stagger-1">
      {/* Trainer Solid Blue Theme Header */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
              Trainer Desk
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {profile?.fullName || user?.name || "Trainer Workspace"}
            </h1>
          </div>

          <div className="flex gap-3 shrink-0">
            <Link
              href="/courses/create"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2.5 px-4 rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
            <Link
              href="/trainer/profile"
              className="btn-secondary text-xs py-2.5 px-4 font-semibold text-white bg-white/10 hover:bg-white/20 border-white/20"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.label}
              onClick={stat.onClick}
              className={`bg-card border p-5 rounded-2xl flex flex-col justify-between transition-all shadow-xs ${
                stat.active
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border/80 hover:border-primary/40"
              } ${stat.onClick ? "cursor-pointer" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <p className="text-2xl font-bold font-display text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{stat.description}</span>
                {stat.onClick && (
                  <span className={`font-semibold flex items-center gap-1 transition-opacity ${stat.active ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100 text-primary"}`}>
                    <span>View</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Pending Trainee Enrollment Requests Section */}
          {pendingEnrollments.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Pending Trainee Enrollment Requests</span>
                </h3>
                <span className="badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                  {pendingEnrollments.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendingEnrollments.map((req) => (
                  <div
                    key={req.id}
                    className="bg-card border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{req.trainee?.name || req.trainee?.email}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Requesting to join: <span className="font-semibold text-primary">{req.course?.title}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveEnrollment(req.courseId, req.traineeId)}
                        disabled={actionLoadingId !== null}
                        className="btn-primary text-xs py-1.5 px-3 font-semibold shadow-xs"
                      >
                        {actionLoadingId === `${req.courseId}-${req.traineeId}` ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleRejectEnrollment(req.courseId, req.traineeId)}
                        disabled={actionLoadingId !== null}
                        className="btn-secondary text-xs py-1.5 px-3 font-medium hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Co-Trainer Invitations */}
          {invitations.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <span>Co-Trainer Invitations</span>
                </h3>
                <span className="badge bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold">
                  {invitations.length}
                </span>
              </div>
              <div className="space-y-3">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="bg-card border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{invite.course?.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Invited by: {invite.course?.trainer?.name || invite.course?.trainer?.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvite(invite.courseId)}
                        disabled={actionLoadingId !== null}
                        className="btn-primary text-xs py-1.5 px-3 font-semibold shadow-xs"
                      >
                        {actionLoadingId === invite.courseId ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleRejectInvite(invite.courseId)}
                        disabled={actionLoadingId !== null}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Toggle: Classrooms vs Active Trainees Directory */}
          {activeView === "trainees" ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div>
                  <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Enrolled Trainees Directory</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">Active participants across your assigned courses</p>
                </div>
                <button
                  onClick={() => setActiveView("classrooms")}
                  className="btn-secondary text-xs py-1.5 px-3 font-medium"
                >
                  Show Courses
                </button>
              </div>

              {courses.length === 0 ? (
                <p className="text-xs text-muted-foreground">No courses created yet.</p>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => {
                    const activeEnrollments = course.enrollments?.filter((e) => e.status === "ACTIVE") || [];
                    return (
                      <div key={course.id} className="bg-card border border-border/80 p-5 rounded-2xl space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-border/70 pb-2">
                          <h3 className="font-display text-sm font-bold text-primary">
                            {course.title}
                          </h3>
                          <span className="text-xs text-muted-foreground font-mono">
                            {activeEnrollments.length} enrolled
                          </span>
                        </div>

                        {activeEnrollments.length > 0 ? (
                          <div className="space-y-2.5">
                            {activeEnrollments.map((enrollment) => {
                              const student = enrollment.trainee;
                              if (!student) return null;

                              const studentCourses = courses.filter((c) =>
                                c.enrollments?.some((e) => e.traineeId === (student.id || enrollment.traineeId) && e.status === "ACTIVE")
                              );
                              const visibleCourses = studentCourses.slice(0, 2);
                              const remainingCount = studentCourses.length - visibleCourses.length;

                              return (
                                <div
                                  key={enrollment.id}
                                  onClick={() => handleViewTrainee(student.id || enrollment.traineeId)}
                                  className="p-3.5 bg-card border border-border/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-700">
                                      {student.name ? student.name[0].toUpperCase() : student.email[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                        {student.name || "No profile name"}
                                      </p>
                                      <p className="text-[10px] font-mono text-muted-foreground truncate">{student.email}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                                    {visibleCourses.map((c) => (
                                      <span key={c.id} className="badge bg-muted/60 border border-border text-[9px] py-0.5 px-2 font-medium">
                                        {c.title}
                                      </span>
                                    ))}
                                    {remainingCount > 0 && (
                                      <span className="badge bg-primary/10 border border-primary/20 text-primary text-[9px] py-0.5 px-2 font-bold">
                                        +{remainingCount} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic py-2">No active trainees in this course.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div id="my-classrooms" className="space-y-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>My Courses</span>
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveView("trainees")}
                    className="btn-secondary text-xs py-1.5 px-3 font-medium"
                  >
                    View Trainees
                  </button>
                  <Link href="/courses/create" className="btn-primary text-xs py-1.5 px-3 font-semibold shadow-xs flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Course</span>
                  </Link>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="bg-card border border-border/80 rounded-2xl p-10 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="font-bold text-sm text-foreground font-display">No Courses Created</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You haven&apos;t created any courses yet. Start teaching by initializing your first course.
                    </p>
                  </div>
                  <Link href="/courses/create" className="btn-primary text-xs py-2 px-4 shadow-xs inline-flex items-center gap-2">
                    <span>Create First Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {courses.map((course, idx) => {
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
                    const activeEnrollmentsCount = course.enrollments?.filter(e => e.status === "ACTIVE")?.length || course.enrollments?.length || 0;

                    return (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="group bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl transition-all flex flex-col justify-between min-h-[260px]"
                      >
                        {/* Solid Domain Header Banner */}
                        <div className={`p-5 ${theme.bg} min-h-[105px] flex flex-col justify-between shrink-0 text-white`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`${theme.badgeBg} border text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md truncate max-w-[65%]`}>
                              {course.subject?.name || "Specialized Domain"}
                            </span>
                            <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                              course.status === "PUBLISHED"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-white/10 text-white/80 border-white/20"
                            }`}>
                              {course.status}
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-sm text-white line-clamp-2 leading-snug mt-3">
                            {course.title}
                          </h3>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-card text-foreground">
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {course.description || "Comprehensive course curriculum & training resources."}
                          </p>

                          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-mono text-muted-foreground">{activeEnrollmentsCount} enrolled</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              <span>Manage Course</span>
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
          )}
        </div>

        {/* Right Column: Alerts & Feedback Queue */}
        <div className="space-y-5">
          {/* Grading Queue Alert */}
          <div className="bg-card border border-border/80 p-5 rounded-2xl space-y-3 shadow-xs">
            <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-primary" />
              <span>Grading Queue</span>
            </h3>

            {data?.pendingToGrade > 0 ? (
              <div className="space-y-2">
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Pending Submissions</p>
                    <p className="text-[10px] text-muted-foreground">Awaiting your evaluation</p>
                  </div>
                  <span className="badge bg-amber-500/10 text-amber-600 font-mono font-bold text-xs px-2 py-0.5">
                    {data.pendingToGrade}
                  </span>
                </div>
                <Link href="/courses" className="btn-secondary text-xs py-2 w-full block text-center font-medium shadow-xs">
                  Review Submissions
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/20 border border-dashed border-border/80 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">All caught up!</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">No student submissions to grade.</p>
              </div>
            )}
          </div>

          {/* Recent Course Feedback */}
          {data?.recentFeedback?.length > 0 && (
            <div className="bg-card border border-border/80 p-5 rounded-2xl space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Student Reviews</span>
              </h3>
              <div className="space-y-2.5">
                {data.recentFeedback.map((fb) => (
                  <div key={fb.id} className="p-3 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-foreground">{fb.user?.name || "Trainee"}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">★ {fb.rating}/5</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] italic leading-relaxed">&ldquo;{fb.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trainee Public Profile Overview Modal */}
      {showTraineeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-card border border-border/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-muted/20 shrink-0">
              <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Trainee Profile Overview</span>
              </h3>
              <button
                onClick={() => {
                  setShowTraineeModal(false);
                  setTraineeProfile(null);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
              {loadingTrainee ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs text-muted-foreground">Loading profile...</p>
                </div>
              ) : traineeProfile ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/80">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center font-bold text-lg shrink-0 border border-slate-700">
                      {traineeProfile.fullName ? traineeProfile.fullName[0].toUpperCase() : "T"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-sm text-foreground truncate">{traineeProfile.fullName || "Trainee"}</h4>
                        <span className="badge bg-primary/10 text-primary text-[9px] font-mono">Trainee</span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{traineeProfile.email || "No email"}</p>
                    </div>
                  </div>

                  {traineeProfile.bio && (
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Biography</h5>
                      <p className="text-xs text-muted-foreground italic bg-card border border-border/70 p-3 rounded-xl">
                        &ldquo;{traineeProfile.bio}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-mono uppercase font-bold text-muted-foreground border-b border-border/70 pb-1">Qualifications</h5>
                      {traineeProfile.qualifications?.length > 0 ? (
                        <ul className="space-y-1.5 text-xs">
                          {traineeProfile.qualifications.map((q) => (
                            <li key={q.id} className="p-2 rounded-lg bg-muted/30 border border-border/60">
                              <span className="font-semibold block text-foreground">{q.degree}</span>
                              <span className="text-[10px] text-muted-foreground">{q.institution} ({q.year})</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No qualifications added.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-[10px] font-mono uppercase font-bold text-muted-foreground border-b border-border/70 pb-1">Experience</h5>
                      {traineeProfile.workExperiences?.length > 0 ? (
                        <ul className="space-y-1.5 text-xs">
                          {traineeProfile.workExperiences.map((w) => (
                            <li key={w.id} className="p-2 rounded-lg bg-muted/30 border border-border/60">
                              <span className="font-semibold block text-foreground">{w.role}</span>
                              <span className="text-[10px] text-muted-foreground">{w.organization}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No experience added.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">Could not load profile.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
