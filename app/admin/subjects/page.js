"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await apiFetch("/subjects");
      setSubjects(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await apiFetch("/subjects", {
        method: "POST",
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      setNewName("");
      setNewDesc("");
      load();
    } catch (err) {
      setError(err.message || "Failed to create subject");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in stagger-1">
        <div className="skeleton h-8 w-32" />
        <div className="card-shell">
          <div className="card p-4 skeleton h-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-4 skeleton h-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="page-header">
        <h1 className="page-title">Subjects</h1>
        <p className="page-subtitle">Manage course subjects and categories</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="card-shell"
      >
        <div className="card p-4 flex gap-3 flex-wrap items-end">
          <div className="form-field flex-1 min-w-[160px]">
            <label className="label">Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="input"
              placeholder="e.g. Mathematics"
            />
          </div>
          <div className="form-field flex-1 min-w-[200px]">
            <label className="label">Description (optional)</label>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="input"
              placeholder="Short description"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="btn-primary shrink-0"
          >
            {creating ? "Creating&hellip;" : "Add Subject"}
          </button>
          {error && <p className="w-full form-error mt-1">{error}</p>}
        </div>
      </form>

      {subjects.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
          <p className="empty-state-title">No subjects yet</p>
          <p className="empty-state-desc">Add a subject to categorize courses.</p>
        </div>
      ) : (
        <ul className="data-list divide-y divide-border">
          {subjects.map((s, index) => (
            <li key={s.id} className="py-3 px-4" style={{ animationDelay: `${index * 40}ms` }}>
              <p className="font-medium text-sm text-foreground">{s.name}</p>
              {s.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}