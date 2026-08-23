"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useParams } from "next/navigation";
import { getCourse, enrollCourse, publishCourse } from "@/features/courses/api/courses.api";
import Link from "next/link";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { getToken, userId, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
  const isEnrolled = course.enrollments?.some((e) => e.userId === userId);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-8 animate-in stagger-1">
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
            <h1 className="page-title">{course.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(isOwner || isAdmin) && course.status === "DRAFT" && (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? "Publishing&hellip;" : "Publish"}
              </button>
            )}
            {user?.role === "TRAINEE" && course.status === "PUBLISHED" && !isEnrolled && (
              <button
                onClick={handleEnroll}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? "Enrolling&hellip;" : "Enroll"}
              </button>
            )}
            {isEnrolled && (
              <span className="badge badge-success">Enrolled</span>
            )}
          </div>
        </div>
        {course.description && (
          <p className="page-subtitle max-w-2xl mt-2">{course.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {course.modules?.length > 0 ? (
            <div className="card-shell">
              <div className="card p-5">
                <h2 className="font-display text-lg text-ink mb-4">Modules</h2>
                <ul className="divide-y divide-border-warm">
                  {course.modules.map((m, i) => (
                    <li key={m.id || i} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{m.title}</p>
                        <p className="text-xs text-muted mt-0.5">{m.type || "Lesson"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="card-shell">
              <div className="card p-8 text-center">
                <svg className="w-10 h-10 mx-auto mb-3 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <p className="text-sm text-muted">No modules added yet.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-shell">
            <div className="card p-5">
              <h3 className="font-display text-sm text-muted uppercase tracking-wider mb-3">Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Created</dt>
                  <dd className="text-ink">
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "\u2014"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Trainer</dt>
                  <dd className="text-ink">{course.trainer?.name || "\u2014"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Enrollments</dt>
                  <dd className="text-ink">{course.enrollments?.length || 0}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}