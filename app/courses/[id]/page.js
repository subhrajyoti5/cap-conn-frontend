"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useParams } from "next/navigation";
import { getCourse, enrollCourse, publishCourse } from "@/features/courses/api/courses.api";
import { UploadResourceModal } from "@/components/upload-resource-modal";
import Link from "next/link";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { getToken, userId, user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState("");
  
  // Tabs State
  const [activeTab, setActiveTab] = useState("stream"); // stream, classwork, people

  async function load() {
    const token = await getToken();
    if (!token) return;
    setAuthToken(token);
    try {
      const res = await getCourse(token, id);
      setCourse(res.data);
    } catch (e) {
      console.error("Error loading course details:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleEnroll() {
    const token = await getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      await enrollCourse(token, id);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePublish() {
    const token = await getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      await publishCourse(token, id);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 w-full bg-muted rounded-2xl" />
        <div className="h-10 w-64 bg-muted rounded" />
        <div className="h-48 w-full bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-lg text-foreground">Course not found</p>
        <p className="text-sm text-muted-foreground mt-1">The course you are looking for does not exist or has been removed.</p>
        <Link href="/courses" className="btn-secondary mt-4 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  const isOwner = course.trainerId === userId;
  const isEnrolled = course.enrollments?.some((e) => e.traineeId === userId || e.userId === userId);
  const isAdmin = user?.role === "ADMIN";
  const hasAccess = isOwner || isEnrolled || isAdmin;

  // Build Chronological Stream Feed (Announcements + Uploads combined)
  const streamFeed = [];
  if (course.resources) {
    course.resources.forEach((r) => {
      streamFeed.push({
        id: `res-${r.id}`,
        type: "resource",
        title: `Uploaded new resource: ${r.title}`,
        date: new Date(r.createdAt),
        data: r,
      });
    });
  }
  if (course.assessments) {
    course.assessments.forEach((a) => {
      streamFeed.push({
        id: `asmt-${a.id}`,
        type: "assessment",
        title: `Posted new assessment: ${a.title}`,
        date: a.createdAt ? new Date(a.createdAt) : new Date(course.createdAt),
        data: a,
      });
    });
  }
  // Sort descending
  streamFeed.sort((a, b) => b.date - a.date);

  return (
    <div className="space-y-6 max-w-5xl animate-in stagger-1">
      {/* Classroom Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-800 text-white p-8 shadow-lg relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${course.status === "PUBLISHED" ? "bg-white/20 text-white" : "bg-black/20 text-white"} border-transparent uppercase text-[10px]`}>
                {course.status?.toLowerCase()}
              </span>
              {course.subject && (
                <span className="badge bg-white/20 text-white border-transparent text-[10px]">{course.subject.name}</span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{course.title}</h1>
            <p className="text-xs opacity-75 mt-3">Instructor: {course.trainer?.name || "Unassigned"}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(isOwner || isAdmin) && course.status === "DRAFT" && (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="btn-secondary bg-white text-primary hover:bg-white/90 border-transparent shadow-md"
              >
                {actionLoading ? "Publishing..." : "Publish Course"}
              </button>
            )}
            {user?.role === "TRAINEE" && course.status === "PUBLISHED" && !isEnrolled && (
              <button
                onClick={handleEnroll}
                disabled={actionLoading}
                className="btn-secondary bg-white text-primary hover:bg-white/90 border-transparent shadow-md"
              >
                {actionLoading ? "Enrolling..." : "Enroll in Course"}
              </button>
            )}
            {isEnrolled && (
              <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1.5 text-xs font-semibold">
                ✓ Enrolled
              </span>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8" />
      </div>

      {/* Classroom Navigation Tabs */}
      <div className="border-b border-border flex items-center gap-6">
        <button
          onClick={() => setActiveTab("stream")}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "stream" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Stream
        </button>
        <button
          onClick={() => setActiveTab("classwork")}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "classwork" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Classwork
        </button>
        <button
          onClick={() => setActiveTab("people")}
          className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "people" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          People
        </button>
      </div>

      {/* Tab Panels */}
      {!hasAccess && user?.role === "TRAINEE" ? (
        <div className="empty-state bg-card border border-border rounded-xl py-12 text-center">
          <p className="empty-state-title">Access Restricted</p>
          <p className="empty-state-desc">Please enroll in this course to view resources, stream feed, and classwork.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB: STREAM */}
          {activeTab === "stream" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Left sidebar: Course details info */}
              <div className="md:col-span-1 space-y-4">
                <div className="card border border-border p-4 bg-card">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Upcoming Due</h3>
                  {course.assessments?.filter(a => a.status === "PUBLISHED").length > 0 ? (
                    <div className="space-y-2">
                      {course.assessments.filter(a => a.status === "PUBLISHED").slice(0, 2).map(a => (
                        <p key={a.id} className="text-xs text-foreground leading-normal">
                          <span className="font-semibold block">{a.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {a.deadline ? `Due: ${new Date(a.deadline).toLocaleDateString()}` : "No deadline"}
                          </span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Woohoo, no work due soon!</p>
                  )}
                </div>
              </div>

              {/* Right area: Announcements feed */}
              <div className="md:col-span-3 space-y-4">
                {/* Course description card */}
                <div className="card border border-border p-5 bg-card">
                  <h3 className="font-semibold text-sm text-foreground mb-1">About this course</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{course.description || "No description provided."}</p>
                </div>

                {/* Announcement stream feed */}
                <div className="space-y-4">
                  {streamFeed.length === 0 ? (
                    <div className="text-center py-10 bg-muted/10 border border-dashed border-border rounded-xl">
                      <p className="text-xs text-muted-foreground">Nothing has been posted to the stream yet.</p>
                    </div>
                  ) : (
                    streamFeed.map((post) => (
                      <div key={post.id} className="card border border-border p-5 bg-card flex gap-4">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "I"}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-foreground">{course.trainer?.name || "Instructor"}</span>
                            <span className="text-[10px] text-muted-foreground">{post.date.toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{post.title}</p>
                          
                          {/* Quick access preview buttons */}
                          {post.type === "resource" && (
                            <a
                              href={post.data.storageKey}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-[10px] font-semibold text-primary hover:bg-muted transition-colors mt-2"
                            >
                              <span>📂</span>
                              Open Resource
                            </a>
                          )}
                          
                          {post.type === "assessment" && (
                            <button
                              onClick={() => setActiveTab("classwork")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-[10px] font-semibold text-primary hover:bg-muted transition-colors mt-2"
                            >
                              <span>📝</span>
                              View Assessment
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLASSWORK */}
          {activeTab === "classwork" && (
            <div className="space-y-6">
              {/* Course Resources block */}
              <div className="card border border-border p-6 bg-card space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📁</span>
                    <h2 className="font-display text-sm font-bold text-foreground">Course Resources</h2>
                  </div>
                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="btn-primary btn-sm flex items-center gap-1"
                    >
                      <span>➕</span>
                      Upload File
                    </button>
                  )}
                </div>

                {course.resources && course.resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.resources.map((res, index) => (
                      <div
                        key={res.id || index}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:bg-muted/10 transition-colors gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate">{res.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            <span className="uppercase font-bold text-[9px] bg-muted px-1.5 py-0.5 rounded">
                              {res.type}
                            </span>
                            {res.createdAt && (
                              <span>&bull; {new Date(res.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <a
                          href={res.storageKey}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary btn-sm px-3 py-1 text-[10px] shrink-0"
                        >
                          Open ↗
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl text-xs">
                    No learning resources uploaded for this course yet.
                  </div>
                )}
              </div>

              {/* Assessments block */}
              <div className="card border border-border p-6 bg-card space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📝</span>
                    <h2 className="font-display text-sm font-bold text-foreground">Assignments & Quizzes</h2>
                  </div>
                </div>

                {course.assessments && course.assessments.length > 0 ? (
                  <div className="space-y-3">
                    {course.assessments.map((a) => (
                      <div
                        key={a.id}
                        className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-xs text-foreground">{a.title}</p>
                          <p className="text-[11px] text-muted-foreground">{a.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span>Total Marks: <strong>{a.totalMarks}</strong></span>
                            <span>{a.questions?.length || 0} Questions</span>
                            {a.deadline && (
                              <span>Due: {new Date(a.deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                          <span className={`badge text-[9px] uppercase font-bold tracking-wider ${a.status === "PUBLISHED" ? "badge-success" : "badge-neutral"}`}>
                            {a.status?.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl text-xs">
                    No assessments assigned yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PEOPLE */}
          {activeTab === "people" && (
            <div className="space-y-6">
              {/* Teachers */}
              <div className="card border border-border p-6 bg-card space-y-4">
                <h2 className="font-display text-sm font-bold text-primary border-b border-border pb-2">
                  Teachers
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "I"}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-foreground">{course.trainer?.name || "Instructor"}</p>
                    <p className="text-[10px] text-muted-foreground">{course.trainer?.email}</p>
                  </div>
                </div>
              </div>

              {/* Classmates */}
              <div className="card border border-border p-6 bg-card space-y-4">
                <h2 className="font-display text-sm font-bold text-primary border-b border-border pb-2 flex justify-between items-center">
                  <span>Classmates</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {course.enrollments?.length || 0} enrolled
                  </span>
                </h2>
                {course.enrollments && course.enrollments.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {course.enrollments.map((enrollment) => {
                      const student = enrollment.trainee;
                      if (!student) return null;
                      return (
                        <li key={enrollment.id} className="py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-xs">
                            {student.name ? student.name[0].toUpperCase() : student.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-xs text-foreground">{student.name || "No profile name"}</p>
                            <p className="text-[9px] text-muted-foreground">{student.email}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    No trainees enrolled in this classroom yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resource Upload Modal */}
      <UploadResourceModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        courseId={id}
        token={authToken}
        onResourceUploaded={load}
      />
    </div>
  );
}