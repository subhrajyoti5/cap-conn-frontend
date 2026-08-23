"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useRouter } from "next/navigation";
import { createCourse } from "@/features/courses/api/courses.api";
import { listSubjects } from "@/features/subjects/api/subjects.api";
import Link from "next/link";

export default function CreateCoursePage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", subjectId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await listSubjects(token);
        setSubjects(res.data || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [getToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      await createCourse(token, form);
      router.push("/courses");
    } catch (err) {
      setError(err.message || "Failed to create course");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl animate-in stagger-1">
      <div className="page-header">
        <h1 className="page-title">Create Course</h1>
        <p className="page-subtitle">Add a new course to the platform</p>
      </div>

      <form onSubmit={handleSubmit} className="card-shell">
        <div className="card p-6 space-y-5">
          {error && (
            <div className="form-error p-3 rounded-button bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="form-field">
            <label className="label" htmlFor="title">Title</label>
            <input
              id="title"
              className="input"
              placeholder="Course title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="textarea"
              placeholder="What will students learn?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="subject">Subject</label>
            <select
              id="subject"
              className="select"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Creating&hellip;" : "Create Course"}
            </button>
            <Link href="/courses" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}