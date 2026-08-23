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

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Subjects</h1>

      <form
        onSubmit={handleCreate}
        className="mb-8 p-4 border border-border-warm rounded-lg flex gap-3 flex-wrap items-end"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-ink mb-1">Name</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="w-full border border-border-warm rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="e.g. Mathematics"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-ink mb-1">Description (optional)</label>
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full border border-border-warm rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Short description"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="btn-primary text-sm"
        >
          {creating ? "Creating..." : "+ Add Subject"}
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      {subjects.length === 0 ? (
        <p className="text-muted">No subjects yet.</p>
      ) : (
        <ul className="space-y-3">
          {subjects.map((s) => (
            <li
              key={s.id}
              className="border border-border-warm rounded-lg p-4"
            >
              <p className="font-semibold">{s.name}</p>
              {s.description && (
                <p className="text-sm text-muted mt-1">{s.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
