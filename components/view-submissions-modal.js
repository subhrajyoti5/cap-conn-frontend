"use client";

import { useEffect, useState } from "react";
import { getResult, updateAssessment } from "@/features/assessments/api/assessments.api";
import { apiFetch } from "@/lib/api";

export function ViewSubmissionsModal({
  isOpen,
  onClose,
  assessment,
  token,
  onAssessmentUpdated,
}) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [fullAssessment, setFullAssessment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState("");

  // Trainee profile inspection state
  const [inspectingTrainee, setInspectingTrainee] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !assessment?.id) return;
    setLoading(true);
    setError("");
    setSelectedSubmission(null);

    getResult(token, assessment.id)
      .then((res) => {
        setFullAssessment(res?.data?.assessment || assessment);
        setSubmissions(res?.data?.submissions || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load trainee submissions.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, assessment, token]);

  if (!isOpen) return null;

  const currentAssessment = fullAssessment || assessment;
  const isManualRelease = currentAssessment?.evaluationMode === "MANUAL_RELEASE";
  const isReleased = currentAssessment?.resultsReleased;

  const handleToggleRelease = async () => {
    if (!currentAssessment?.id) return;
    setReleasing(true);
    setError("");
    try {
      const nextReleasedState = !isReleased;
      await updateAssessment(token, currentAssessment.id, {
        resultsReleased: nextReleasedState,
      });
      setFullAssessment((prev) => ({
        ...prev,
        resultsReleased: nextReleasedState,
      }));
      onAssessmentUpdated?.();
    } catch (err) {
      setError(err.message || "Failed to update result release status.");
    } finally {
      setReleasing(false);
    }
  };

  const handleViewProfile = async (traineeId, fallbackInfo) => {
    if (!traineeId) return;
    setProfileLoading(true);
    setInspectingTrainee({ fallback: fallbackInfo });
    try {
      const res = await apiFetch(`/profiles/trainees/${traineeId}`);
      if (res?.data) {
        setInspectingTrainee({ ...res.data, fallback: fallbackInfo });
      }
    } catch (err) {
      console.warn("Could not fetch full trainee profile, using fallback", err);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card-shell w-full max-w-4xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base text-foreground">
                Trainee Submissions & Responses
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                {submissions.length} Submission{submissions.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentAssessment?.title} • Total Marks: {currentAssessment?.totalMarks}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isManualRelease && (
              <button
                type="button"
                disabled={releasing}
                onClick={handleToggleRelease}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  isReleased
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                }`}
              >
                {releasing
                  ? "Updating..."
                  : isReleased
                  ? "Results Released to Trainees (Click to Hide)"
                  : "Release Results to Trainees"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Close window"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-muted/10">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 flex items-start gap-2">
              <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-destructive/20">
                Error
              </span>
              <div className="flex-1">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                Loading trainee submissions...
              </p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-card">
              <p className="text-sm font-semibold text-foreground">No submissions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Trainees enrolled in this course haven't submitted their answers yet.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Submissions List Column */}
              <div className={selectedSubmission ? "lg:col-span-5 space-y-3" : "lg:col-span-12 space-y-3"}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Submitted Candidates ({submissions.length})
                </h3>

                <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
                  {submissions.map((sub) => {
                    const traineeName =
                      sub.trainee?.traineeProfile?.fullName || sub.trainee?.email || "Trainee";
                    const isSelected = selectedSubmission?.id === sub.id;

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-accent bg-accent/5 shadow-sm"
                            : "border-border bg-card hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-xs text-foreground">{traineeName}</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(sub.traineeId, sub.trainee);
                                }}
                                className="text-[10px] text-accent hover:underline font-medium"
                              >
                                View Profile
                              </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{sub.trainee?.email}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Submitted: {new Date(sub.submittedAt || sub.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
                              {sub.score} / {currentAssessment?.totalMarks} Marks
                            </span>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {isSelected ? "Inspecting Answers" : "Click to View Details"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Inspection Column */}
              {selectedSubmission && (
                <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">
                        Detailed Answer Responses
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-muted-foreground">
                          {selectedSubmission.trainee?.traineeProfile?.fullName ||
                            selectedSubmission.trainee?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors"
                      title="Close details"
                    >
                      ✕
                    </button>
                  </div>

                  {Array.isArray(selectedSubmission.answers) && selectedSubmission.answers.length > 0 ? (
                    <div className="space-y-4">
                      {selectedSubmission.answers.map((ans, idx) => {
                        const question = ans.question;
                        const selectedOpt = ans.selectedOption;
                        const correctOpt = question?.options?.find((o) => o.isCorrect);
                        const isCorrect = selectedOpt?.isCorrect || selectedOpt?.id === correctOpt?.id;

                        return (
                          <div
                            key={ans.id || idx}
                            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                              isCorrect
                                ? "border-emerald-500/20 bg-emerald-500/5"
                                : "border-destructive/20 bg-destructive/5"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 font-semibold">
                              <span className="text-foreground">
                                Q{idx + 1}. {question?.text}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                                  isCorrect
                                    ? "bg-emerald-500/20 text-emerald-600"
                                    : "bg-destructive/20 text-destructive"
                                }`}
                              >
                                {isCorrect ? `Correct (+${question?.marks || 1})` : "Incorrect (0)"}
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px] pt-1">
                              <p className={isCorrect ? "text-emerald-700 font-medium" : "text-destructive font-medium"}>
                                Trainee Chose: {selectedOpt ? selectedOpt.text : "No Option Selected"}
                              </p>
                              {!isCorrect && correctOpt && (
                                <p className="text-emerald-600 font-medium">
                                  Correct Answer: {correctOpt.text}
                                </p>
                              )}
                              {question?.explanation && (
                                <p className="text-muted-foreground italic pt-1">
                                  Explanation: {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No individual answer details recorded for this submission.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trainee Profile Submodal */}
        {inspectingTrainee && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Trainee Profile</h3>
                <button
                  type="button"
                  onClick={() => setInspectingTrainee(null)}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>

              {profileLoading ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Loading profile details...</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {inspectingTrainee.fullName || inspectingTrainee.fallback?.traineeProfile?.fullName || inspectingTrainee.email || inspectingTrainee.fallback?.email}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {inspectingTrainee.email || inspectingTrainee.fallback?.email}
                    </p>
                    {inspectingTrainee.phone && (
                      <p className="text-muted-foreground text-xs mt-0.5">Phone: {inspectingTrainee.phone}</p>
                    )}
                  </div>

                  {inspectingTrainee.bio && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                      <p className="font-semibold text-[11px] text-muted-foreground uppercase">Biography</p>
                      <p className="text-foreground text-xs mt-1">{inspectingTrainee.bio}</p>
                    </div>
                  )}

                  {Array.isArray(inspectingTrainee.skills) && inspectingTrainee.skills.length > 0 && (
                    <div>
                      <p className="font-semibold text-[11px] text-muted-foreground uppercase mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectingTrainee.skills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold text-[10px]">
                            {s.skillName || s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(inspectingTrainee.qualifications) && inspectingTrainee.qualifications.length > 0 && (
                    <div>
                      <p className="font-semibold text-[11px] text-muted-foreground uppercase mb-1">Qualifications</p>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                        {inspectingTrainee.qualifications.map((q, i) => (
                          <li key={i}>{q.degreeTitle} from {q.institutionName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
