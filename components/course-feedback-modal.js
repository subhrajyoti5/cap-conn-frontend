"use client";

import { useEffect, useState } from "react";
import {
  getCourseFeedback,
  submitCourseFeedback,
  submitTrainerFeedback,
  getTrainerCourseFeedback,
} from "@/features/feedback/api/feedback.api";

export function CourseFeedbackModal({ isOpen, onClose, course, token, user, isEnrolled }) {
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState({
    feedbacks: [],
    avgRating: 0,
    totalCount: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  // Course review state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [courseFeedbackStatus, setCourseFeedbackStatus] = useState("");

  // Trainer rating state
  const [selectedTrainerId, setSelectedTrainerId] = useState(course?.trainerId || "");
  const [trainerRating, setTrainerRating] = useState(5);
  const [trainerComment, setTrainerComment] = useState("");
  const [submittingTrainer, setSubmittingTrainer] = useState(false);
  const [trainerFeedbackStatus, setTrainerFeedbackStatus] = useState("");
  const [trainerFeedbacksList, setTrainerFeedbacksList] = useState([]);
  const [trainerAvgRating, setTrainerAvgRating] = useState(0);

  async function loadCourseFeedback() {
    if (!course?.id || !token) return;
    setLoading(true);
    try {
      const res = await getCourseFeedback(token, course.id);
      if (res.data) {
        setFeedbackData(res.data);

        // Find current user's existing course review
        const myReview = res.data.feedbacks?.find((f) => f.userId === user?.id);
        if (myReview) {
          setUserRating(myReview.rating);
          setUserComment(myReview.comment || "");
        }
      }
    } catch (e) {
      console.error("Error loading course feedback:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadTrainerFeedback(tId) {
    if (!course?.id || !tId || !token) return;
    try {
      const res = await getTrainerCourseFeedback(token, course.id, tId);
      if (res.data) {
        setTrainerFeedbacksList(res.data.items || []);
        setTrainerAvgRating(res.data.avgRating || 0);

        const myTReview = res.data.items?.find((f) => f.traineeId === user?.id);
        if (myTReview) {
          setTrainerRating(myTReview.rating);
          setTrainerComment(myTReview.comment || "");
        }
      }
    } catch (e) {
      console.error("Error loading trainer feedback:", e);
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadCourseFeedback();
      if (course?.trainerId) {
        setSelectedTrainerId(course.trainerId);
        loadTrainerFeedback(course.trainerId);
      }
    }
  }, [isOpen, course, token]);

  const handleTrainerChange = (tId) => {
    setSelectedTrainerId(tId);
    loadTrainerFeedback(tId);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setSubmittingCourse(true);
    setCourseFeedbackStatus("");
    try {
      await submitCourseFeedback(token, course.id, {
        rating: Number(userRating),
        comment: userComment,
      });
      setCourseFeedbackStatus("✅ Course review saved successfully!");
      loadCourseFeedback();
    } catch (e) {
      console.error(e);
      setCourseFeedbackStatus("❌ Failed to save review.");
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleTrainerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrainerId) return;
    setSubmittingTrainer(true);
    setTrainerFeedbackStatus("");
    try {
      await submitTrainerFeedback(token, course.id, selectedTrainerId, {
        rating: Number(trainerRating),
        comment: trainerComment,
      });
      setTrainerFeedbackStatus("✅ Instructor review saved successfully!");
      loadTrainerFeedback(selectedTrainerId);
    } catch (e) {
      console.error(e);
      setTrainerFeedbackStatus("❌ Failed to save instructor review.");
    } finally {
      setSubmittingTrainer(false);
    }
  };

  if (!isOpen) return null;

  const trainersList = [];
  if (course?.trainer) {
    trainersList.push({ ...course.trainer, roleLabel: "Lead Instructor" });
  }
  if (course?.trainers) {
    course.trainers.forEach((ct) => {
      if (ct.trainer && ct.trainer.id !== course.trainerId) {
        trainersList.push({ ...ct.trainer, roleLabel: "Co-Trainer" });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-elevated overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="font-display font-bold text-sm text-foreground">
              Course Reviews & Feedback
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Ratings and comments for {course?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-bold text-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
              Loading course reviews...
            </div>
          ) : (
            <>
              {/* Overall Ratings Summary Card */}
              <div className="bg-gradient-to-br from-primary/10 via-muted/20 to-card border border-primary/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold text-foreground">
                      {feedbackData.avgRating}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      / 5.0
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 my-1 text-amber-500 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= Math.round(feedbackData.avgRating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Based on {feedbackData.totalCount} student reviews
                  </span>
                </div>

                {/* Star Breakdown Bars */}
                <div className="w-full sm:w-60 space-y-1 text-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = feedbackData.breakdown[stars] || 0;
                    const pct =
                      feedbackData.totalCount > 0
                        ? (count / feedbackData.totalCount) * 100
                        : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-6 text-[10px] font-mono text-muted-foreground">
                          {stars}★
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-[10px] font-mono text-muted-foreground text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trainee Course Rating Submission Form */}
              {user?.role === "TRAINEE" && isEnrolled && (
                <form
                  onSubmit={handleCourseSubmit}
                  className="bg-card border border-border p-4 rounded-xl space-y-3"
                >
                  <h4 className="font-bold text-xs text-foreground">
                    Rate & Review This Course
                  </h4>

                  {courseFeedbackStatus && (
                    <p className="text-xs font-medium text-primary">
                      {courseFeedbackStatus}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">
                      Your Rating:
                    </span>
                    <div className="flex items-center gap-1 text-xl cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className={
                            star <= userRating
                              ? "text-amber-500"
                              : "text-muted-foreground/40"
                          }
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write your honest feedback on course content, pace, and organization..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="input text-xs w-full py-2 resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingCourse}
                      className="btn-primary text-xs py-1.5 px-4 font-semibold"
                    >
                      {submittingCourse ? "Submitting..." : "Submit Course Feedback"}
                    </button>
                  </div>
                </form>
              )}

              {/* Rate Individual Instructors Section */}
              <div className="border border-border p-4 rounded-xl bg-muted/10 space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <h4 className="font-bold text-xs text-foreground">
                    Rate Individual Instructors
                  </h4>
                  <span className="text-[10px] text-amber-500 font-bold font-mono">
                    ⭐ {trainerAvgRating} / 5.0
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs text-muted-foreground font-semibold shrink-0">
                    Select Instructor:
                  </label>
                  <select
                    value={selectedTrainerId}
                    onChange={(e) => handleTrainerChange(e.target.value)}
                    className="input text-xs py-1.5 flex-1 bg-card border-border"
                  >
                    {trainersList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.email} ({t.roleLabel})
                      </option>
                    ))}
                  </select>
                </div>

                {user?.role === "TRAINEE" && isEnrolled && (
                  <form onSubmit={handleTrainerSubmit} className="space-y-3 pt-2 border-t border-border/60">
                    {trainerFeedbackStatus && (
                      <p className="text-xs font-medium text-primary">
                        {trainerFeedbackStatus}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold">
                        Instructor Rating:
                      </span>
                      <div className="flex items-center gap-1 text-lg cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setTrainerRating(star)}
                            className={
                              star <= trainerRating
                                ? "text-amber-500"
                                : "text-muted-foreground/40"
                            }
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Feedback on instruction quality, responsiveness, or clarity..."
                      value={trainerComment}
                      onChange={(e) => setTrainerComment(e.target.value)}
                      className="input text-xs w-full py-1.5"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingTrainer}
                        className="btn-secondary text-xs py-1 px-3 font-semibold"
                      >
                        {submittingTrainer ? "Saving..." : "Submit Instructor Rating"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Student Feedback Reviews Stream */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                  Enrolled Student Reviews ({feedbackData.feedbacks.length})
                </h4>

                {feedbackData.feedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4">
                    No student reviews have been posted yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {feedbackData.feedbacks.map((f) => (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-xl border border-border bg-card space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                              {f.user?.name ? f.user.name[0].toUpperCase() : "S"}
                            </div>
                            <span className="font-bold text-foreground">
                              {f.user?.name || f.user?.email?.split("@")[0] || "Student"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-500 font-bold font-mono">
                              {"★".repeat(f.rating)}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-mono">
                              {new Date(f.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {f.comment && (
                          <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                            "{f.comment}"
                          </p>
                        )}
                      </div>
                    ))}
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
