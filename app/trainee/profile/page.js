"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Calendar,
  Briefcase,
  Building,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Save,
  Award,
  Sparkles,
  ArrowLeft,
  User,
  Lightbulb,
} from "lucide-react";

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
      showToast("Basic profile details updated successfully!");
    } catch (e) {
      console.error(e);
      showToast("Failed to update profile details.");
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
      showToast("Qualification added successfully!");
    } catch (e) {
      console.error(e);
      showToast("Failed to add qualification.");
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
      showToast("Work experience added!");
    } catch (e) {
      console.error(e);
      showToast("Failed to add work experience.");
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
      showToast("Skill added!");
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
      showToast("Learning interest added!");
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
      <div className="space-y-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-44 w-full bg-muted/50 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-muted/40 rounded-2xl" />
          <div className="md:col-span-2 space-y-6">
            <div className="h-48 bg-muted/40 rounded-2xl" />
            <div className="h-48 bg-muted/40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in stagger-1">
      {/* Trainee Solid Green Theme Header */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-900">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-emerald-100 flex items-center justify-center font-bold text-2xl border border-emerald-800 shrink-0 shadow-inner">
              {fullName ? fullName[0].toUpperCase() : "T"}
            </div>
            <div className="space-y-1">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
                Trainee Profile
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {fullName || "My Trainee Profile"}
              </h1>
            </div>
          </div>

          <Link
            href="/trainee"
            className="btn-secondary bg-white/10 text-white hover:bg-white/20 border-white/20 shrink-0 font-semibold text-xs py-2.5 px-4 shadow-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="border-b border-border/70 pb-3">
              <h2 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Basic Details</span>
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Personal contact and bio summary</p>
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingBase ? "Saving Details..." : "Save Basic Details"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Qualifications, Experience, Interests */}
        <div className="space-y-6 lg:col-span-2">
          {/* Qualifications */}
          <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="border-b border-border/70 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Qualifications & Degrees</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Degrees, diplomas, and academic history</p>
              </div>
              <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                {qualifications.length} Added
              </span>
            </div>

            {qualifications.length > 0 ? (
              <div className="space-y-2.5">
                {qualifications.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3.5 bg-muted/20 border border-border/60 rounded-xl text-xs hover:border-emerald-500/40 transition-all">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{q.degree}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {q.institution} • <span className="font-mono">{q.year}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQual(q.id)}
                      disabled={actionId === q.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors font-bold text-xs shrink-0"
                      title="Remove qualification"
                    >
                      {actionId === q.id ? "..." : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">No qualifications added yet.</p>
            )}

            <form onSubmit={handleAddQual} className="pt-3 border-t border-border/50 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add New Qualification</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs focus-within:border-emerald-500 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <GraduationCap className="w-3 h-3 text-emerald-600" />
                    <span>Degree</span>
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
                <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs focus-within:border-emerald-500 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    <span>Institution</span>
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
                <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs focus-within:border-emerald-500 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    <span>Passing Year</span>
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
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Qualification</span>
                </button>
              </div>
            </form>
          </div>

          {/* Work Experience */}
          <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="border-b border-border/70 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Work Experience</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Past positions or internships</p>
              </div>
              <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                {workExperiences.length} Added
              </span>
            </div>

            {workExperiences.length > 0 ? (
              <div className="space-y-2.5">
                {workExperiences.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3.5 bg-muted/20 border border-border/60 rounded-xl text-xs hover:border-emerald-500/40 transition-all">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{w.role}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {w.organization} • ({new Date(w.startDate).toLocaleDateString()} – {w.endDate ? new Date(w.endDate).toLocaleDateString() : "Present"})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExp(w.id)}
                      disabled={actionId === w.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors font-bold text-xs shrink-0"
                      title="Remove experience"
                    >
                      {actionId === w.id ? "..." : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">No work experience added yet.</p>
            )}

            <form onSubmit={handleAddExp} className="pt-3 border-t border-border/50 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Work Experience</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs focus-within:border-emerald-500 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <Briefcase className="w-3 h-3 text-emerald-600" />
                    <span>Role / Title</span>
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
                <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs focus-within:border-emerald-500 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <Building className="w-3 h-3 text-emerald-600" />
                    <span>Organization</span>
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
                <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs focus-within:border-emerald-500 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    <span>Start Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newExp.startDate}
                    onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                    className="w-full text-xs bg-transparent border-none p-0 focus:outline-hidden text-foreground"
                  />
                </div>
                <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs focus-within:border-emerald-500 transition-all">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    <span>End Date (Optional)</span>
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
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>
            </form>
          </div>

          {/* Skills & Learning Interests Stack */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
              <div className="border-b border-border/70 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Technical Skills</span>
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Capabilities & domain tools</p>
                </div>
                <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                  {skills.length} Added
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
                ) : (
                  skills.map((s) => (
                    <span key={s.id} className="badge bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] py-1 px-2.5 flex items-center gap-1.5 font-semibold">
                      {s.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.id)}
                        className="text-emerald-600 hover:text-rose-600 font-bold text-[10px]"
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
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </form>
            </div>

            {/* Learning Interests */}
            <div className="bg-card border border-border/80 p-6 rounded-2xl space-y-4 shadow-xs">
              <div className="border-b border-border/70 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Learning Interests</span>
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Topics & research fields</p>
                </div>
                <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                  {interests.length} Added
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {interests.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No interests added yet.</p>
                ) : (
                  interests.map((i) => (
                    <span key={i.id} className="badge bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] py-1 px-2.5 flex items-center gap-1.5 font-semibold">
                      {i.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(i.id)}
                        className="text-emerald-600 hover:text-rose-600 font-bold text-[10px]"
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
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Interest</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
