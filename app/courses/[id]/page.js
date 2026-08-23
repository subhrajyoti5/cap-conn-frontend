"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useParams } from "next/navigation";
import { getCourse, enrollCourse, publishCourse } from "@/features/courses/api/courses.api";
import { GoogleDriveViewerModal, isGoogleDriveUrl } from "@/components/google-drive-viewer";
import Link from "next/link";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { getToken, userId, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Document viewer modal state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  async function load() {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await getCourse(token, id);
      setCourse(res.data);
    } catch (e) {
      console.error(e);
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

  const handleOpenDocViewer = (resource) => {
    setSelectedDoc(resource);
    setViewerOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in stagger-1">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-full max-w-lg" />
        <div className="skeleton h-4 w-48" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="empty-state animate-in stagger-1">
        <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <p className="empty-state-title">Course not found</p>
        <p className="empty-state-desc">The course you are looking for does not exist or has been removed.</p>
        <Link href="/courses" className="btn-secondary mt-4">
          Back to courses
        </Link>
      </div>
    );
  }

  const isOwner = course.trainerId === userId;
  const isEnrolled = course.enrollments?.some((e) => e.traineeId === userId || e.userId === userId);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-8 animate-in stagger-1">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`badge ${course.status === "PUBLISHED" ? "badge-success" : course.status === "DRAFT" ? "badge-neutral" : "badge-info"}`}>
                {course.status?.toLowerCase()}
              </span>
              {course.subject && (
                <span className="badge badge-neutral">{course.subject.name}</span>
              )}
            </div>
            <h1 className="page-title text-2xl sm:text-3xl font-bold">{course.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(isOwner || isAdmin) && course.status === "DRAFT" && (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? "Publishing..." : "Publish Course"}
              </button>
            )}
            {user?.role === "TRAINEE" && course.status === "PUBLISHED" && !isEnrolled && (
              <button
                onClick={handleEnroll}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? "Enrolling..." : "Enroll in Course"}
              </button>
            )}
            {isEnrolled && (
              <span className="badge badge-success px-3 py-1 text-sm">✓ Enrolled</span>
            )}
          </div>
        </div>
        {course.description && (
          <p className="page-subtitle max-w-3xl mt-3 text-base">{course.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Learning Resources & Presentations, Assessments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Resources & Google Drive Presentations Section */}
          <div className="card-shell">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📁</span>
                  <h2 className="font-display text-lg font-semibold text-ink">Learning Resources & Presentation Decks</h2>
                </div>
                <span className="badge badge-neutral text-xs font-mono">
                  {course.resources?.length || 0} items
                </span>
              </div>

              {course.resources && course.resources.length > 0 ? (
                <div className="space-y-3">
                  {course.resources.map((res, index) => {
                    const isDrive = isGoogleDriveUrl(res.storageKey);
                    return (
                      <div
                        key={res.id || index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-muted/40 transition-all duration-200 gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            {res.type === "PRESENTATION" ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-ink truncate">{res.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted">
                              <span className="badge badge-neutral text-[10px] py-0.5">{res.type}</span>
                              {isDrive && (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Google Drive Ready
                                </span>
                              )}
                              {res.createdAt && (
                                <span>&bull; {new Date(res.createdAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {isDrive ? (
                            <button
                              onClick={() => handleOpenDocViewer(res)}
                              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>Preview Deck</span>
                            </button>
                          ) : (
                            <a
                              href={res.storageKey}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-xs py-1.5 px-3"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted border border-dashed border-border rounded-xl">
                  <p className="text-sm">No learning resources uploaded for this course yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Assessments Section */}
          <div className="card-shell">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <h2 className="font-display text-lg font-semibold text-ink">Course Assessments</h2>
                </div>
                <span className="badge badge-neutral text-xs font-mono">
                  {course.assessments?.length || 0} assessments
                </span>
              </div>

              {course.assessments && course.assessments.length > 0 ? (
                <div className="space-y-3">
                  {course.assessments.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-sm text-ink">{a.title}</p>
                        <p className="text-xs text-muted mt-1">{a.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                          <span>🎯 Total Marks: <strong>{a.totalMarks}</strong></span>
                          <span>❓ {a.questions?.length || 0} Questions</span>
                          {a.deadline && (
                            <span>⏳ Due: {new Date(a.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 self-end sm:self-center">
                        <span className={`badge ${a.status === "PUBLISHED" ? "badge-success" : "badge-neutral"}`}>
                          {a.status?.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted border border-dashed border-border rounded-xl">
                  <p className="text-sm">No assessments assigned yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Reviews Section */}
          {course.feedbacks && course.feedbacks.length > 0 && (
            <div className="card-shell">
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">⭐</span>
                  <h2 className="font-display text-lg font-semibold text-ink">Student Feedback & Reviews</h2>
                </div>
                <div className="space-y-3">
                  {course.feedbacks.map((f, i) => (
                    <div key={f.id || i} className="p-4 rounded-xl border border-border bg-surface/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-ink">{f.user?.name || "Verified Trainee"}</span>
                        <div className="flex text-amber-400 text-sm">
                          {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                        </div>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{f.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Details, Trainer Profile, Enrollments */}
        <div className="space-y-6">
          <div className="card-shell">
            <div className="card p-5">
              <h3 className="font-display text-xs text-muted uppercase tracking-wider mb-4 font-semibold">
                Course Details
              </h3>
              <dl className="space-y-3.5 text-sm divide-y divide-border">
                <div className="flex justify-between pt-1">
                  <dt className="text-muted">Status</dt>
                  <dd className="font-medium text-ink capitalize">{course.status?.toLowerCase()}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-muted">Subject</dt>
                  <dd className="font-medium text-ink">{course.subject?.name || "General"}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-muted">Instructor</dt>
                  <dd className="font-medium text-ink">{course.trainer?.name || "Instructor"}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-muted">Instructor Email</dt>
                  <dd className="font-mono text-xs text-ink">{course.trainer?.email || "trainer@capconn.in"}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-muted">Active Enrollments</dt>
                  <dd className="font-medium text-ink">{course.enrollments?.length || 0}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-muted">Published Date</dt>
                  <dd className="text-ink">
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Google Drive Document / Presentation Modal Viewer */}
      {selectedDoc && (
        <GoogleDriveViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          url={selectedDoc.storageKey}
          title={selectedDoc.title}
          type={selectedDoc.type}
        />
      )}
    </div>
  );
}