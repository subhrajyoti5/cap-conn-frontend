"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Search, Tag, BookOpen, Layers, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    setSuccessMsg("");
    try {
      await apiFetch("/admin/subjects", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      setNewName("");
      setNewDesc("");
      setSuccessMsg("Subject domain created successfully.");
      load();
    } catch (err) {
      setError(err.message || "Failed to create subject domain");
    } finally {
      setCreating(false);
    }
  }

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-7xl mx-auto">
        <div className="h-32 w-full bg-muted rounded-2xl" />
        <div className="h-48 w-full bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in stagger-1">
      {/* Enterprise Admin Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
              Admin Directory Control
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Subject Domains Management
            </h1>
            <p className="text-xs text-slate-400">Define & organize academic and scientific domains across all courses</p>
          </div>

          <Link
            href="/admin"
            className="btn-secondary bg-white/10 text-white hover:bg-white/20 border-white/20 shrink-0 font-semibold text-xs py-2.5 px-4 shadow-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Console</span>
          </Link>
        </div>
      </div>

      {/* Add Subject Card Form */}
      <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
        <div className="border-b border-border/70 pb-3">
          <h2 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Create New Subject Domain</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Register a new domain taxonomy for course categorization</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Domain Name *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              placeholder="e.g. Cybersecurity & DevSecOps"
              className="input-field text-xs bg-muted/20 border-border/80 w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Description (Optional)</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g. Security automation, container defenses, CI/CD"
              className="input-field text-xs bg-muted/20 border-border/80 w-full"
            />
          </div>

          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? "Creating..." : "Add Subject Domain"}</span>
          </button>
        </form>
      </div>

      {/* Directory Search & List */}
      <div className="space-y-4">
        <div className="bg-card border border-border/80 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search subject domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field text-xs pl-9 pr-4 py-2.5 w-full bg-muted/20 border-border/80"
            />
          </div>

          <span className="text-xs font-mono text-muted-foreground">
            Total Domains: <strong className="text-foreground">{filteredSubjects.length}</strong>
          </span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <p className="font-display font-bold text-sm text-foreground">No matching subject domains found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? "Try resetting your search filter." : "Create your first subject domain using the form above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((s) => (
              <div
                key={s.id}
                className="bg-card border border-border/80 rounded-2xl p-5 space-y-3 shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>SUBJECT</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{s.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground leading-snug">
                    {s.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {s.description || "Official course subject."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-[11px] font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Active</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}