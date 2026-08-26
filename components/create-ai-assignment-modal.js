"use client";

import { useEffect, useMemo, useState } from "react";
import { uploadResourcePipeline } from "@/features/resources/api/resources.api";
import {
  createAssessment,
  generateAiQuestions,
  publishAssessment,
} from "@/features/assessments/api/assessments.api";

const emptyQuestion = (marks = 1, order = 0) => ({
  text: "",
  marks,
  order,
  explanation: "",
  selected: true,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
});

const isImageResource = (r) => {
  if (r?.mimeType?.startsWith("image/")) return true;
  const key = r?.storageKey || r?.title || "";
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(key);
};

export function CreateAiAssignmentModal({
  isOpen,
  onClose,
  courseId,
  token,
  resources = [],
  onSaved,
}) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedResourceIds, setSelectedResourceIds] = useState([]);
  const [localResources, setLocalResources] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const imageResources = useMemo(() => {
    const merged = [...(resources || []), ...localResources];
    const seen = new Set();
    return merged.filter((r) => {
      if (!r?.id || seen.has(r.id) || !isImageResource(r)) return false;
      seen.add(r.id);
      return true;
    });
  }, [resources, localResources]);

  const selectedCount = questions.filter((q) => q.selected).length;

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setTitle("");
    setDescription("");
    setDeadline("");
    setQuestionCount(5);
    setMarksPerQuestion(1);
    setCustomInstructions("");
    setSelectedResourceIds([]);
    setLocalResources([]);
    setQuestions([]);
    setGenerating(false);
    setSaving(false);
    setUploading(false);
    setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleResource = (id) => {
    setSelectedResourceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    e.target.value = "";
    if (!files.length) {
      setError("Please select image files only.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const created = [];
      for (const file of files) {
        const resource = await uploadResourcePipeline(token, {
          courseId,
          file,
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: "DOCUMENT",
        });
        created.push(resource);
      }
      setLocalResources((prev) => [...created, ...prev]);
      setSelectedResourceIds((prev) => [
        ...prev,
        ...created.map((r) => r.id).filter(Boolean),
      ]);
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    setError("");
    if (!title.trim()) {
      setError("Assignment title is required.");
      return;
    }
    if (!deadline) {
      setError("Deadline is required.");
      return;
    }
    if (selectedResourceIds.length === 0) {
      setError("Select at least one image resource.");
      return;
    }

    setGenerating(true);
    try {
      const res = await generateAiQuestions(token, courseId, {
        resourceIds: selectedResourceIds,
        customInstructions,
        questionCount: Number(questionCount),
        marksPerQuestion: Number(marksPerQuestion),
      });
      const candidates = (res.data?.candidateQuestions || []).map((q, i) => ({
        ...q,
        order: i,
        selected: i < Number(questionCount),
        explanation: q.explanation || "",
        options: (q.options || []).map((o, oi) => ({
          text: o.text,
          isCorrect: Boolean(o.isCorrect) || oi === 0,
        })),
      }));
      if (!candidates.length) {
        setError("AI returned no questions. Try again.");
        return;
      }
      setQuestions(candidates);
      setStep(2);
    } catch (err) {
      setError(err.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const updateQuestion = (index, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const updateOption = (qIndex, oIndex, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.map((o, oi) => {
          if (oi !== oIndex) {
            return patch.isCorrect ? { ...o, isCorrect: false } : o;
          }
          return { ...o, ...patch };
        });
        return { ...q, options };
      })
    );
  };

  const addOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...q.options, { text: "", isCorrect: false }] }
          : q
      )
    );
  };

  const removeOption = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 2) return q;
        const options = q.options.filter((_, oi) => oi !== oIndex);
        if (!options.some((o) => o.isCorrect) && options[0]) {
          options[0] = { ...options[0], isCorrect: true };
        }
        return { ...q, options };
      })
    );
  };

  const addCustomQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      emptyQuestion(Number(marksPerQuestion) || 1, prev.length),
    ]);
  };

  const deleteQuestion = (index) => {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i }))
    );
  };

  const validateSelected = () => {
    const selected = questions.filter((q) => q.selected);
    if (selected.length === 0) {
      setError("Select at least one question to keep.");
      return null;
    }
    for (const [i, q] of selected.entries()) {
      if (!q.text.trim()) {
        setError(`Selected question ${i + 1} needs text.`);
        return null;
      }
      if (q.options.length < 2) {
        setError(`Selected question ${i + 1} needs at least 2 options.`);
        return null;
      }
      if (q.options.some((o) => !o.text.trim())) {
        setError(`Selected question ${i + 1} has empty options.`);
        return null;
      }
      if (q.options.filter((o) => o.isCorrect).length !== 1) {
        setError(`Selected question ${i + 1} must have exactly one correct option.`);
        return null;
      }
    }
    return selected;
  };

  const handleSave = async (publish) => {
    setError("");
    const selected = validateSelected();
    if (!selected) return;

    const totalMarks = selected.reduce(
      (sum, q) => sum + (Number(q.marks) || 1),
      0
    );

    setSaving(true);
    try {
      const payload = {
        courseId,
        title: title.trim(),
        description: description.trim() || null,
        totalMarks,
        deadline: new Date(deadline).toISOString(),
        questions: selected.map((q, order) => ({
          text: q.text.trim(),
          marks: Number(q.marks) || 1,
          order,
          options: q.options.map((o) => ({
            text: o.text.trim(),
            isCorrect: Boolean(o.isCorrect),
          })),
        })),
      };

      const created = await createAssessment(token, payload);
      const assessmentId = created.data?.id;
      if (publish && assessmentId) {
        await publishAssessment(token, assessmentId);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border shadow-xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              Create AI Assignment
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Step {step} of 3
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={generating || saving}
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

        {step === 1 && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-foreground mb-1">Title</label>
                <input
                  className="input w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Module 2 Quiz"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium text-foreground mb-1">Description</label>
                <textarea
                  className="input w-full min-h-[72px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description shown to trainees"
                />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  className="input w-full"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">Question count (N)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="input w-full"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  AI generates N+5 candidates for you to curate.
                </p>
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">Marks per question</label>
                <input
                  type="number"
                  min={1}
                  className="input w-full"
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium text-foreground mb-1">
                  Extra instructions / prompt
                </label>
                <textarea
                  className="input w-full min-h-[80px]"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Focus on safety procedures, difficulty: intermediate..."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-foreground">Image resources</label>
                <label className="btn-secondary btn-sm cursor-pointer">
                  {uploading ? "Uploading..." : "Upload images"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading || generating}
                    onChange={handleUploadImages}
                  />
                </label>
              </div>
              {imageResources.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-xl">
                  No course images yet. Upload images to generate questions.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto">
                  {imageResources.map((r) => {
                    const checked = selectedResourceIds.includes(r.id);
                    const thumb = r.downloadUrl || (r.storageKey?.startsWith("http") ? r.storageKey : null);
                    return (
                      <label
                        key={r.id}
                        className={`relative rounded-xl border p-2 cursor-pointer transition-colors ${
                          checked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="absolute top-2 left-2"
                          checked={checked}
                          onChange={() => toggleResource(r.id)}
                        />
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={r.title}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <div className="w-full h-24 rounded-lg bg-muted mb-2 flex items-center justify-center text-[10px] text-muted-foreground">
                            Image
                          </div>
                        )}
                        <p className="text-[10px] font-medium truncate">{r.title}</p>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary text-xs py-1.5 px-4"
                disabled={generating || uploading}
                onClick={handleGenerate}
              >
                {generating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">
                Selected: {selectedCount} / {questionCount}
              </p>
              <button type="button" className="btn-secondary btn-sm" onClick={addCustomQuestion}>
                Add custom question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-border p-4 space-y-3 bg-card">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={q.selected}
                      onChange={(e) => updateQuestion(qi, { selected: e.target.checked })}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          Q{qi + 1}
                        </span>
                        <button
                          type="button"
                          className="text-destructive text-[10px]"
                          onClick={() => deleteQuestion(qi)}
                        >
                          Delete
                        </button>
                      </div>
                      <textarea
                        className="input w-full min-h-[56px]"
                        value={q.text}
                        onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-muted-foreground">Marks</label>
                        <input
                          type="number"
                          min={1}
                          className="input w-20"
                          value={q.marks}
                          onChange={(e) =>
                            updateQuestion(qi, { marks: Number(e.target.value) || 1 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        {q.options.map((o, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qi}`}
                              checked={o.isCorrect}
                              onChange={() => updateOption(qi, oi, { isCorrect: true })}
                            />
                            <input
                              className="input flex-1"
                              value={o.text}
                              onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                              placeholder={`Option ${oi + 1}`}
                            />
                            <button
                              type="button"
                              className="text-[10px] text-muted-foreground"
                              onClick={() => removeOption(qi, oi)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => addOption(qi)}
                        >
                          Add option
                        </button>
                      </div>
                      {q.explanation ? (
                        <p className="text-[10px] text-muted-foreground">
                          Explanation: {q.explanation}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-2 pt-3 border-t border-border">
              <button
                type="button"
                className="btn-secondary text-xs py-1.5 px-3"
                onClick={() => setStep(1)}
                disabled={saving}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-primary text-xs py-1.5 px-4"
                onClick={() => {
                  setError("");
                  if (!validateSelected()) return;
                  setStep(3);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-xl border border-border p-4 space-y-2 bg-muted/10">
              <p className="font-semibold text-foreground">{title}</p>
              {description ? (
                <p className="text-muted-foreground">{description}</p>
              ) : null}
              <p className="text-muted-foreground">
                {selectedCount} questions ·{" "}
                {questions
                  .filter((q) => q.selected)
                  .reduce((s, q) => s + (Number(q.marks) || 1), 0)}{" "}
                total marks · Due {deadline ? new Date(deadline).toLocaleString() : "—"}
              </p>
            </div>
            <div className="flex justify-between gap-2 pt-3 border-t border-border">
              <button
                type="button"
                className="btn-secondary text-xs py-1.5 px-3"
                onClick={() => setStep(2)}
                disabled={saving}
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary text-xs py-1.5 px-3"
                  disabled={saving}
                  onClick={() => handleSave(false)}
                >
                  {saving ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="button"
                  className="btn-primary text-xs py-1.5 px-4"
                  disabled={saving}
                  onClick={() => handleSave(true)}
                >
                  {saving ? "Publishing..." : "Publish Immediately"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
