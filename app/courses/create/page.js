"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createCourse } from "@/features/courses/api/courses.api";
import { listSubjects } from "@/features/subjects/api/subjects.api";

export default function CreateCoursePage() {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", subjectId: "" });

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const res = await listSubjects(token);
      setSubjects(res.data || []);
    }
    load();
  }, [getToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = await getToken();
    await createCourse(token, form);
    router.push("/courses");
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <select
          className="w-full border p-2 rounded"
          value={form.subjectId}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          required
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Create
        </button>
      </form>
    </main>
  );
}
