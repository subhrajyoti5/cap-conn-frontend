"use client";

import { useEffect, useState } from "react";
import {
  getCourseFeedback,
  submitCourseFeedback,
  deleteCourseFeedback,
  submitTrainerFeedback,
  deleteTrainerFeedback,
  getTrainerCourseFeedback,
} from "@/features/feedback/api/feedback.api";
import {
  Star,
  MessageSquare,
  UserCheck,
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil,
} from "lucide-react";

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
  const [hasExistingCourseReview, setHasExistingCourseReview] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [courseFeedbackStatus, setCourseFeedbackStatus] = useState({ text: "", type: "" });

  // Trainer rating state
  const [selectedTrainerId, setSelectedTrainerId] = useState(course?.trainerId || "");
  const [trainerRating, setTrainerRating] = useState(5);
  const [trainerComment, setTrainerComment] = useState("");
  const [hasExistingTrainerReview, setHasExistingTrainerReview] = useState(false);
  const [submittingTrainer, setSubmittingTrainer] = useState(false);
  const [trainerFeedbackStatus, setTrainerFeedbackStatus] = useState({ text: "", type: "" });
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
          setHasExistingCourseReview(true);
        } else {
          setHasExistingCourseReview(false);
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
          setHasExistingTrainerReview(true);
        } else {
          setHasExistingTrainerReview(false);
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
    setCourseFeedbackStatus({ text: "", type: "" });
    try {
      await submitCourseFeedback(token, course.id, {
        rating: Number(userRating),
        comment: userComment,
      });
      setCourseFeedbackStatus({
        text: hasExistingCourseReview ? "Course review updated." : "Course evaluation submitted.",
        type: "success",
      });
      loadCourseFeedback();
    } catch (e) {
      console.error(e);
      setCourseFeedbackStatus({ text: "Failed to save course evaluation.", type: "error" });
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleCourseDelete = async () => {
    if (!confirm("Delete your course review?")) return;
    setSubmittingCourse(true);
    try {
      await deleteCourseFeedback(token, course.id);
      setUserRating(5);
      setUserComment("");
      setHasExistingCourseReview(false);
      setCourseFeedbackStatus({ text: "Course review deleted.", type: "success" });
      loadCourseFeedback();
    } catch (e) {
      console.error(e);
      setCourseFeedbackStatus({ text: "Failed to delete review.", type: "error" });
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleTrainerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrainerId) return;
    setSubmittingTrainer(true);
    setTrainerFeedbackStatus({ text: "", type: "" });
    try {
      await submitTrainerFeedback(token, course.id, selectedTrainerId, {
        rating: Number(trainerRating),
        comment: trainerComment,
      });
      setTrainerFeedbackStatus({
        text: hasExistingTrainerReview ? "Trainer evaluation updated." : "Trainer evaluation submitted.",
        type: "success",
      });
      loadTrainerFeedback(selectedTrainerId);
    } catch (e) {
      console.error(e);
      setTrainerFeedbackStatus({ text: "Failed to save trainer evaluation.", type: "error" });
    } finally {
      setSubmittingTrainer(false);
    }
  };

  const handleTrainerDelete = async () => {
    if (!selectedTrainerId || !confirm("Delete your trainer rating?")) return;
    setSubmittingTrainer(true);
    try {
      await deleteTrainerFeedback(token, course.id, selectedTrainerId);
      setTrainerRating(5);
      setTrainerComment("");
      setHasExistingTrainerReview(false);
      setTrainerFeedbackStatus({ text: "Trainer rating deleted.", type: "success" });
      loadTrainerFeedback(selectedTrainerId);
    } catch (e) {
      console.error(e);
      setTrainerFeedbackStatus({ text: "Failed to delete rating.", type: "error" });
    } finally {
      setSubmittingTrainer(false);
    }
  };

  if (!isOpen) return null;

  const trainersList = [];
  if (course?.trainer) {
    trainersList.push({ ...course.trainer, roleLabel: "Lead Trainer" });
  }
  if (course?.trainers) {
    course.trainers.forEach((ct) => {
      if (ct.trainer && ct.trainer.id !== course.trainerId) {
        trainersList.push({ ...ct.trainer, roleLabel: "Co-Trainer" });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Course & Trainer Evaluations</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Verified participant feedback for {course?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
              Loading evaluation data...
            </div>
          ) : (
            <>
              {/* Overall Ratings Summary Card */}
              <div className="bg-muted/20 border border-border/80 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold text-foreground">
                      {feedbackData.avgRating}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      / 5.0
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 my-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(feedbackData.avgRating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Based on {feedbackData.totalCount} participant evaluations
                  </span>
                </div>

                {/* Star Breakdown Bars */}
                <div className="w-full sm:w-56 space-y-1 text-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = feedbackData.breakdown[stars] || 0;
                    const pct =
                      feedbackData.totalCount > 0
                        ? (count / feedbackData.totalCount) * 100
                        : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-5 text-[10px] font-mono text-muted-foreground">
                          {stars}★
                        </span>
                        <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-5 text-[10px] font-mono text-muted-foreground text-right">
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
                  className="bg-card border border-border/80 p-4 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      <span>{hasExistingCourseReview ? "Update Course Review" : "Rate & Review Course Content"}</span>
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">1 review per course</span>
                  </div>

                  {courseFeedbackStatus.text && (
                    <div className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                      courseFeedbackStatus.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}>
                      {courseFeedbackStatus.type === "success" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{courseFeedbackStatus.text}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Course Rating:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              star <= userRating
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/30 hover:text-amber-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback on course content, materials, and delivery..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="input-field text-xs w-full py-2 resize-none border-border/80 focus:border-primary"
                  />

                  <div className="flex justify-between items-center pt-1">
                    {hasExistingCourseReview ? (
                      <button
                        type="button"
                        onClick={handleCourseDelete}
                        disabled={submittingCourse}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Review</span>
                      </button>
                    ) : <span />}

                    <button
                      type="submit"
                      disabled={submittingCourse}
                      className="btn-primary text-xs py-1.5 px-4 font-medium shadow-xs flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{submittingCourse ? "Saving..." : hasExistingCourseReview ? "Update Review" : "Submit Review"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Rate Individual Instructors Section */}
              <div className="border border-border/80 p-4 rounded-xl bg-muted/10 space-y-4">
                <div className="flex justify-between items-center border-b border-border/80 pb-2">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Trainer Evaluations</span>
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{trainerAvgRating} / 5.0</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs text-muted-foreground font-medium shrink-0">
                    Select Trainer:
                  </label>
                  <select
                    value={selectedTrainerId}
                    onChange={(e) => handleTrainerChange(e.target.value)}
                    className="input text-xs py-1.5 flex-1 bg-card border-border/80"
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
                    {trainerFeedbackStatus.text && (
                      <div className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                        trainerFeedbackStatus.type === "success"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                        {trainerFeedbackStatus.type === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{trainerFeedbackStatus.text}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        Trainer Rating:
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setTrainerRating(star)}
                            className="p-0.5 focus:outline-none"
                          >
                            <Star
                              className={`w-4 h-4 transition-colors ${
                                star <= trainerRating
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-muted-foreground/30 hover:text-amber-400"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Evaluate teaching effectiveness, clarity, and responsiveness..."
                      value={trainerComment}
                      onChange={(e) => setTrainerComment(e.target.value)}
                      className="input text-xs w-full py-1.5 border-border/80"
                    />

                    <div className="flex justify-between items-center">
                      {hasExistingTrainerReview ? (
                        <button
                          type="button"
                          onClick={handleTrainerDelete}
                          disabled={submittingTrainer}
                          className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Rating</span>
                        </button>
                      ) : <span />}

                      <button
                        type="submit"
                        disabled={submittingTrainer}
                        className="btn-secondary text-xs py-1.5 px-3.5 font-medium shadow-xs"
                      >
                        {submittingTrainer ? "Saving..." : hasExistingTrainerReview ? "Update Rating" : "Submit Rating"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Student Feedback Reviews Stream */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider font-mono">
                  Participant Reviews ({feedbackData.feedbacks.length})
                </h4>

                {feedbackData.feedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4">
                    No participant evaluations recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {feedbackData.feedbacks.map((f) => (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1.5 shadow-2xs"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-100 font-bold text-[10px] flex items-center justify-center border border-slate-700">
                              {f.user?.name ? f.user.name[0].toUpperCase() : "P"}
                            </div>
                            <span className="font-semibold text-foreground">
                              {f.user?.name || f.user?.email?.split("@")[0] || "Participant"}
                            </span>
                            {f.userId === user?.id && (
                              <span className="badge bg-primary/10 text-primary text-[8px] font-mono">
                                YOU
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= f.rating
                                      ? "fill-amber-500 text-amber-500"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
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
