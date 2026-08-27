"use client";

import { useState, useEffect } from "react";
import {
  createAssessment,
  updateAssessment,
  publishAssessment,
  deleteAssessment,
  uploadAssessmentFilePipeline,
} from "@/features/assessments/api/assessments.api";
import { AiGeneratorSubmodal } from "@/components/ai-generator-submodal";

export function AssignmentStudioModal({
  isOpen,
  onClose,
  courseId,
  token,
  resources = [],
  initialAssessment = null,
  onSaved,
}) {
  const [assignmentType, setAssignmentType] = useState("DOCUMENT"); // DOCUMENT | MCQ
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [evaluationMode, setEvaluationMode] = useState("INSTANT");
  const [questions, setQuestions] = useState([]);
  const [docTotalMarks, setDocTotalMarks] = useState(100);
  const [docFile, setDocFile] = useState(null);
  const [docFileName, setDocFileName] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [showAiModal, setShowAiModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(initialAssessment);
  const isDocMode = !isEditing && assignmentType === "DOCUMENT";

  // Prepopulate if editing an existing assessment
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setDocFile(null);
    setDocFileName("");
    setUploadingDoc(false);
    setDocTotalMarks(100);

    if (initialAssessment) {
      // Editing always uses the MCQ studio path (document edits use EditAssignmentModal)
      setAssignmentType(initialAssessment.type === "DOCUMENT" ? "DOCUMENT" : "MCQ");
      setTitle(initialAssessment.title || "");
      setDescription(initialAssessment.description || "");
      setEvaluationMode(initialAssessment.evaluationMode || "INSTANT");
      setDocTotalMarks(initialAssessment.totalMarks || 100);
      setDocFileName(initialAssessment.fileName || "");

      if (initialAssessment.startTime) {
        const d = new Date(initialAssessment.startTime);
        setStartTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      } else {
        const now = new Date();
        setStartTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }

      if (initialAssessment.deadline) {
        const d = new Date(initialAssessment.deadline);
        setDeadline(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      } else {
        setDeadline("");
      }

      if (Array.isArray(initialAssessment.questions) && initialAssessment.questions.length > 0) {
        setQuestions(
          initialAssessment.questions.map((q) => ({
            id: q.id || String(Date.now() + Math.random()),
            text: q.text || "",
            explanation: q.explanation || "",
            imageUrl: q.imageUrl || "",
            marks: q.marks || 1,
            options: Array.isArray(q.options)
              ? q.options.map((o) => ({
                  text: o.text || "",
                  isCorrect: Boolean(o.isCorrect),
                }))
              : [
                  { text: "", isCorrect: true },
                  { text: "", isCorrect: false },
                ],
          }))
        );
      } else {
        initDefaultQuestions();
      }
    } else {
      resetForm();
    }
  }, [isOpen, initialAssessment]);

  const resetForm = () => {
    setAssignmentType("DOCUMENT");
    setTitle("");
    setDescription("");
    setEvaluationMode("INSTANT");
    setDocTotalMarks(100);
    setDocFile(null);
    setDocFileName("");

    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setStartTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setDeadline(new Date(future.getTime() - future.getTimezoneOffset() * 60000).toISOString().slice(0, 16));

    initDefaultQuestions();
  };

  const initDefaultQuestions = () => {
    setQuestions([
      {
        id: "q-1",
        text: "",
        explanation: "",
        imageUrl: "",
        marks: 1,
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  if (!isOpen) return null;

  const totalMarks = isDocMode
    ? Number(docTotalMarks) || 0
    : questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const isEditingPublished = initialAssessment?.status === "PUBLISHED";

  const handleDocFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);
    setDocFileName(file.name);
    setError("");
  };

  // Add Question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        text: "",
        explanation: "",
        imageUrl: "",
        marks: 1,
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      setError("An assessment must contain at least 1 question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, val) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q))
    );
  };

  // Option Handlers
  const handleAddOption = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        if (q.options.length >= 6) return q;
        return {
          ...q,
          options: [...q.options, { text: "", isCorrect: false }],
        };
      })
    );
  };

  const handleRemoveOption = (qIdx, oIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        if (q.options.length <= 2) return q;
        const newOpts = q.options.filter((_, idx) => idx !== oIdx);
        if (!newOpts.some((o) => o.isCorrect) && newOpts.length > 0) {
          newOpts[0].isCorrect = true;
        }
        return { ...q, options: newOpts };
      })
    );
  };

  const handleOptionTextChange = (qIdx, oIdx, text) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOpts = q.options.map((o, idx) =>
          idx === oIdx ? { ...o, text } : o
        );
        return { ...q, options: newOpts };
      })
    );
  };

  const handleSetCorrectOption = (qIdx, oIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOpts = q.options.map((o, idx) => ({
          ...o,
          isCorrect: idx === oIdx,
        }));
        return { ...q, options: newOpts };
      })
    );
  };

  // AI Insert Callback
  const handleAiQuestionsGenerated = (aiQuestions) => {
    const formatted = aiQuestions.map((q, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      text: q.text || "",
      explanation: q.explanation || "",
      imageUrl: q.imageUrl || "",
      marks: Number(q.marks) || 1,
      options: Array.isArray(q.options)
        ? q.options.map((o) => ({
            text: o.text || "",
            isCorrect: Boolean(o.isCorrect),
          }))
        : [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ],
    }));

    if (questions.length === 1 && !questions[0].text.trim()) {
      setQuestions(formatted);
    } else {
      setQuestions((prev) => [...prev, ...formatted]);
    }
  };

  // Delete Assessment
  const handleDeleteAssessment = async () => {
    if (!initialAssessment?.id) return;
    if (!window.confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteAssessment(token, initialAssessment.id);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete assignment.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveDocumentAssignment = async (publishImmediate = false) => {
    setError("");

    if (!title.trim()) {
      setError("Please provide an assignment title.");
      return;
    }
    if (!deadline) {
      setError("Please set a submission deadline date & time.");
      return;
    }
    if (!docTotalMarks || Number(docTotalMarks) <= 0) {
      setError("Total marks must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      let finalFileUrl = null;
      let finalFileName = docFileName || null;

      if (docFile) {
        setUploadingDoc(true);
        const uploaded = await uploadAssessmentFilePipeline(token, {
          courseId,
          file: docFile,
        });
        finalFileUrl = uploaded.storageKey;
        finalFileName = uploaded.fileName;
        setUploadingDoc(false);
      }

      const payload = {
        courseId,
        title: title.trim(),
        description: description.trim() || null,
        type: "DOCUMENT",
        fileUrl: finalFileUrl,
        fileName: finalFileName,
        totalMarks: Number(docTotalMarks),
        deadline: new Date(deadline).toISOString(),
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      };

      const res = await createAssessment(token, payload);
      const targetId = res?.data?.id;

      if (publishImmediate && targetId) {
        await publishAssessment(token, targetId);
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create document assignment.");
    } finally {
      setSaving(false);
      setUploadingDoc(false);
    }
  };

  // Save / Publish Assessment
  const handleSaveAssessment = async (publishImmediate = false) => {
    if (isDocMode) {
      return handleSaveDocumentAssignment(publishImmediate);
    }

    setError("");

    if (!title.trim()) {
      setError("Please provide an assignment title.");
      return;
    }
    if (!deadline) {
      setError("Please set a submission deadline date & time.");
      return;
    }
    if (questions.length === 0) {
      setError("Please add at least one question to the assignment.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} has no text.`);
        return;
      }
      if (q.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options.`);
        return;
      }
      if (q.options.some((o) => !o.text.trim())) {
        setError(`Question ${i + 1} has an empty option.`);
        return;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        setError(`Question ${i + 1} has no correct option selected.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        type: "MCQ",
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        deadline: new Date(deadline).toISOString(),
        evaluationMode,
        resultsReleased: evaluationMode === "INSTANT",
        totalMarks,
        questions: questions.map((q, idx) => ({
          text: q.text.trim(),
          explanation: q.explanation?.trim() || undefined,
          imageUrl: q.imageUrl?.trim() || undefined,
          marks: Number(q.marks) || 1,
          order: idx,
          options: q.options.map((o) => ({
            text: o.text.trim(),
            isCorrect: Boolean(o.isCorrect),
          })),
        })),
      };

      let targetId = initialAssessment?.id;

      if (targetId) {
        await updateAssessment(token, targetId, payload);
      } else {
        const res = await createAssessment(token, payload);
        targetId = res?.data?.id;
      }

      if (publishImmediate && targetId && !isEditingPublished) {
        await publishAssessment(token, targetId);
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground animate-fade-in overflow-hidden">
      {/* Studio Navigation Header */}
      <header className="px-6 py-4 border-b border-border bg-card flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
          <div>
            <h1 className="font-display font-bold text-base text-foreground flex items-center gap-2">
              {isDocMode ? "Document Task" : "Assessment Editorial Studio"}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                {isEditingPublished
                  ? "Published Edit"
                  : initialAssessment
                  ? "Draft Edit"
                  : isDocMode
                  ? "Document Task"
                  : "MCQ Studio"}
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {isDocMode
                ? `Total Marks: ${totalMarks}`
                : `${questions.length} Question${questions.length !== 1 ? "s" : ""} • Total Marks: ${totalMarks}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isDocMode && (
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="btn-secondary py-2 px-3 text-xs inline-flex items-center gap-1.5 border-accent/40 text-accent hover:bg-accent/10 shadow-sm font-medium"
            >
              AI Generate
            </button>
          )}

          {initialAssessment && (
            <button
              type="button"
              disabled={deleting || saving || uploadingDoc}
              onClick={handleDeleteAssessment}
              className="py-2 px-3.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
            >
              {deleting ? "Deleting..." : "Delete Assignment"}
            </button>
          )}

          {isEditingPublished ? (
            <button
              type="button"
              disabled={saving || deleting || uploadingDoc}
              onClick={() => handleSaveAssessment(false)}
              className="btn-primary py-2 px-5 text-xs font-medium inline-flex items-center gap-2 shadow-md"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={saving || deleting || uploadingDoc}
                onClick={() => handleSaveAssessment(false)}
                className="btn-secondary py-2 px-4 text-xs font-medium"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={saving || deleting || uploadingDoc}
                onClick={() => handleSaveAssessment(true)}
                className="btn-primary py-2 px-5 text-xs font-medium inline-flex items-center gap-2 shadow-md"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploadingDoc ? "Uploading File..." : "Publishing..."}
                  </>
                ) : (
                  "Publish Assignment"
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/10">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 flex items-start gap-2.5 shadow-sm">
              <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-destructive/20">Error</span>
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Type selector — create mode only */}
          {!isEditing && (
            <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setAssignmentType("DOCUMENT")}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  assignmentType === "DOCUMENT"
                    ? "bg-card text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Document Assignment (Doc / PDF upload)
              </button>
              <button
                type="button"
                onClick={() => setAssignmentType("MCQ")}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  assignmentType === "MCQ"
                    ? "bg-card text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                MCQ Assessment
              </button>
            </div>
          )}

          {/* Section 1: Assignment Overview & Settings */}
          <div className="card-shell p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-sm text-foreground border-b border-border/60 pb-2">
              Assignment Overview & Schedule Settings
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label text-xs font-semibold mb-1 block">
                  Assignment Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isDocMode
                      ? "e.g. Capstone Research Project & Analysis"
                      : "e.g. Midterm Evaluation - Data Structures & Algorithms"
                  }
                  className="input py-2 text-sm font-medium"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label text-xs font-semibold mb-1 block">
                  {isDocMode ? "Instructions & Guidelines" : "Description / Instructions for Trainees"}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={isDocMode ? 3 : 2}
                  placeholder={
                    isDocMode
                      ? "Provide instructions, submission requirements, or rubric details for trainees..."
                      : "Provide instructions regarding format, rules, and scoring..."
                  }
                  className="input py-2 text-xs"
                />
              </div>

              {!isDocMode && (
                <div>
                  <label className="label text-xs font-semibold mb-1 block">
                    Start Time (When Quiz Opens) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input py-2 text-xs"
                    required
                  />
                </div>
              )}

              <div className={isDocMode ? "" : undefined}>
                <label className="label text-xs font-semibold mb-1 block">
                  Submission Deadline <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input py-2 text-xs"
                  required
                />
                {isDocMode && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    You can edit this deadline anytime after creation.
                  </p>
                )}
              </div>

              {isDocMode && (
                <div>
                  <label className="label text-xs font-semibold mb-1 block">
                    Total Marks / Max Score <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={docTotalMarks}
                    onChange={(e) => setDocTotalMarks(e.target.value)}
                    placeholder="100"
                    className="input py-2 text-xs"
                    required
                  />
                </div>
              )}

              {isDocMode && (
                <div className="sm:col-span-2">
                  <label className="label text-xs font-semibold mb-1 block">
                    Assignment Document / Brief (PDF, DOCX, etc.)
                  </label>
                  <div className="border border-dashed border-border rounded-xl p-4 text-center bg-muted/5 hover:bg-muted/10 transition-colors">
                    {docFileName ? (
                      <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <div className="text-left truncate">
                            <p className="font-medium text-foreground truncate text-xs">{docFileName}</p>
                            <p className="text-[10px] text-muted-foreground">Ready to attach</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDocFile(null);
                            setDocFileName("");
                          }}
                          className="text-xs text-destructive hover:underline ml-3 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 text-base">
                          📎
                        </div>
                        <p className="font-medium text-foreground text-xs">
                          Click to upload assignment brief or worksheet
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          PDF, Word (.docx, .doc), Presentations, or Text files (up to 50MB)
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                          onChange={handleDocFileSelect}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {!isDocMode && (
                <div className="sm:col-span-2">
                  <label className="label text-xs font-semibold mb-1 block">
                    Evaluation & Results Mode
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setEvaluationMode("INSTANT")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        evaluationMode === "INSTANT"
                          ? "border-accent bg-accent/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <input
                        type="radio"
                        name="evaluationMode"
                        checked={evaluationMode === "INSTANT"}
                        onChange={() => setEvaluationMode("INSTANT")}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-semibold text-xs text-foreground">Instant Release</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Trainees see their score & detailed explanations immediately upon submission.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setEvaluationMode("MANUAL_RELEASE")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        evaluationMode === "MANUAL_RELEASE"
                          ? "border-accent bg-accent/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <input
                        type="radio"
                        name="evaluationMode"
                        checked={evaluationMode === "MANUAL_RELEASE"}
                        onChange={() => setEvaluationMode("MANUAL_RELEASE")}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-semibold text-xs text-foreground">Manual Release by Trainer</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Scores are hidden until trainer manually clicks &apos;Release Results&apos; for all trainees.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Questions Editor (MCQ only) */}
          {!isDocMode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-foreground">
                  Question Items ({questions.length})
                </h2>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="btn-secondary py-1.5 px-3.5 text-xs font-semibold text-accent border-accent/30 hover:bg-accent/10"
                >
                  + Add Question
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="card-shell p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4 relative group"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="font-bold text-xs text-accent font-mono uppercase tracking-wider">
                      Question {qIdx + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Marks:</span>
                        <input
                          type="number"
                          min="1"
                          value={q.marks}
                          onChange={(e) =>
                            handleQuestionChange(qIdx, "marks", Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="input py-1 px-2 text-xs w-16 text-center font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded transition-colors font-medium"
                        title="Remove Question"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div>
                    <label className="label text-xs font-semibold mb-1 block">
                      Question Prompt <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      value={q.text}
                      onChange={(e) => handleQuestionChange(qIdx, "text", e.target.value)}
                      rows={2}
                      placeholder="Enter the question text here..."
                      className="input py-2 text-xs font-medium"
                      required
                    />
                  </div>

                  {/* Question Optional Media & Explanation */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label text-[11px] font-medium mb-1 block">
                        Optional Image URL
                      </label>
                      <input
                        type="url"
                        value={q.imageUrl}
                        onChange={(e) => handleQuestionChange(qIdx, "imageUrl", e.target.value)}
                        placeholder="https://example.com/diagram.png"
                        className="input py-1.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="label text-[11px] font-medium mb-1 block">
                        Optional Answer Explanation
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
                        placeholder="Explanation displayed when reviewing results..."
                        className="input py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                        Multiple Choice Options (Select radio for correct answer)
                      </span>
                      {q.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => handleAddOption(qIdx)}
                          className="text-[11px] text-accent hover:underline font-semibold"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name={`correct-opt-${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => handleSetCorrectOption(qIdx, oIdx)}
                            className="shrink-0 accent-accent cursor-pointer"
                            title="Set as correct answer"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                            className={`input py-1.5 text-xs flex-1 ${
                              opt.isCorrect
                                ? "border-emerald-500/50 bg-emerald-500/5 font-semibold text-emerald-700"
                                : ""
                            }`}
                            required
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIdx, oIdx)}
                              className="text-xs text-muted-foreground hover:text-destructive px-1.5 py-1"
                              title="Remove option"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="btn-secondary py-2.5 px-6 text-xs font-semibold text-accent border-accent/40 hover:bg-accent/10 shadow-sm"
                >
                  + Add Question
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Submodal */}
      {!isDocMode && (
        <AiGeneratorSubmodal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          courseId={courseId}
          token={token}
          resources={resources}
          onQuestionsGenerated={handleAiQuestionsGenerated}
        />
      )}
    </div>
  );
}
