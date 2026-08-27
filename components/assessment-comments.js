"use client";

import { useEffect, useState } from "react";
import {
  getAssessmentComments,
  submitAssessmentComment,
  updateAssessmentComment,
  deleteAssessmentComment,
} from "@/features/feedback/api/feedback.api";
import { MessageCircle, AlertTriangle, Send, ShieldAlert, Trash2, Pencil, Check, X } from "lucide-react";

export function AssessmentComments({ assessmentId, token, user, isEnrolled }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isGrievance, setIsGrievance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editGrievance, setEditGrievance] = useState(false);

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

  const handleStartEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.comment || "");
    setEditGrievance(Boolean(c.isGrievance));
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await updateAssessmentComment(token, commentId, {
        comment: editText.trim(),
        isGrievance: editGrievance,
      });
      setEditingId(null);
      load();
    } catch (e) {
      console.error("Error updating comment:", e);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteAssessmentComment(token, commentId);
      load();
    } catch (e) {
      console.error("Error deleting comment:", e);
    }
  };

  return (
    <div className="pt-4 border-t border-border/80 space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-primary" />
          <span>Class Doubts & Discrepancies</span>
          <span className="badge bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono">
            {comments.length}
          </span>
        </h4>
      </div>

      {/* Submission form */}
      {(isEnrolled || user?.role === "TRAINER" || user?.role === "ADMIN") && (
        <form onSubmit={handleSubmit} className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Ask a question, request clarification, or report a question discrepancy..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field text-xs flex-1 py-1.5 bg-card border-border/80 focus:border-primary"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs py-1.5 px-3.5 font-medium shrink-0 flex items-center gap-1 shadow-xs"
            >
              <span>{submitting ? "Posting..." : "Post"}</span>
              <Send className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted-foreground flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isGrievance}
                onChange={(e) => setIsGrievance(e.target.checked)}
                className="rounded border-border text-rose-600 focus:ring-rose-500"
              />
              <span className={isGrievance ? "font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1" : "flex items-center gap-1"}>
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span>Mark as Formal Grievance / Discrepancy Flag</span>
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
          {comments.map((c) => {
            const isOwner = c.userId === user?.id || user?.role === "ADMIN";
            const isEditing = editingId === c.id;

            return (
              <div
                key={c.id}
                className={`p-2.5 rounded-lg border text-xs space-y-1 shadow-2xs ${
                  c.isGrievance
                    ? "bg-rose-500/5 border-rose-500/30 text-foreground"
                    : "bg-card border-border/70"
                }`}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{c.user?.name || c.user?.email}</span>
                    <span className="badge text-[8px] uppercase font-mono px-1 py-0 bg-muted/80 text-muted-foreground">
                      {c.user?.role}
                    </span>
                    {c.isGrievance && (
                      <span className="badge bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[8px] font-bold uppercase flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        <span>Grievance</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[9px] font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    {isOwner && !isEditing && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(c)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="text-muted-foreground hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input-field text-xs py-1 px-2 w-full"
                    />
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={editGrievance}
                          onChange={(e) => setEditGrievance(e.target.checked)}
                          className="rounded text-rose-600"
                        />
                        <span>Grievance Flag</span>
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(c.id)}
                          className="text-emerald-600 hover:text-emerald-700 p-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{c.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
