"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TraineeProfilePage() {
  const { getToken, user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [qualifications, setQualifications] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);

  const [newQual, setNewQual] = useState({ degree: "", institution: "", year: "" });
  const [newExp, setNewExp] = useState({ role: "", organization: "", startDate: "", endDate: "" });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingBase, setSavingBase] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await apiFetch("/profiles/me");
      if (res.data) {
        setFullName(res.data.fullName || user?.name || "");
        setPhone(res.data.phone || "");
        setBio(res.data.bio || "");
        setQualifications(res.data.qualifications || []);
        setWorkExperiences(res.data.workExperiences || []);
        setSkills(res.data.skills || []);
        setInterests(res.data.interests || []);
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSaveBase(e) {
    e.preventDefault();
    setSavingBase(true);
    try {
      await apiFetch("/profiles/me", {
        method: "PUT",
        body: JSON.stringify({ fullName, phone: phone || null, bio: bio || null }),
      });
      showToast("✅ Basic profile details updated successfully!");
    } catch (e) {
      console.error(e);
      showToast("❌ Failed to update profile details.");
    } finally {
      setSavingBase(false);
    }
  }

  async function handleAddQual(e) {
    e.preventDefault();
    if (!newQual.degree || !newQual.institution || !newQual.year) return;
    try {
      const res = await apiFetch("/profiles/me/qualifications", {
        method: "POST",
        body: JSON.stringify({
          degree: newQual.degree,
          institution: newQual.institution,
          year: parseInt(newQual.year),
        }),
      });
      setQualifications([...qualifications, res.data]);
      setNewQual({ degree: "", institution: "", year: "" });
      showToast("🎓 Qualification added!");
    } catch (e) {
      console.error(e);
      showToast("❌ Failed to add qualification.");
    }
  }

  async function handleRemoveQual(id) {
    setActionId(id);
    try {
      await apiFetch(`/profiles/me/qualifications/${id}`, { method: "DELETE" });
      setQualifications(qualifications.filter((q) => q.id !== id));
      showToast("Qualification removed.");
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  async function handleAddExp(e) {
    e.preventDefault();
    if (!newExp.role || !newExp.organization || !newExp.startDate) return;
    try {
      const res = await apiFetch("/profiles/me/work-experience", {
        method: "POST",
        body: JSON.stringify({
          role: newExp.role,
          organization: newExp.organization,
          startDate: newExp.startDate,
          endDate: newExp.endDate || null,
        }),
      });
      setWorkExperiences([...workExperiences, res.data]);
      setNewExp({ role: "", organization: "", startDate: "", endDate: "" });
      showToast("💼 Experience added!");
    } catch (e) {
      console.error(e);
      showToast("❌ Failed to add work experience.");
    }
  }

  async function handleRemoveExp(id) {
    setActionId(id);
    try {
      await apiFetch(`/profiles/me/work-experience/${id}`, { method: "DELETE" });
      setWorkExperiences(workExperiences.filter((w) => w.id !== id));
      showToast("Work experience removed.");
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      const res = await apiFetch("/profiles/me/skills", {
        method: "POST",
        body: JSON.stringify({ name: newSkill.trim() }),
      });
      setSkills([...skills, res.data]);
      setNewSkill("");
      showToast("⚡ Skill added!");
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRemoveSkill(id) {
    try {
      await apiFetch(`/profiles/me/skills/${id}`, { method: "DELETE" });
      setSkills(skills.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddInterest(e) {
    e.preventDefault();
    if (!newInterest.trim()) return;
    try {
      const res = await apiFetch("/profiles/me/interests", {
        method: "POST",
        body: JSON.stringify({ name: newInterest.trim() }),
      });
      setInterests([...interests, res.data]);
      setNewInterest("");
      showToast("💡 Interest added!");
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRemoveInterest(id) {
    try {
      await apiFetch(`/profiles/me/interests/${id}`, { method: "DELETE" });
      setInterests(interests.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 max-w-5xl animate-pulse">
        <div className="h-44 w-full bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-muted rounded-2xl" />
          <div className="md:col-span-2 space-y-6">
            <div className="h-48 bg-muted rounded-2xl" />
            <div className="h-48 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in stagger-1">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-700 to-indigo-800 text-white p-8 shadow-lg shadow-emerald/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-2xl border border-white/20 shadow-inner shrink-0">
              {fullName ? fullName[0].toUpperCase() : "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-white/20 text-white border-transparent text-[10px] font-mono uppercase tracking-wider">
                  Student Trainee Profile
                </span>
              </div>
              <h1 className="font-display text-display-md text-white mt-1.5 leading-tight">
                {fullName || "My Trainee Profile"}
              </h1>
              <p className="text-white/80 text-xs mt-1">
                Configure your academic degree details, skills, experience, and learning interests.
              </p>
            </div>
          </div>

          <Link
            href="/trainee"
            className="btn-secondary bg-white text-emerald-800 border-transparent hover:bg-white/90 shrink-0 font-bold text-xs py-2.5 px-4 shadow-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none" />
      </div>

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-4 rounded-xl font-medium animate-in fade-in">
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="card border border-border p-6 bg-card rounded-2xl space-y-4 shadow-sm">
            <div className="border-b border-border pb-3">
              <h2 className="font-display font-bold text-sm text-foreground">Basic Details</h2>
              <p className="text-[11px] text-muted-foreground">Personal contact and bio summary</p>
            </div>

            <form onSubmit={handleSaveBase} className="space-y-4">
              <div>
                <label className="label text-xs font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field text-xs w-full"
                  placeholder="e.g. Ananya Roy"
                />
              </div>

              <div>
                <label className="label text-xs font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field text-xs w-full"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div>
                <label className="label text-xs font-semibold">Biography</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="input-field text-xs w-full leading-relaxed"
                  placeholder="Short description of your scientific interests or department..."
                />
              </div>

              <button
                type="submit"
                disabled={savingBase}
                className="btn-primary text-xs py-2.5 w-full font-bold shadow-sm"
              >
                {savingBase ? "Saving Details..." : "Save Basic Details"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Qualifications, Experience, Interests */}
        <div className="space-y-6 lg:col-span-2">
          {/* Qualifications */}
          <div className="card border border-border p-6 bg-card rounded-2xl space-y-4 shadow-sm">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-sm text-foreground">Qualifications & Degrees</h2>
                <p className="text-[11px] text-muted-foreground">Degrees, diplomas, and academic history</p>
              </div>
              <span className="badge bg-muted text-muted-foreground font-mono text-[10px]">
                {qualifications.length} Added
              </span>
            </div>

            {qualifications.length > 0 ? (
              <div className="space-y-2.5">
                {qualifications.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3.5 bg-muted/20 border border-border/60 rounded-xl text-xs hover:border-primary/30 transition-all">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <span>🎓</span> {q.degree}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {q.institution} • <span className="font-mono">{q.year}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQual(q.id)}
                      disabled={actionId === q.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-bold text-xs shrink-0"
                      title="Remove qualification"
                    >
                      {actionId === q.id ? "..." : "✕"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">No qualifications added yet.</p>
            )}

            <form onSubmit={handleAddQual} className="pt-3 border-t border-border/50 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <span>➕</span> Add New Qualification
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-xl p-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>🎓</span> Degree / Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc. Meteorology"
                    required
                    value={newQual.degree}
                    onChange={(e) => setNewQual({ ...newQual, degree: e.target.value })}
                    className="w-full text-xs bg-transparent border-none p-0 focus:outline-hidden text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>🏛️</span> Institution / University
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IIT Delhi"
                    required
                    value={newQual.institution}
                    onChange={(e) => setNewQual({ ...newQual, institution: e.target.value })}
                    className="w-full text-xs bg-transparent border-none p-0 focus:outline-hidden text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>📅</span> Passing Year
                  </label>
                  <input
                    type="number"
                    placeholder="2024"
                    required
                    min="1950"
                    max="2100"
                    value={newQual.year}
                    onChange={(e) => setNewQual({ ...newQual, year: e.target.value })}
                    className="w-full text-xs bg-transparent border-none p-0 focus:outline-hidden text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-semibold shadow-xs">
                  Add Qualification
                </button>
              </div>
            </form>
          </div>

          {/* Work Experience */}
          <div className="card border border-border p-6 bg-card rounded-2xl space-y-4 shadow-sm">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-sm text-foreground">Work Experience</h2>
                <p className="text-[11px] text-muted-foreground">Past positions or internships</p>
              </div>
              <span className="badge bg-muted text-muted-foreground font-mono text-[10px]">
                {workExperiences.length} Added
              </span>
            </div>

            {workExperiences.length > 0 ? (
              <div className="space-y-2.5">
                {workExperiences.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3.5 bg-muted/20 border border-border/60 rounded-xl text-xs hover:border-primary/30 transition-all">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <span>💼</span> {w.role}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {w.organization} • ({new Date(w.startDate).toLocaleDateString()} – {w.endDate ? new Date(w.endDate).toLocaleDateString() : "Present"})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExp(w.id)}
                      disabled={actionId === w.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-bold text-xs shrink-0"
                      title="Remove experience"
                    >
                      {actionId === w.id ? "..." : "✕"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">No work experience added yet.</p>
            )}

            <form onSubmit={handleAddExp} className="pt-3 border-t border-border/50 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <span>➕</span> Add Work Experience
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-card border border-border rounded-xl p-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>💼</span> Role / Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Research Assistant"
                    required
                    value={newExp.role}
                    onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                    className="w-full text-xs bg-transparent border-none p-0 focus:outline-hidden text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>🏢</span> Organization / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IMD Pune"
                    required
                    value={newExp.organization}
                    onChange={(e) => setNewExp({ ...newExp, organization: e.target.value })}
                    className="w-full text-xs bg-transparent border-none p-0 focus:outline-hidden text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>📅</span> Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newExp.startDate}
                    onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                    className="w-full text-xs bg-transparent border-none p-0 focus:outline-hidden text-foreground"
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <span>🏁</span> End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newExp.endDate}
                    onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                    className="w-full text-xs bg-transparent border-none p-0 focus:outline-hidden text-foreground"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-semibold shadow-xs">
                  Add Experience
                </button>
              </div>
            </form>
          </div>

          {/* Skills & Learning Interests Stack */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="card border border-border p-6 bg-card rounded-2xl space-y-4 shadow-sm">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-sm text-foreground">Skills</h2>
                  <p className="text-[11px] text-muted-foreground">Technical capabilities & tools</p>
                </div>
                <span className="badge bg-muted text-muted-foreground font-mono text-[10px]">
                  {skills.length} Added
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
                ) : (
                  skills.map((s) => (
                    <span key={s.id} className="badge bg-muted/60 border border-border text-[10px] py-1 px-2.5 flex items-center gap-1.5 font-medium">
                      {s.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.id)}
                        className="text-muted-foreground hover:text-red-600 font-bold text-[10px]"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/50">
                <input
                  type="text"
                  placeholder="e.g. Python, Weather Forecasting"
                  required
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="input-field text-xs min-w-0 flex-1 py-2"
                />
                <button type="submit" className="btn-primary text-xs py-2 px-5 shrink-0 font-semibold">
                  Add Skill
                </button>
              </form>
            </div>

            {/* Learning Interests */}
            <div className="card border border-border p-6 bg-card rounded-2xl space-y-4 shadow-sm">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-sm text-foreground">Learning Interests</h2>
                  <p className="text-[11px] text-muted-foreground">Topics & domain fields of interest</p>
                </div>
                <span className="badge bg-muted text-muted-foreground font-mono text-[10px]">
                  {interests.length} Added
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {interests.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No interests added yet.</p>
                ) : (
                  interests.map((i) => (
                    <span key={i.id} className="badge bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] py-1 px-2.5 flex items-center gap-1.5 font-semibold">
                      {i.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(i.id)}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-red-600 font-bold text-[10px]"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              <form onSubmit={handleAddInterest} className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/50">
                <input
                  type="text"
                  placeholder="e.g. Climate Modeling, GIS"
                  required
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="input-field text-xs min-w-0 flex-1 py-2"
                />
                <button type="submit" className="btn-primary text-xs py-2 px-5 shrink-0 font-semibold">
                  Add Interest
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
