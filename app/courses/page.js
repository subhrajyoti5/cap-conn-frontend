"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import Link from "next/link";
import { listCourses } from "@/features/courses/api/courses.api";

export default function CoursesPage() {
  const { getToken, user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      const res = await listCourses(token);
      setCourses(res.data || []);
    }
    load();
  }, [getToken]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      {user?.role !== "TRAINEE" && (
        <div className="mb-4">
          <Link href="/courses/create" className="px-4 py-2 bg-blue-600 text-white rounded">
            Create Course
          </Link>
        </div>
      )}
      {courses.length === 0 ? (
        <p>No courses available.</p>
      ) : (
        <ul className="space-y-4">
          {courses.map((c) => (
            <li key={c.id} className="border p-4 rounded">
              <Link href={`/courses/${c.id}`} className="text-xl font-bold text-blue-600">
                {c.title}
              </Link>
              <p className="text-gray-700">{c.description}</p>
              <p className="text-sm text-gray-500">Status: {c.status}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
