"use client";

import { useEffect, useState } from "react";
import {
  getResourceFeedback,
  submitResourceFeedback,
  updateResourceFeedback,
  deleteResourceFeedback,
} from "@/features/feedback/api/feedback.api";
import { MessageSquare, Star, Send, Trash2, Pencil, X, Check } from "lucide-react";

export function ResourceComments({ resourceId, token, user, isEnrolled }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  async function load() {
    if (!resourceId || !token) return;
    try {
      const res = await getResourceFeedback(token, resourceId);
      if (res.data) {
        setFeedbacks(res.data.feedbacks || []);
        setAvgRating(res.data.avgRating || 0);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (e) {
      console.error("Error loading resource feedback:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [resourceId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await submitResourceFeedback(token, resourceId, {
        rating: Number(rating),
        comment,
      });
      setComment("");
      load();
    } catch (e) {
      console.error("Error submitting resource feedback:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (f) => {
    setEditingId(f.id);
    setEditRating(f.rating);
    setEditComment(f.comment || "");
  };

  const handleSaveEdit = async (commentId) => {
    try {
      await updateResourceFeedback(token, commentId, {
        rating: Number(editRating),
        comment: editComment,
      });
      setEditingId(null);
      load();
    } catch (e) {
      console.error("Error updating resource comment:", e);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteResourceFeedback(token, commentId);
      load();
    } catch (e) {
      console.error("Error deleting resource comment:", e);
    }
  };

  return (
    <div className="pt-4 border-t border-border/80 space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <span>Material Discussion & Notes</span>
          <span className="badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-mono flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            <span>{avgRating} ({totalCount})</span>
          </span>
        </h4>
        <span className="text-[10px] text-muted-foreground font-mono">Multiple comments allowed</span>
      </div>

      {/* Submission form for enrolled trainees */}
      {user?.role === "TRAINEE" && isEnrolled && (
        <form onSubmit={handleSubmit} className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">Rate material:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-0.5 focus:outline-none"
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-colors ${
                      star <= rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30 hover:text-amber-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Post a note or comment on this study material..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field text-xs flex-1 py-1.5 bg-card border-border/80 focus:border-primary"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="btn-primary text-xs py-1.5 px-3 font-medium shrink-0 flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <span>{submitting ? "Posting..." : "Post Note"}</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      )}

      {/* Feedbacks list */}
      {loading ? (
        <p className="text-[11px] text-muted-foreground animate-pulse">Loading notes...</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">No class notes posted for this material yet.</p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {feedbacks.map((f) => {
            const isOwner = f.userId === user?.id;
            const isEditing = editingId === f.id;

            return (
              <div key={f.id} className="p-2.5 rounded-lg border border-border/70 bg-card text-xs space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-foreground">{f.user?.name || f.user?.email}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-2.5 h-2.5 ${
                            star <= (isEditing ? editRating : f.rating)
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground font-mono">{new Date(f.createdAt).toLocaleDateString()}</span>
                    {isOwner && !isEditing && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(f)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
                          className="text-muted-foreground hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="input-field text-xs py-1 px-2 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(f.id)}
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
                ) : (
                  f.comment && <p className="text-muted-foreground text-[11px] leading-relaxed">{f.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
