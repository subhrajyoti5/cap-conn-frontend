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

  async function load() {
    const token = await getToken();
    if (!token) return;
    setAuthToken(token);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full max-w-lg bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
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

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
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
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{course.title}</h1>
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
              <span className="badge-success px-3 py-1 text-sm font-medium">✓ Enrolled</span>
            )}
          </div>
        </div>
        {course.description && (
          <p className="text-sm text-muted-foreground max-w-3xl mt-3 leading-relaxed">{course.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Resources */}
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📁</span>
                <h2 className="font-display text-base font-semibold text-foreground">Course Resources</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {course.resources?.length || 0} files
                </span>
                {(isOwner || isAdmin) && (
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    + Upload File
                  </button>
                )}
              </div>
            </div>

            {course.resources && course.resources.length > 0 ? (
              <div className="space-y-2.5">
                {course.resources.map((res, index) => (
                  <div
                    key={res.id || index}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{res.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span className="uppercase text-[10px] font-semibold">{res.type}</span>
                        {res.createdAt && (
                          <span>&bull; {new Date(res.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <a
                      href={res.storageKey}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1.5 px-3 shrink-0"
                    >
                      Open ↗
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg text-xs">
                No learning resources uploaded for this course yet.
              </div>
            )}
          </div>

          {/* Assessments Section */}
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <h2 className="font-display text-base font-semibold text-foreground">Assessments</h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {course.assessments?.length || 0} total
              </span>
            </div>

            {course.assessments && course.assessments.length > 0 ? (
              <div className="space-y-3">
                {course.assessments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Total Marks: <strong>{a.totalMarks}</strong></span>
                        <span>{a.questions?.length || 0} Questions</span>
                        {a.deadline && (
                          <span>Due: {new Date(a.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <span className={`badge ${a.status === "PUBLISHED" ? "badge-success" : "badge-neutral"} self-start sm:self-center`}>
                      {a.status?.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg text-xs">
                No assessments assigned yet.
              </div>
            )}
          </div>

          {/* Feedback & Reviews Section */}
          {course.feedbacks && course.feedbacks.length > 0 && (
            <div className="p-6 rounded-xl border border-border bg-card">
              <h2 className="font-display text-base font-semibold text-foreground mb-4">Student Reviews</h2>
              <div className="space-y-3">
                {course.feedbacks.map((f, i) => (
                  <div key={f.id || i} className="p-3.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs text-foreground">{f.user?.name || "Trainee"}</span>
<div className="flex text-warning text-xs">
  {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
</div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Course Details
            </h3>
            <dl className="space-y-3 text-xs divide-y divide-border">
              <div className="flex justify-between pt-1">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-foreground capitalize">{course.status?.toLowerCase()}</dd>
              </div>
              <div className="flex justify-between pt-3">
                <dt className="text-muted-foreground">Subject</dt>
                <dd className="font-medium text-foreground">{course.subject?.name || "General"}</dd>
              </div>
              <div className="flex justify-between pt-3">
                <dt className="text-muted-foreground">Instructor</dt>
                <dd className="font-medium text-foreground">{course.trainer?.name || "Instructor"}</dd>
              </div>
              <div className="flex justify-between pt-3">
                <dt className="text-muted-foreground">Instructor Email</dt>
                <dd className="font-mono text-foreground">{course.trainer?.email || "trainer@capconn.in"}</dd>
              </div>
              <div className="flex justify-between pt-3">
                <dt className="text-muted-foreground">Enrollments</dt>
                <dd className="font-medium text-foreground">{course.enrollments?.length || 0}</dd>
              </div>
              <div className="flex justify-between pt-3">
                <dt className="text-muted-foreground">Created Date</dt>
                <dd className="text-foreground">
                  {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Cloudflare R2 Resource Upload Modal */}
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