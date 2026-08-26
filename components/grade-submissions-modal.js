"use client";

import { useEffect, useState } from "react";
import {
  getAssessment,
  listSubmissions,
  gradeSubmission,
} from "@/features/assessments/api/assessments.api";

export function GradeSubmissionsModal({
  isOpen,
  onClose,
  assessmentId,
  token,
  onGraded,
}) {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [assessRes, subsRes] = await Promise.all([
        getAssessment(token, assessmentId),
        listSubmissions(token, assessmentId),
      ]);
      setAssessment(assessRes.data);
      const subList = subsRes.data || [];
      setSubmissions(subList);
      if (subList.length > 0 && !selectedSub) {
        setSelectedSub(subList[0]);
        setScoreInput(subList[0].score !== null && subList[0].score !== undefined ? String(subList[0].score) : "");
        setFeedbackInput(subList[0].feedback || "");
      }
    } catch (err) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen || !assessmentId || !token) return;
    loadData();
  }, [isOpen, assessmentId, token]);

  const handleSelectSubmission = (sub) => {
    setSelectedSub(sub);
    setScoreInput(sub.score !== null && sub.score !== undefined ? String(sub.score) : "");
    setFeedbackInput(sub.feedback || "");
    setError("");
    setSuccess("");
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setError("");
    setSuccess("");

    const scoreNum = Number(scoreInput);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setError("Please enter a valid non-negative score.");
      return;
    }
    if (assessment?.totalMarks && scoreNum > assessment.totalMarks) {
      setError(`Score cannot exceed maximum marks (${assessment.totalMarks}).`);
      return;
    }

    setGrading(true);
    try {
      await gradeSubmission(token, assessmentId, selectedSub.id, {
        score: scoreNum,
        feedback: feedbackInput.trim() || null,
      });

      setSuccess("Grade and feedback saved successfully!");
      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSub.id
            ? {
                ...s,
                score: scoreNum,
                feedback: feedbackInput.trim() || null,
                status: "GRADED",
                gradedAt: new Date().toISOString(),
              }
            : s
        )
      );
      setSelectedSub((prev) => ({
        ...prev,
        score: scoreNum,
        feedback: feedbackInput.trim() || null,
        status: "GRADED",
      }));

      if (onGraded) onGraded();
    } catch (err) {
      setError(err.message || "Failed to save grade");
    } finally {
      setGrading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span>📝</span>
              Grade Submissions — {assessment?.title}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Total Marks: <strong>{assessment?.totalMarks}</strong> · {submissions.length} Submissions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            ✕
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
            <div className="w-full py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              No trainees have submitted this assignment yet.
            </div>
          ) : (
            <>
              {/* Left Column: Submissions List */}
              <div className="w-full md:w-5/12 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                <p className="font-semibold text-foreground mb-2">Trainee Submissions</p>
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
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:bg-muted/20 bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground truncate">
                          {sub.trainee?.name || sub.trainee?.email || "Trainee"}
                        </span>
                        <span
                          className={`badge text-[9px] font-bold uppercase tracking-wider ${
                            isGraded ? "badge-success" : "badge-neutral"
                          }`}
                        >
                          {isGraded ? `${sub.score}/${assessment?.totalMarks}` : "Ungraded"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {sub.trainee?.email}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-1.5 border-t border-border/50">
                        <span className="truncate">📄 {sub.fileName || "Doc attached"}</span>
                        <span>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "—"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Grading Form & Document Inspector */}
              <div className="w-full md:w-7/12 flex flex-col justify-between border border-border rounded-xl p-5 bg-muted/10 space-y-4">
                {selectedSub ? (
                  <form onSubmit={handleSaveGrade} className="space-y-4">
                    <div className="border-b border-border pb-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {selectedSub.trainee?.name || selectedSub.trainee?.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Submitted on {selectedSub.submittedAt ? new Date(selectedSub.submittedAt).toLocaleString() : "—"}
                        </p>
                      </div>
                      <span
                        className={`badge text-[10px] font-bold uppercase ${
                          selectedSub.status === "GRADED" ? "badge-success" : "badge-primary"
                        }`}
                      >
                        {selectedSub.status}
                      </span>
                    </div>

                    {/* Submitted File View & Download */}
                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
                      <p className="font-semibold text-foreground text-xs">Attached Answer Document</p>
                      <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border border-border">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-lg">📄</span>
                          <div className="truncate">
                            <p className="font-medium text-foreground truncate">
                              {selectedSub.fileName || "Trainee Submission Document"}
                            </p>
                            <p className="text-[9px] text-muted-foreground">Click to inspect or download</p>
                          </div>
                        </div>
                        {selectedSub.fileUrl && (
                          <a
                            href={selectedSub.fileUrl.startsWith("http") ? selectedSub.fileUrl : `#`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary btn-sm text-[10px] px-3 py-1 shrink-0 ml-2"
                            onClick={(e) => {
                              if (!selectedSub.fileUrl.startsWith("http")) {
                                window.open(`/api/resources/download?key=${encodeURIComponent(selectedSub.fileUrl)}`, "_blank");
                              }
                            }}
                          >
                            Download Document ⬇
                          </a>
                        )}
                      </div>

                      {selectedSub.notes && (
                        <div className="pt-2">
                          <p className="font-semibold text-muted-foreground text-[10px]">Trainee Notes:</p>
                          <p className="text-foreground bg-muted/20 p-2 rounded-lg mt-0.5 text-xs italic">
                            &ldquo;{selectedSub.notes}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs border border-emerald-500/20">
                        {success}
                      </div>
                    )}

                    {/* Grading Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="block font-semibold text-foreground mb-1">
                          Score (out of {assessment?.totalMarks}) <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={assessment?.totalMarks}
                          className="input w-full font-bold text-sm"
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                          placeholder="e.g. 85"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-foreground mb-1">
                          Grading Feedback / Comments
                        </label>
                        <textarea
                          className="input w-full min-h-[70px]"
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="Provide constructive feedback, notes on corrections or strengths..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                      <button
                        type="submit"
                        className="btn-primary text-xs py-2 px-4 shadow-sm"
                        disabled={grading}
                      >
                        {grading ? "Saving Grade..." : "Submit Grade & Notify Trainee"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="m-auto text-center text-muted-foreground py-10">
                    Select a submission from the list to view and grade.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
