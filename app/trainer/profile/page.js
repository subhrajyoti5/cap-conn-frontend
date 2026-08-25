"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TrainerProfilePage() {
  const { getToken } = useAuth();


  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");


  const [qualifications, setQualifications] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [trainerCompetencies, setTrainerCompetencies] = useState([]);
  const [allCompetencies, setAllCompetencies] = useState([]);


  const [newQual, setNewQual] = useState({ degree: "", institution: "", year: "" });
  const [newExp, setNewExp] = useState({ role: "", organization: "", startDate: "", endDate: "" });
  const [newSkill, setNewSkill] = useState("");
  const [selectedCompetencyId, setSelectedCompetencyId] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingBase, setSavingBase] = useState(false);
  const [actionId, setActionId] = useState(null);

  async function load() {
    try {
      const token = await getToken();
      if (!token) return;

      const [profileRes, competenciesRes] = await Promise.all([
        apiFetch("/profiles/me"),
        apiFetch("/competencies"),
      ]);

      if (profileRes.data) {
        setFullName(profileRes.data.fullName || "");
        setPhone(profileRes.data.phone || "");
        setBio(profileRes.data.bio || "");
        setQualifications(profileRes.data.qualifications || []);
        setWorkExperiences(profileRes.data.workExperiences || []);
        setSkills(profileRes.data.skills || []);
        setTrainerCompetencies(profileRes.data.trainerCompetencies || []);
      }

      setAllCompetencies(competenciesRes.data || competenciesRes || []);
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
      alert("Basic profile updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to update basic profile.");
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
    } catch (e) {
      console.error(e);
      alert("Failed to add qualification.");
    }
  }

  async function handleRemoveQual(id) {
    setActionId(id);
    try {
      await apiFetch(`/profiles/me/qualifications/${id}`, { method: "DELETE" });
      setQualifications(qualifications.filter((q) => q.id !== id));
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
    } catch (e) {
      console.error(e);
      alert("Failed to add experience.");
    }
  }

  async function handleRemoveExp(id) {
    setActionId(id);
    try {
      await apiFetch(`/profiles/me/work-experience/${id}`, { method: "DELETE" });
      setWorkExperiences(workExperiences.filter((w) => w.id !== id));
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

  async function handleAddCompetency(e) {
    e.preventDefault();
    if (!selectedCompetencyId) return;


    if (trainerCompetencies.some(tc => tc.competencyId === selectedCompetencyId)) {
      alert("Competency already added to profile!");
      return;
    }

    try {
      const res = await apiFetch("/profiles/me/competencies", {
        method: "POST",
        body: JSON.stringify({ competencyId: selectedCompetencyId }),
      });


      const profileRes = await apiFetch("/profiles/me");
      if (profileRes.data) {
        setTrainerCompetencies(profileRes.data.trainerCompetencies || []);
      }
      setSelectedCompetencyId("");
    } catch (e) {
      console.error(e);
      alert("Failed to add competency.");
    }
  }

  async function handleRemoveCompetency(id) {
    setActionId(id);
    try {
      await apiFetch(`/profiles/me/competencies/${id}`, { method: "DELETE" });
      setTrainerCompetencies(trainerCompetencies.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="page-header flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Configure Trainer Profile</h1>
          <p className="page-subtitle">Configure qualifications, skills, experiences, and competencies.</p>
        </div>
        <Link href="/trainer" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="space-y-6 md:col-span-1">
          <div className="card border border-border p-6 bg-card">
            <h2 className="font-bold text-sm text-foreground mb-4">Basic Details</h2>
            <form onSubmit={handleSaveBase} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input text-sm w-full"
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input text-sm w-full"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="textarea text-sm w-full"
                  placeholder="Short description of your teaching experience and research..."
                />
              </div>
              <button
                type="submit"
                disabled={savingBase}
                className="btn-primary btn-sm w-full"
              >
                {savingBase ? "Saving..." : "Save Details"}
              </button>
            </form>
          </div>
        </div>


        <div className="space-y-6 md:col-span-2">

          <div className="card border border-border p-6 bg-card space-y-4">
            <h2 className="font-bold text-sm text-foreground">Qualifications & Degrees</h2>

            {qualifications.length > 0 && (
              <div className="space-y-2.5 mb-4">
                {qualifications.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3.5 bg-card border border-border rounded-xl text-xs hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-foreground">{q.degree}</p>
                      <p className="text-muted-foreground">{q.institution} ({q.year})</p>
                    </div>
                    <button
                      onClick={() => handleRemoveQual(q.id)}
                      disabled={actionId === q.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0"
                      title="Remove"
                    >
                      {actionId === q.id ? "..." : "✕"}
                    </button>
                  </div>
                ))}
              </div>
            )}


            <form onSubmit={handleAddQual} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="label text-xs">Degree / Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D. Climatology"
                  required
                  value={newQual.degree}
                  onChange={(e) => setNewQual({ ...newQual, degree: e.target.value })}
                  className="input text-xs w-full py-1.5"
                />
              </div>
              <div>
                <label className="label text-xs">Institution</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Delhi"
                  required
                  value={newQual.institution}
                  onChange={(e) => setNewQual({ ...newQual, institution: e.target.value })}
                  className="input text-xs w-full py-1.5"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="label text-xs">Year</label>
                  <input
                    type="number"
                    placeholder="2024"
                    required
                    min="1950"
                    max="2100"
                    value={newQual.year}
                    onChange={(e) => setNewQual({ ...newQual, year: e.target.value })}
                    className="input text-xs w-full py-1.5"
                  />
                </div>
                <button type="submit" className="btn-primary text-xs py-1.5 px-3 mb-0.5">
                  Add
                </button>
              </div>
            </form>
          </div>


          <div className="card border border-border p-6 bg-card space-y-4">
            <h2 className="font-bold text-sm text-foreground">Work Experience</h2>

            {workExperiences.length > 0 && (
              <div className="space-y-2.5 mb-4">
                {workExperiences.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3.5 bg-card border border-border rounded-xl text-xs hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-foreground">{w.role}</p>
                      <p className="text-muted-foreground">
                        {w.organization} ({new Date(w.startDate).toLocaleDateString()} –{" "}
                        {w.endDate ? new Date(w.endDate).toLocaleDateString() : "Present"})
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveExp(w.id)}
                      disabled={actionId === w.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0"
                      title="Remove"
                    >
                      {actionId === w.id ? "..." : "✕"}
                    </button>
                  </div>
                ))}
              </div>
            )}


            <form onSubmit={handleAddExp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Role / Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Professor"
                  required
                  value={newExp.role}
                  onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                  className="input text-xs w-full py-1.5"
                />
              </div>
              <div>
                <label className="label text-xs">Organization</label>
                <input
                  type="text"
                  placeholder="e.g. IMD Pune"
                  required
                  value={newExp.organization}
                  onChange={(e) => setNewExp({ ...newExp, organization: e.target.value })}
                  className="input text-xs w-full py-1.5"
                />
              </div>
              <div>
                <label className="label text-xs">Start Date</label>
                <input
                  type="date"
                  required
                  value={newExp.startDate}
                  onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                  className="input text-xs w-full py-1.5"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="label text-xs">End Date (optional)</label>
                  <input
                    type="date"
                    value={newExp.endDate}
                    onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                    className="input text-xs w-full py-1.5"
                  />
                </div>
                <button type="submit" className="btn-primary text-xs py-1.5 px-3 mb-0.5">
                  Add
                </button>
              </div>
            </form>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div className="card border border-border p-6 bg-card space-y-4">
              <h2 className="font-bold text-sm text-foreground">Skills</h2>


              <div className="flex flex-wrap gap-1.5">
                {skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No skills added yet.</p>
                ) : (
                  skills.map((s) => (
                    <span key={s.id} className="badge bg-muted/60 border border-border text-[10px] py-1 px-2 pr-1.5 flex items-center gap-1">
                      {s.name}
                      <button
                        onClick={() => handleRemoveSkill(s.id)}
                        className="text-red-500 hover:text-red-600 font-bold ml-0.5 text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-red-500/10"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>


              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Python, Weather Forecasting"
                  required
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="input text-xs flex-1 py-1.5"
                />
                <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                  Add
                </button>
              </form>
            </div>


            <div className="card border border-border p-6 bg-card space-y-4">
              <h2 className="font-bold text-sm text-foreground">My Competencies</h2>


              <div className="flex flex-wrap gap-1.5">
                {trainerCompetencies.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No competencies added yet.</p>
                ) : (
                  trainerCompetencies.map((tc) => (
                    <span key={tc.id} className="badge bg-primary/10 border border-primary/20 text-primary text-[10px] py-1 px-2 pr-1.5 flex items-center gap-1">
                      {tc.competency?.name || "Competency"}
                      <button
                        onClick={() => handleRemoveCompetency(tc.id)}
                        disabled={actionId === tc.id}
                        className="text-primary-600 hover:text-primary font-bold ml-0.5 text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-primary-600/10"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>


              <form onSubmit={handleAddCompetency} className="flex gap-2">
                <select
                  required
                  value={selectedCompetencyId}
                  onChange={(e) => setSelectedCompetencyId(e.target.value)}
                  className="input select text-xs flex-1 py-1.5"
                >
                  <option value="">Select Competency...</option>
                  {allCompetencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                  Add
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
