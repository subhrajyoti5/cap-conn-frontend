"use client";

import { useEffect, useState } from "react";
import { getResult, updateAssessment } from "@/features/assessments/api/assessments.api";
import { apiFetch } from "@/lib/api";
import { CheckCircle2, XCircle, UserCheck, X, FileText, AlertTriangle } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-card border border-border/80 shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Trainee Submissions & Responses</span>
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-muted/10">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-600 text-xs border border-rose-500/30 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                Loading trainee submissions...
              </p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border/80 rounded-2xl bg-card">
              <p className="text-sm font-semibold text-foreground">No submissions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Trainees enrolled in this course haven&apos;t submitted their answers yet.
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
                      sub.trainee?.traineeProfile?.fullName || sub.trainee?.name || sub.trainee?.email || "Trainee";
                    const isSelected = selectedSubmission?.id === sub.id;

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-xs"
                            : "border-border/80 bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-xs text-foreground truncate">{traineeName}</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(sub.traineeId, sub.trainee);
                                }}
                                className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1 shrink-0"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Profile</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">{sub.trainee?.email}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Submitted: {new Date(sub.submittedAt || sub.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
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
                <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-5 space-y-4 max-h-[65vh] overflow-y-auto shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3">
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">
                        Detailed Answer Responses
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedSubmission.trainee?.traineeProfile?.fullName || selectedSubmission.trainee?.name || selectedSubmission.trainee?.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors"
                      title="Close details"
                    >
                      <X className="w-3.5 h-3.5" />
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
                                : "border-rose-500/20 bg-rose-500/5"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-bold text-foreground">
                                Q{idx + 1}. {question?.prompt || "Question"}
                              </p>
                              <span
                                className={`badge text-[9px] font-bold uppercase shrink-0 ${
                                  isCorrect ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                }`}
                              >
                                {isCorrect ? `+${question?.marks || 1} Marks` : "0 Marks"}
                              </span>
                            </div>

                            <div className="space-y-1 pt-1 text-[11px]">
                              <p className="text-muted-foreground">
                                Trainee Choice:{" "}
                                <strong className={isCorrect ? "text-emerald-600" : "text-rose-600"}>
                                  {selectedOpt?.text || "No Option Selected"}
                                </strong>
                              </p>

                              {!isCorrect && correctOpt && (
                                <p className="text-emerald-600 font-medium">
                                  Correct Choice: {correctOpt.text}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-6 text-center">No detailed question responses recorded.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trainee Profile Inspector Overlay */}
        {inspectingTrainee && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-card border border-border/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-start border-b border-border/70 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {inspectingTrainee.fullName || inspectingTrainee.name || inspectingTrainee.fallback?.email || "Trainee Profile"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">{inspectingTrainee.email || inspectingTrainee.fallback?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingTrainee(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {profileLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading profile...</div>
              ) : (
                <div className="space-y-3 text-xs">
                  {inspectingTrainee.phone && (
                    <p><strong className="text-foreground">Phone:</strong> {inspectingTrainee.phone}</p>
                  )}
                  {inspectingTrainee.bio && (
                    <p><strong className="text-foreground">Bio:</strong> &ldquo;{inspectingTrainee.bio}&rdquo;</p>
                  )}
                  {inspectingTrainee.qualifications?.length > 0 && (
                    <div>
                      <p className="font-bold text-foreground mb-1">Qualifications:</p>
                      <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                        {inspectingTrainee.qualifications.map((q) => (
                          <li key={q.id}>{q.degree} from {q.institution} ({q.year})</li>
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
