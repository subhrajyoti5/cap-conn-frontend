"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import {
  listSubmissions,
  gradeSubmission,
} from "@/features/assessments/api/assessments.api";
import { FileText, CheckCircle2, Download, Save, X } from "lucide-react";

export function GradeSubmissionsModal({ assessment, onClose, onSuccess }) {
  const { getToken } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!assessment?.id) return;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = await getToken();
        const res = await listSubmissions(token, assessment.id);
        const list = res.data || [];
        setSubmissions(list);
        if (list.length > 0) {
          handleSelectSubmission(list[0]);
        }
      } catch (e) {
        console.error("Error loading submissions:", e);
        setError("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assessment?.id, getToken]);

  const handleSelectSubmission = (sub) => {
    setSelectedSub(sub);
    setScore(sub.score !== null && sub.score !== undefined ? sub.score.toString() : "");
    setFeedback(sub.feedback || "");
    setError("");
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > assessment.totalMarks) {
      setError(`Score must be a number between 0 and ${assessment.totalMarks}.`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = await getToken();
      await gradeSubmission(token, assessment.id, selectedSub.id, {
        score: numScore,
        feedback: feedback.trim(),
      });

      setToast("Grade saved successfully!");
      setTimeout(() => setToast(""), 3000);

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSub.id
            ? { ...s, score: numScore, feedback: feedback.trim(), status: "GRADED" }
            : s
        )
      );

      setSelectedSub((prev) =>
        prev
          ? { ...prev, score: numScore, feedback: feedback.trim(), status: "GRADED" }
          : null
      );

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to grade submission:", err);
      setError(err?.message || "Failed to save grade.");
    } finally {
      setSaving(false);
    }
  };

  if (!assessment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-border/80 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card">
          <div>
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Grade Submissions — {assessment?.title}</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Total Marks: <strong className="text-foreground">{assessment?.totalMarks}</strong> · {submissions.length} Submissions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 text-xs">
          {loading ? (
            <div className="w-full py-16 text-center text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="w-full py-16 text-center text-muted-foreground border border-dashed border-border/80 rounded-xl">
              No trainees have submitted this assignment yet.
            </div>
          ) : (
            <>
              {/* Left Column: Submissions List */}
              <div className="w-full md:w-5/12 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                <p className="font-bold text-foreground mb-2">Trainee Submissions</p>
                {submissions.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  const isGraded = sub.status === "GRADED";
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSubmission(sub)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border/80 hover:bg-muted/20 bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground truncate">
                          {sub.trainee?.name || sub.trainee?.email || "Trainee"}
                        </span>
                        <span
                          className={`badge text-[9px] font-bold uppercase tracking-wider ${
                            isGraded ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {isGraded ? `${sub.score}/${assessment?.totalMarks}` : "Ungraded"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {sub.trainee?.email}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-1.5 border-t border-border/50">
                        <span className="truncate flex items-center gap-1">
                          <FileText className="w-3 h-3 text-primary" />
                          <span>{sub.fileName || "Doc attached"}</span>
                        </span>
                        <span>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "—"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Grading Form & Document Inspector */}
              <div className="w-full md:w-7/12 flex flex-col justify-between border border-border/80 rounded-xl p-5 bg-muted/10 space-y-4">
                {selectedSub ? (
                  <form onSubmit={handleSaveGrade} className="space-y-4">
                    <div className="border-b border-border/70 pb-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {selectedSub.trainee?.name || "Trainee Submission"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Submitted on {selectedSub.submittedAt ? new Date(selectedSub.submittedAt).toLocaleString() : "—"}
                        </p>
                      </div>
                    </div>

                    {toast && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{toast}</span>
                      </div>
                    )}

                    {error && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-medium">
                        {error}
                      </div>
                    )}

                    {/* Document Download Link */}
                    {selectedSub.fileUrl && (
                      <div className="p-3 rounded-lg bg-card border border-border/80 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-medium text-foreground truncate">{selectedSub.fileName || "Trainee Submission File"}</span>
                        </div>
                        <a
                          href={
                            selectedSub.fileUrl.startsWith("http")
                              ? selectedSub.fileUrl
                              : `/api/resources/download?key=${encodeURIComponent(selectedSub.fileUrl)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-[10px] py-1 px-3 shadow-xs shrink-0 ml-2 font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Doc</span>
                        </a>
                      </div>
                    )}

                    {selectedSub.notes && (
                      <div>
                        <p className="font-semibold text-muted-foreground text-[10px] mb-0.5">Trainee Notes:</p>
                        <p className="p-2.5 rounded-lg bg-card border border-border/60 text-xs text-foreground italic">
                          &ldquo;{selectedSub.notes}&rdquo;
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="label text-xs font-semibold">
                        Score (Max: {assessment?.totalMarks} Marks)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={assessment?.totalMarks}
                        required
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="input-field text-xs w-full font-bold"
                        placeholder={`e.g. 85`}
                      />
                    </div>

                    <div>
                      <label className="label text-xs font-semibold">Trainer Feedback & Comments</label>
                      <textarea
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="input-field text-xs w-full"
                        placeholder="Detailed remarks on student work..."
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary text-xs py-2 px-5 font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? "Saving Grade..." : "Save Grade & Feedback"}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">Select a trainee submission to grade.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
