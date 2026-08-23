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
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-surface-alt rounded" />
        <div className="card h-24" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-16" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subjects</h1>
        <p className="page-subtitle">Manage course subjects and categories</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="card p-4 mb-6 flex gap-3 flex-wrap items-end"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="label">Name</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="input"
            placeholder="e.g. Mathematics"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
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
          className="btn-primary"
        >
          {creating ? "Creating..." : "Add Subject"}
        </button>
        {error && <p className="w-full text-sm text-red-600 mt-1">{error}</p>}
      </form>

      {subjects.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No subjects yet</p>
          <p className="empty-state-desc">Add a subject to categorize courses.</p>
        </div>
      ) : (
        <ul className="data-list divide-y divide-border-warm">
          {subjects.map((s) => (
            <li key={s.id} className="py-3 px-4">
              <p className="font-medium text-sm text-ink">{s.name}</p>
              {s.description && (
                <p className="text-sm text-muted mt-0.5">{s.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
