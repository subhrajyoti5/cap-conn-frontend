"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { getCourse, enrollCourse, publishCourse } from "@/features/courses/api/courses.api";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);

  async function load() {
    const token = await getToken();
    const res = await getCourse(token, id);
    setCourse(res.data);
  }

  useEffect(() => {
    load();
  }, [getToken, id]);

  async function handleEnroll() {
    const token = await getToken();
    await enrollCourse(token, id);
    load();
  }

  async function handlePublish() {
    const token = await getToken();
    await publishCourse(token, id);
    load();
  }

  if (!course) return <p className="p-8">Loading...</p>;

  const isOwner = course.trainer?.clerkUserId === userId;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-700 mb-4">{course.description}</p>
      <p className="text-sm text-gray-500 mb-6">
        Subject: {course.subject?.name} | Status: {course.status}
      </p>

      <div className="flex gap-4">
        {course.status === "PUBLISHED" && (
          <button
            onClick={handleEnroll}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Enroll
          </button>
        )}
        {isOwner && course.status === "DRAFT" && (
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Publish
          </button>
        )}
      </div>
    </main>
  );
}
