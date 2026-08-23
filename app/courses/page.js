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
      <div className="space-y-6 animate-in stagger-1">
        <div className="skeleton h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-5 skeleton h-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const canCreate = user?.role !== "TRAINEE";

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">Browse and manage available courses</p>
        </div>
        {canCreate && (
          <Link href="/courses/create" className="btn-primary shrink-0">
            New Course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="empty-state-title">No courses available</p>
          <p className="empty-state-desc">
            {canCreate
              ? "Create your first course to get started."
              : "Check back later for new courses."}
          </p>
          {canCreate && (
            <Link href="/courses/create" className="btn-primary mt-4">
              Create Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, index) => (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="card-shell group"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="card p-5 h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm text-ink line-clamp-2">{c.title}</p>
                  <span className={`badge shrink-0 ${c.status === "PUBLISHED" ? "badge-success" : c.status === "DRAFT" ? "badge-neutral" : "badge-info"}`}>
                    {c.status?.toLowerCase()}
                  </span>
                </div>
                <p className="text-sm text-muted line-clamp-2 mb-3">{c.description}</p>
                {c.subject && (
                  <p className="text-xs text-muted flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                    {c.subject.name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}