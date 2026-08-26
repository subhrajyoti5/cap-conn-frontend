"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAssessment,
  getResult,
  startAssessment,
  submitAssessment,
} from "@/features/assessments/api/assessments.api";

export function TakeAssessmentModal({
  isOpen,
  onClose,
  assessmentId,
  token,
  mode = "take",
  onSubmitted,
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [view, setView] = useState(mode === "result" ? "result" : "quiz");

  useEffect(() => {
    if (!isOpen || !assessmentId || !token) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setConfirmOpen(false);
      setAnswers({});
      setResult(null);
      setView(mode === "result" ? "result" : "quiz");

      try {
        if (mode === "result") {
          const res = await getResult(token, assessmentId);
          if (cancelled) return;
          setAssessment(res.data?.assessment || null);
          setResult(res.data?.submission || null);
          setView("result");
        } else {
          await startAssessment(token, assessmentId);
          if (cancelled) return;
          const res = await getAssessment(token, assessmentId);
          if (cancelled) return;
          setAssessment(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.code === "CONFLICT" || /already/i.test(err.message || "")) {
            try {
              const res = await getResult(token, assessmentId);
              if (!cancelled) {
                setAssessment(res.data?.assessment || null);
                setResult(res.data?.submission || null);
                setView("result");
              }
            } catch (inner) {
              if (!cancelled) setError(inner.message || err.message || "Failed to load");
            }
          } else {
            setError(err.message || "Failed to load assessment");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, assessmentId, token, mode]);

  const questions = useMemo(() => {
    const list = assessment?.questions || [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [assessment]);

  const selectedByQuestion = useMemo(() => {
    const map = {};
    if (result?.answers) {
      for (const a of result.answers) {
        map[a.questionId] = a.selectedOptionId;
      }
    }
    return map;
  }, [result]);

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));
      await submitAssessment(token, assessmentId, payload);
      const res = await getResult(token, assessmentId);
      setAssessment(res.data?.assessment || assessment);
      setResult(res.data?.submission || null);
      setView("result");
      setConfirmOpen(false);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.message || "Submit failed");
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border shadow-xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              {assessment?.title || "Assessment"}
            </h2>
            {assessment?.deadline && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Due {new Date(assessment.deadline).toLocaleString()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading...</div>
        ) : view === "result" ? (
          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-xl border border-border p-4 bg-muted/10">
              <p className="font-semibold text-foreground text-sm">
                Score: {result?.score ?? "—"} / {assessment?.totalMarks ?? "—"}
              </p>
              <p className="text-muted-foreground mt-1">
                Status: {result?.status || "GRADED"}
              </p>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => {
                const selectedId = selectedByQuestion[q.id];
                return (
                  <div key={q.id} className="rounded-xl border border-border p-4 space-y-2">
                    <p className="font-medium text-foreground">
                      {i + 1}. {q.text}{" "}
                      <span className="text-muted-foreground">({q.marks} marks)</span>
                    </p>
                    <ul className="space-y-1">
                      {(q.options || []).map((o) => {
                        const isSelected = o.id === selectedId;
                        const isCorrect = o.isCorrect === true;
                        let cls = "rounded-lg px-2 py-1.5 border border-border";
                        if (isCorrect) cls += " bg-emerald-500/10 border-emerald-500/30";
                        if (isSelected && !isCorrect)
                          cls += " bg-destructive/10 border-destructive/30";
                        return (
                          <li key={o.id} className={cls}>
                            {o.text}
                            {isCorrect ? " ✓" : ""}
                            {isSelected && !isCorrect ? " (your answer)" : ""}
                            {isSelected && isCorrect ? " (your answer)" : ""}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button type="button" className="btn-primary text-xs py-1.5 px-4" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>
                  Progress {answeredCount}/{questions.length}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="rounded-xl border border-border p-4 space-y-2">
                  <p className="font-medium text-foreground">
                    {i + 1}. {q.text}{" "}
                    <span className="text-muted-foreground">({q.marks} marks)</span>
                  </p>
                  <div className="space-y-1.5">
                    {(q.options || []).map((o) => (
                      <label
                        key={o.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                          answers[q.id] === o.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === o.id}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: o.id }))
                          }
                        />
                        <span>{o.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                className="btn-secondary text-xs py-1.5 px-3"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary text-xs py-1.5 px-4"
                disabled={submitting || answeredCount === 0}
                onClick={() => setConfirmOpen(true)}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-card border border-border p-5 space-y-3">
            <h3 className="font-display text-sm font-semibold">Submit assessment?</h3>
            <p className="text-xs text-muted-foreground">
              You answered {answeredCount} of {questions.length} questions. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary text-xs py-1.5 px-3"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-primary text-xs py-1.5 px-4"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Confirm submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
