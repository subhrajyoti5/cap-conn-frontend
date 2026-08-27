"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";



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
      description: "Classrooms you lead or co-teach",
      active: activeView === "classrooms",
      onClick: () => {
        setActiveView("classrooms");
        document.getElementById("my-classrooms")?.scrollIntoView({ behavior: "smooth" });
      },
    },
    { 
      label: "Active Trainees", 
      value: data?.totalTrainees || 0, 
      description: "Enrolled trainees across courses",
      active: activeView === "trainees",
      onClick: () => {
        setActiveView(activeView === "trainees" ? "classrooms" : "trainees");
      },
    },
    { 
      label: "Pending to Grade", 
      value: data?.pendingToGrade || 0, 
      description: "Submissions awaiting evaluation",
      active: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in stagger-1">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="page-title">{profile?.fullName || user?.name || "Trainer"}</h1>
            {profile?.bio && (
              <p className="page-subtitle italic">{profile.bio}</p>
            )}
            {profile?.qualifications?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.qualifications.map((q) => (
                  <span key={q.id} className="badge-neutral">
                    {q.degree} — {q.institution} {q.year}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link href="/trainer/profile" className="btn-secondary shrink-0 self-start">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            onClick={stat.onClick}
            className={`group card p-5 flex flex-col justify-between transition-all duration-200 ${
              stat.active 
                ? "border-primary ring-1 ring-primary/20" 
                : "hover:border-primary/30"
            } ${stat.onClick ? "cursor-pointer" : ""}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                  {stat.label}
                </span>
                <p className="text-2xl font-bold font-display text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{stat.description}</span>
              {stat.onClick && (
                <span className={`font-medium flex items-center gap-1 transition-opacity ${stat.active ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100 text-primary"}` }>
                  View
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {actionMessage && (
        <div className="bg-success/10 border border-success/20 text-success text-xs p-4 rounded-xl">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Pending Trainee Enrollment Requests Section */}
          {pendingEnrollments.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Pending Enrollment Requests</h3>
                <span className="badge-warning">{pendingEnrollments.length}</span>
              </div>
              <div className="space-y-3">
                {pendingEnrollments.map((req) => (
                  <div key={req.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">{req.trainee?.name || req.trainee?.email}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Requesting to join: <span className="font-semibold text-primary">{req.course?.title}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveEnrollment(req.courseId, req.traineeId)}
                        disabled={actionLoadingId !== null}
                        className="btn-success btn-sm"
                      >
                        {actionLoadingId === `${req.courseId}-${req.traineeId}` ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleRejectEnrollment(req.courseId, req.traineeId)}
                        disabled={actionLoadingId !== null}
                        className="btn-danger btn-sm"
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
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Co-Trainer Invitations</h3>
                <span className="badge-info">{invitations.length}</span>
              </div>
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

          {/* View Toggle: Classrooms vs Active Trainees Directory */}
          {activeView === "trainees" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Enrolled Trainees Directory
                  </h2>
                  <p className="text-xs text-muted-foreground">Trainees active across classrooms where you teach</p>
                </div>
                <button 
                  onClick={() => setActiveView("classrooms")}
                  className="btn-secondary btn-sm"
                >
                  Show Classrooms
                </button>
              </div>

              {courses.length === 0 ? (
                <p className="text-xs text-muted-foreground">No classrooms created yet.</p>
              ) : (
                <div className="space-y-6">
                  {courses.map((course) => {
                    const activeEnrollments = course.enrollments?.filter((e) => e.status === "ACTIVE") || [];
                    return (
                      <div key={course.id} className="card border border-border p-6 bg-card space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <h3 className="font-display text-sm font-bold text-primary">
                            {course.title}
                          </h3>
                          <span className="text-xs text-muted-foreground font-mono">
                            {activeEnrollments.length} enrolled
                          </span>
                        </div>

                        {activeEnrollments.length > 0 ? (
                          <div className="space-y-3">
                            {activeEnrollments.map((enrollment) => {
                              const student = enrollment.trainee;
                              if (!student) return null;
                              
                              // Find all courses student is enrolled in across teacher's classrooms
                              const studentCourses = courses.filter((c) =>
                                c.enrollments?.some((e) => e.traineeId === (student.id || enrollment.traineeId) && e.status === "ACTIVE")
                              );
                              const visibleCourses = studentCourses.slice(0, 2);
                              const remainingCount = studentCourses.length - visibleCourses.length;

                              return (
                                <div
                                  key={enrollment.id}
                                  onClick={() => handleViewTrainee(student.id || enrollment.traineeId)}
                                  className="p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform shrink-0">
                                      {student.name ? student.name[0].toUpperCase() : student.email[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                        {student.name || "No profile name"}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground truncate">{student.email}</p>
                                    </div>
                                  </div>

                                  {/* Right side: Enrolled Courses Pills */}
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
                          <p className="text-xs text-muted-foreground italic py-2">No active trainees in this classroom.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div id="my-classrooms" className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-display text-lg font-bold text-foreground">
                  My Classrooms
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveView("trainees")}
                    className="btn-secondary btn-sm"
                  >
                    View Trainees
                  </button>
                  <Link href="/courses/create" className="btn-primary btn-sm">
                    Create Course
                  </Link>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="empty-state bg-card border border-border rounded-xl p-10">
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
                  {courses.map((course) => {
                    return (
                      <Link
                        key={course.id}
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
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                            
                            <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                              <div className="flex items-center gap-2">
                                <span className={course.status === "PUBLISHED" ? "badge-success" : "badge-neutral"}>
                                  {course.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {course.enrollments?.length || 0} enrolled
                                </span>
                              </div>
                              <span className="text-xs text-primary font-medium">
                                Edit
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
        <div className="space-y-6">
          {/* Grading Queue Alert */}
          <div className="card border border-border p-5 bg-card">
            <h3 className="font-semibold text-sm text-foreground">
              Grading Queue
            </h3>
            
            {data?.pendingToGrade > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg flex items-center justify-between">
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

      {/* Trainee Public Profile Overview Modal */}
      {showTraineeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
              <h3 className="font-display font-bold text-sm text-foreground">Trainee Profile Overview</h3>
              <button
                onClick={() => {
                  setShowTraineeModal(false);
                  setTraineeProfile(null);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
              {loadingTrainee ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs text-muted-foreground">Loading trainee profile...</p>
                </div>
              ) : traineeProfile ? (
                <div className="space-y-6">
                  {traineeProfile.id === "temp-profile-id" && (
                    <div className="bg-warning/10 border border-warning/20 text-warning text-xs p-3.5 rounded-xl">
                      This trainee has not configured their full profile details yet. Displaying account registration info.
                    </div>
                  )}

                  <div className="flex items-center gap-4 bg-muted/10 p-4 rounded-xl border border-border/50">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                      {traineeProfile.fullName ? traineeProfile.fullName[0].toUpperCase() : "T"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-base text-foreground truncate">{traineeProfile.fullName || "Trainee"}</h4>
                        <span className="badge bg-muted text-muted-foreground text-[9px]">Trainee</span>
                      </div>
                      <p className="text-xs text-foreground font-medium mt-0.5 truncate">{traineeProfile.email || "No email available"}</p>
                      {traineeProfile.phone && <p className="text-xs text-muted-foreground mt-0.5">{traineeProfile.phone}</p>}
                    </div>
                  </div>

                  {traineeProfile.bio && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Biography</h5>
                      <p className="text-xs text-foreground leading-relaxed italic bg-muted/20 border border-border/40 p-3 rounded-lg">
                        &ldquo;{traineeProfile.bio}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Qualifications</h5>
                      {traineeProfile.qualifications?.length > 0 ? (
                        <ul className="space-y-2 text-xs">
                          {traineeProfile.qualifications.map((q) => (
                            <li key={q.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                              <span className="font-semibold block text-foreground">{q.degree}</span>
                              <span className="text-[10px] text-muted-foreground">{q.institution} ({q.year})</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No qualifications added yet.</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Experience</h5>
                      {traineeProfile.workExperiences?.length > 0 ? (
                        <ul className="space-y-2 text-xs">
                          {traineeProfile.workExperiences.map((w) => (
                            <li key={w.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                              <span className="font-semibold block text-foreground">{w.role}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {w.organization} ({new Date(w.startDate).toLocaleDateString()} – {w.endDate ? new Date(w.endDate).toLocaleDateString() : "Present"})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No experience added yet.</p>
                      )}
                    </div>
                  </div>

                  {(traineeProfile.skills?.length > 0 || traineeProfile.interests?.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border pt-4">
                      {traineeProfile.skills?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills</h5>
                          <div className="flex flex-wrap gap-1.5">
                            {traineeProfile.skills.map((s) => (
                              <span key={s.id} className="badge bg-primary/10 text-primary border border-primary/20 text-[10px]">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {traineeProfile.interests?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interests</h5>
                          <div className="flex flex-wrap gap-1.5">
                            {traineeProfile.interests.map((i) => (
                              <span key={i.id} className="badge bg-muted text-muted-foreground border border-border text-[10px]">
                                {i.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 border-t border-border pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enrolled Courses</h5>
                    {traineeProfile.courses?.length > 0 ? (
                      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin">
                        {traineeProfile.courses.map((c) => (
                          <Link
                            key={c.id}
                            href={`/courses/${c.id}`}
                            onClick={() => setShowTraineeModal(false)}
                            className="p-3 bg-card hover:bg-muted/30 border border-border rounded-xl flex flex-col justify-between hover:border-primary/40 transition-all text-xs min-w-[220px] shrink-0 group"
                          >
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-primary font-semibold font-mono">
                                {c.subject?.name || "LMS Subject"}
                              </span>
                              <span className="font-semibold block text-foreground mt-0.5 line-clamp-2 group-hover:text-primary transition-colors">{c.title}</span>
                              {c.trainer && (
                                <span className="text-[10px] text-muted-foreground block mt-1">
                                  Instructor: {c.trainer.name || c.trainer.email}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No active course enrollments.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">Could not load trainee profile information.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
