"use client";

import { useEffect, useState } from "react";
import {
  getResourceFeedback,
  submitResourceFeedback,
} from "@/features/feedback/api/feedback.api";

export function ResourceComments({ resourceId, token, user, isEnrolled }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!resourceId || !token) return;
    try {
      const res = await getResourceFeedback(token, resourceId);
      if (res.data) {
        setFeedbacks(res.data.feedbacks || []);
        setAvgRating(res.data.avgRating || 0);
        setTotalCount(res.data.totalCount || 0);

        const myFeedback = res.data.feedbacks?.find((f) => f.userId === user?.id);
        if (myFeedback) {
          setRating(myFeedback.rating);
          setComment(myFeedback.comment || "");
        }
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
    setSubmitting(true);
    try {
      await submitResourceFeedback(token, resourceId, {
        rating: Number(rating),
        comment,
      });
      load();
    } catch (e) {
      console.error("Error submitting resource feedback:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-border space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
          <span>💬 Material Feedback & Class Notes</span>
          <span className="badge bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-mono">
            ⭐ {avgRating} ({totalCount})
          </span>
        </h4>
      </div>

      {/* Submission form for enrolled trainees */}
      {user?.role === "TRAINEE" && isEnrolled && (
        <form onSubmit={handleSubmit} className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-semibold">Rate material:</span>
            <div className="flex items-center gap-1 text-base cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={star <= rating ? "text-amber-500" : "text-muted-foreground/40"}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a class comment or note on this study material..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input text-xs flex-1 py-1.5"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs py-1.5 px-3 font-semibold shrink-0"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      )}

      {/* Feedbacks list */}
      {loading ? (
        <p className="text-[11px] text-muted-foreground animate-pulse">Loading comments...</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">No class comments posted for this material yet.</p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {feedbacks.map((f) => (
            <div key={f.id} className="p-2.5 rounded-lg border border-border/60 bg-card text-xs space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-foreground">{f.user?.name || f.user?.email}</span>
                <div className="flex items-center gap-1">
                  <span className="text-amber-500 font-bold font-mono">{"★".repeat(f.rating)}</span>
                  <span className="text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {f.comment && <p className="text-muted-foreground text-[11px] leading-relaxed">{f.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
