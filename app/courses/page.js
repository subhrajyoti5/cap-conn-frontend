"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import Link from "next/link";
import { listCourses } from "@/features/courses/api/courses.api";

export default function CoursesPage() {
  const { getToken, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await listCourses(token);
        setCourses(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-surface-alt rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-32" />
          ))}
        </div>
      </div>
    );
  }

  const canCreate = user?.role !== "TRAINEE";

  return (
    <div>
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">Browse and manage available courses</p>
        </div>
        {canCreate && (
          <Link href="/courses/create" className="btn-primary">
            New Course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No courses available</p>
          <p className="empty-state-desc">
            {canCreate
              ? "Create your first course to get started."
              : "Check back later for new courses."}
          </p>
          {canCreate && (
            <Link href="/courses/create" className="btn-primary mt-4 inline-flex">
              Create Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="card p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-sm text-ink line-clamp-2">{c.title}</p>
                <span className={`badge shrink-0 ${c.status === "PUBLISHED" ? "badge-success" : c.status === "DRAFT" ? "badge-neutral" : "badge-info"}`}>
                  {c.status?.toLowerCase()}
                </span>
              </div>
              <p className="text-sm text-muted line-clamp-2">{c.description}</p>
              {c.subject && (
                <p className="text-xs text-muted mt-3">{c.subject.name}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
