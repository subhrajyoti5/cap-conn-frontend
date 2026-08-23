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
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-surface-alt rounded" />
        <div className="h-4 w-full max-w-lg bg-surface-alt rounded" />
        <div className="h-4 w-48 bg-surface-alt rounded" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">Course not found</p>
        <p className="empty-state-desc">The course you are looking for does not exist or has been removed.</p>
        <Link href="/courses" className="btn-secondary mt-4 inline-flex">
          Back to courses
        </Link>
      </div>
    );
  }

  const isOwner = course.trainerId === userId;
  const isEnrolled = course.enrollments?.some((e) => e.userId === userId);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div>
      <div className="page-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${course.status === "PUBLISHED" ? "badge-success" : course.status === "DRAFT" ? "badge-neutral" : "badge-info"}`}>
                {course.status?.toLowerCase()}
              </span>
              {course.subject && (
                <span className="badge badge-neutral">{course.subject.name}</span>
              )}
            </div>
            <h1 className="page-title">{course.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(isOwner || isAdmin) && course.status === "DRAFT" && (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? "Publishing..." : "Publish"}
              </button>
            )}
            {user?.role === "TRAINEE" && course.status === "PUBLISHED" && !isEnrolled && (
              <button
                onClick={handleEnroll}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? "Enrolling..." : "Enroll"}
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
            <div className="card">
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
          ) : (
            <div className="card p-8 text-center">
              <p className="text-sm text-muted">No modules added yet.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-display text-sm text-muted uppercase tracking-wider mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Created</dt>
                <dd className="text-ink">
                  {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Trainer</dt>
                <dd className="text-ink">{course.trainer?.name || "—"}</dd>
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
  );
}
