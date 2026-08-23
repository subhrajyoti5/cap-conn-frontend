"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/courses")
      .then((res) => setCourses(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Link href="/courses/create" className="btn-primary text-sm">
          + New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted">No courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="border border-border-warm rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-muted mt-1">{c.description}</p>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-surface-alt text-muted capitalize">
                {c.status?.toLowerCase()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
