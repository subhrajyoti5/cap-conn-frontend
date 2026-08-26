"use client";

import { useEffect, useState } from "react";
import {
  getAssessment,
  submitDocumentAssessment,
  uploadAssessmentFilePipeline,
} from "@/features/assessments/api/assessments.api";

export function SubmitDocumentModal({
  isOpen,
  onClose,
  assessmentId,
  courseId,
  token,
  onSubmitted,
}) {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen || !assessmentId || !token) return;

    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError("");
      setSuccess("");
      setFile(null);
      setNotes("");

      try {
        const res = await getAssessment(token, assessmentId);
        if (!isMounted) return;
        const assessData = res.data;
        setAssessment(assessData);
        if (assessData.mySubmission) {
          setSubmission(assessData.mySubmission);
          setNotes(assessData.mySubmission.notes || "");
        } else {
          setSubmission(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load assignment details");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, assessmentId, token]);

  if (!isOpen) return null;

  const isDeadlinePassed = assessment?.deadline
    ? new Date() > new Date(assessment.deadline)
    : false;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !submission?.fileUrl) {
      setError("Please select a document file to upload.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let finalFileUrl = submission?.fileUrl;
      let finalFileName = submission?.fileName;

      if (file) {
        const uploaded = await uploadAssessmentFilePipeline(token, {
          courseId,
          file,
        });
        finalFileUrl = uploaded.storageKey;
        finalFileName = uploaded.fileName;
      }

      const res = await submitDocumentAssessment(token, assessmentId, {
        fileUrl: finalFileUrl,
        fileName: finalFileName,
        notes: notes.trim() || null,
      });

      setSubmission(res.data);
      setSuccess("Your assignment has been submitted successfully!");
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const getDownloadUrl = (storageKey) => {
    if (!storageKey) return "#";
    if (storageKey.startsWith("http")) return storageKey;
    // R2 direct endpoint proxy or api endpoint can be used, or opens directly if URL
    return `/api/resources/download?key=${encodeURIComponent(storageKey)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span>📄</span>
              {assessment?.title || "Assignment Submission"}
            </h2>
            {assessment?.deadline && (
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span className={isDeadlinePassed ? "text-destructive font-semibold" : "text-primary font-medium"}>
                  {isDeadlinePassed ? "⚠️ Deadline Passed" : "🕒 Due by"}
                </span>
                <span>{new Date(assessment.deadline).toLocaleString()}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs border border-emerald-500/20 flex items-center gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading assignment details...
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            {/* Assignment Brief & Teacher Attached File */}
            <div className="p-4 rounded-xl bg-muted/15 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs">Assignment Instructions</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                  Max Marks: {assessment?.totalMarks}
                </span>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {assessment?.description || "No specific instructions provided. Follow the attached brief."}
              </p>

              {assessment?.fileName && (
                <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between bg-card p-2.5 rounded-lg border border-border">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">📎</span>
                    <div className="truncate">
                      <p className="font-medium text-foreground truncate">{assessment.fileName}</p>
                      <p className="text-[9px] text-muted-foreground">Teacher Reference Document</p>
                    </div>
                  </div>
                  {assessment.fileUrl && (
                    <a
                      href={assessment.fileUrl.startsWith("http") ? assessment.fileUrl : `#`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary btn-sm text-[10px] px-2.5 py-1 shrink-0 ml-2"
                      onClick={(e) => {
                        if (!assessment.fileUrl.startsWith("http")) {
                          // download via storage key
                          window.open(`/api/resources/download?key=${encodeURIComponent(assessment.fileUrl)}`, "_blank");
                        }
                      }}
                    >
                      Download Brief ⬇
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* If Graded: Show Score & Teacher Feedback */}
            {submission?.status === "GRADED" && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 text-xs">Grade & Assessment Result</span>
                  <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg">
                    {submission.score} / {assessment?.totalMarks} Marks
                  </span>
                </div>
                {submission.feedback && (
                  <div className="pt-2 border-t border-emerald-500/20">
                    <p className="font-semibold text-emerald-800 text-[11px] mb-0.5">Trainer Feedback:</p>
                    <p className="text-emerald-950 text-xs leading-relaxed">{submission.feedback}</p>
                  </div>
                )}
                {submission.gradedAt && (
                  <p className="text-[9px] text-emerald-600">
                    Graded on {new Date(submission.gradedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Existing Submission Status */}
            {submission && (
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Current Submission</span>
                  <span
                    className={`badge text-[9px] font-bold uppercase tracking-wider ${
                      submission.status === "GRADED"
                        ? "badge-success"
                        : "badge-primary"
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground pt-1">
                  <span>📄</span>
                  <span className="font-medium text-foreground">{submission.fileName || "Submitted Document"}</span>
                  {submission.submittedAt && (
                    <span className="text-[10px] ml-auto">
                      Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {submission.notes && (
                  <p className="text-[10px] text-muted-foreground italic bg-muted/20 p-2 rounded-lg mt-1">
                    &ldquo;{submission.notes}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Upload & Submission Form */}
            {!isDeadlinePassed ? (
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-border">
                <p className="font-semibold text-foreground">
                  {submission ? "Update / Re-submit Your Answer Document" : "Upload Your Answer Document"}
                </p>

                <div className="border border-dashed border-border rounded-xl p-4 text-center bg-muted/5 hover:bg-muted/10 transition-colors">
                  {file ? (
                    <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-lg">📄</span>
                        <div className="text-left truncate">
                          <p className="font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-xs text-destructive hover:underline ml-3 shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 text-base">
                        ⬆
                      </div>
                      <p className="font-medium text-foreground text-xs">
                        Click or drag to upload answer doc (PDF, Word, etc.)
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Accepts .pdf, .doc, .docx, .txt (up to 50MB)
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.zip"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Submission Notes (Optional)
                  </label>
                  <textarea
                    className="input w-full min-h-[60px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any comments or explanatory notes for the trainer..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="btn-secondary text-xs py-2 px-3.5"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs py-2 px-4 shadow-sm"
                    disabled={submitting || (!file && !submission?.fileUrl)}
                  >
                    {submitting ? "Uploading & Submitting..." : submission ? "Update Submission" : "Submit Assignment"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-muted/20 border border-border rounded-xl text-center text-muted-foreground">
                The deadline for this assignment has passed. No further submissions or re-submissions can be made.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
