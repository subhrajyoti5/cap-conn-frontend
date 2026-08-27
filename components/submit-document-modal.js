"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { submitDocumentAssessment, uploadAssessmentFilePipeline } from "@/features/assessments/api/assessments.api";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Paperclip,
  Download,
  Upload,
  X,
  Send,
} from "lucide-react";

export function SubmitDocumentModal({ assessment, submission, onClose, onSuccess }) {
  const { getToken } = useAuth();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState(submission?.notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isDeadlinePassed = assessment?.deadline
    ? new Date(assessment.deadline) < new Date()
    : false;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !submission) {
      setError("Please select a document file to submit.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = await getToken();
      if (!token) {
        setError("You must be logged in to submit assignments.");
        setSubmitting(false);
        return;
      }

      let uploadedKey = submission?.fileUrl || null;
      let uploadedName = submission?.fileName || null;

      if (file) {
        const uploadRes = await uploadAssessmentFilePipeline(token, {
          courseId: assessment.courseId,
          file,
        });
        uploadedKey = uploadRes.storageKey;
        uploadedName = uploadRes.fileName;
      }

      await submitDocumentAssessment(token, assessment.id, {
        fileUrl: uploadedKey,
        fileName: uploadedName,
        notes: notes.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error submitting document assignment:", err);
      setError(err?.message || "Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!assessment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border/80 shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div>
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>{assessment?.title || "Assignment Submission"}</span>
            </h2>
            {assessment?.deadline && (
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className={isDeadlinePassed ? "text-rose-600 font-semibold" : "text-primary font-medium"}>
                  {isDeadlinePassed ? "Deadline Passed" : "Due by"}
                </span>
                <span>{new Date(assessment.deadline).toLocaleString()}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/30 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Assignment document submitted successfully!</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Assignment Description & Reference Attachment */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-2">
            <h3 className="font-bold text-foreground text-xs">Assignment Instructions</h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {assessment?.description || "No specific instructions provided. Follow the attached brief."}
            </p>

            {assessment?.fileName && (
              <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between bg-card p-2.5 rounded-lg border border-border/80">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-4 h-4 text-primary shrink-0" />
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
                    className="btn-secondary text-[10px] px-2.5 py-1 shrink-0 ml-2 font-semibold flex items-center gap-1"
                    onClick={(e) => {
                      if (!assessment.fileUrl.startsWith("http")) {
                        window.open(`/api/resources/download?key=${encodeURIComponent(assessment.fileUrl)}`, "_blank");
                      }
                    }}
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Brief</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* If Graded: Show Score & Teacher Feedback */}
          {submission?.status === "GRADED" && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">Grade & Assessment Result</span>
                <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg">
                  {submission.score} / {assessment?.totalMarks} Marks
                </span>
              </div>
              {submission.feedback && (
                <div className="pt-2 border-t border-emerald-500/20">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-[11px] mb-0.5">Trainer Feedback:</p>
                  <p className="text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed">{submission.feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Existing Submission Status */}
          {submission && (
            <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Current Submission</span>
                <span
                  className={`badge text-[9px] font-bold uppercase tracking-wider ${
                    submission.status === "GRADED"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-primary/10 text-primary border-primary/20"
                  }`}
                >
                  {submission.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground pt-1">
                <FileText className="w-4 h-4 text-primary shrink-0" />
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
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-border/70">
              <p className="font-semibold text-foreground">
                {submission ? "Update / Re-submit Your Answer Document" : "Upload Your Answer Document"}
              </p>

              <div className="border border-dashed border-border/80 rounded-xl p-4 text-center bg-muted/5 hover:bg-muted/10 transition-colors">
                {file ? (
                  <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border/80">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-5 h-5 text-primary shrink-0" />
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
                      className="text-xs text-rose-600 hover:underline ml-3 shrink-0 font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
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
                <label className="label text-xs font-semibold">Additional Submission Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field text-xs w-full"
                  placeholder="Notes or instructions for the instructor..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="btn-secondary text-xs py-2 px-4 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-5 font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Submitting..." : submission ? "Update Submission" : "Submit Assignment"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs text-center font-medium">
              Deadline for this assignment has passed. Submissions are closed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
