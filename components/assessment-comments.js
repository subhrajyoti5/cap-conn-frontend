"use client";

import { useEffect, useState } from "react";
import {
  getAssessmentComments,
  submitAssessmentComment,
} from "@/features/feedback/api/feedback.api";

export function AssessmentComments({ assessmentId, token, user, isEnrolled }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isGrievance, setIsGrievance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!assessmentId || !token) return;
    try {
      const res = await getAssessmentComments(token, assessmentId);
      if (res.data) {
        setComments(res.data || []);
      }
    } catch (e) {
      console.error("Error loading assessment comments:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [assessmentId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await submitAssessmentComment(token, assessmentId, {
        comment: commentText.trim(),
        isGrievance,
      });
      setCommentText("");
      setIsGrievance(false);
      load();
    } catch (e) {
      console.error("Error submitting assessment comment:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-border space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
          <span>📢 Class Doubts & Grievance Submissions</span>
          <span className="badge bg-primary/10 text-primary border-primary/20 text-[9px] font-mono">
            {comments.length}
          </span>
        </h4>
      </div>

      {/* Submission form */}
      {(isEnrolled || user?.role === "TRAINER" || user?.role === "ADMIN") && (
        <form onSubmit={handleSubmit} className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Ask a question, post a clarification, or submit a grievance regarding this assessment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input text-xs flex-1 py-1.5"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs py-1.5 px-3 font-semibold shrink-0"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted-foreground flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isGrievance}
                onChange={(e) => setIsGrievance(e.target.checked)}
                className="rounded border-border text-red-600 focus:ring-red-500"
              />
              <span className={isGrievance ? "font-bold text-red-600 dark:text-red-400" : ""}>
                Mark as Formal Grievance / Discrepancy Flag
              </span>
            </label>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <p className="text-[11px] text-muted-foreground animate-pulse">Loading discussion stream...</p>
      ) : comments.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">No comments or grievances posted yet.</p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                c.isGrievance
                  ? "bg-red-500/10 border-red-500/20 text-foreground"
                  : "bg-card border-border/60"
              }`}
            >
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{c.user?.name || c.user?.email}</span>
                  <span className="badge text-[8px] uppercase font-mono px-1 py-0 bg-muted text-muted-foreground">
                    {c.user?.role}
                  </span>
                  {c.isGrievance && (
                    <span className="badge bg-red-500/20 text-red-600 border-red-500/30 text-[8px] font-bold uppercase">
                      Grievance
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-[9px]">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{c.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
