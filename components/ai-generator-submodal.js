"use client";

import { useMemo, useState } from "react";
import { uploadResourcePipeline } from "@/features/resources/api/resources.api";
import { generateAiQuestions } from "@/features/assessments/api/assessments.api";

const isImageResource = (r) => {
  if (r?.mimeType?.startsWith("image/")) return true;
  const key = r?.storageKey || r?.title || "";
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(key);
};

export function AiGeneratorSubmodal({
  isOpen,
  onClose,
  courseId,
  token,
  resources = [],
  onQuestionsGenerated,
}) {
  const [questionCount, setQuestionCount] = useState(5);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [customInstructions, setCustomInstructions] = useState("");
  const [theoryText, setTheoryText] = useState("");
  const [selectedResourceIds, setSelectedResourceIds] = useState([]);
  const [localResources, setLocalResources] = useState([]);
  const [generating, setGenerating] = useState(false);
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
    setUploading(true);
    setError("");
    try {
      const created = [];
      for (const file of files) {
        const res = await uploadResourcePipeline(token, {
          courseId,
          file,
          title: file.name,
          type: "DOCUMENT",
        });
        if (res?.id) {
          created.push(res);
        }
      }
      setLocalResources((prev) => [...prev, ...created]);
      setSelectedResourceIds((prev) => [
        ...prev,
        ...created.map((c) => c.id),
      ]);
    } catch (err) {
      setError(err.message || "Failed to upload image resources.");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setGenerating(true);
    try {
      const res = await generateAiQuestions(token, courseId, {
        questionCount: Number(questionCount),
        marksPerQuestion: Number(marksPerQuestion),
        customInstructions,
        theoryText,
        resourceIds: selectedResourceIds,
      });

      const candidateQuestions = res?.data?.candidateQuestions || [];
      if (!candidateQuestions.length) {
        throw new Error("AI returned no questions. Please try again with more details.");
      }

      onQuestionsGenerated(candidateQuestions);
      onClose();
    } catch (err) {
      setError(err.message || "AI Question generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card-shell w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
              AI
            </div>
            <div>
              <h2 className="font-display font-semibold text-base text-foreground">
                AI Question Generator
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Generate custom MCQs from prompts, theory text, or uploaded images
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 flex items-start gap-2">
              <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-destructive/20">Error</span>
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form id="ai-generate-form" onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-xs font-semibold mb-1 block">
                  Question count (N)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="input py-2 text-xs"
                  required
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Generates {Number(questionCount) || 1} + 5 extra candidates for curation
                </p>
              </div>

              <div>
                <label className="label text-xs font-semibold mb-1 block">
                  Marks per question
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(e.target.value)}
                  className="input py-2 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label text-xs font-semibold mb-1 block">
                Prompt / Custom Instructions
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Intermediate level C programming questions focusing on pointers, memory management, and recursion."
                rows={2}
                className="input py-2 text-xs resize-y"
              />
            </div>

            <div>
              <label className="label text-xs font-semibold mb-1 block">
                Theory / Study Material (Text)
              </label>
              <textarea
                value={theoryText}
                onChange={(e) => setTheoryText(e.target.value)}
                placeholder="Paste course notes, code snippets, or textbook excerpts here to base the questions on..."
                rows={4}
                className="input py-2 text-xs font-mono resize-y"
              />
            </div>

            {/* Optional Image Uploads / Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label text-xs font-semibold">
                  Course Diagram/Image Resources (Optional)
                </label>
                <label className="text-[11px] text-accent hover:underline cursor-pointer font-medium">
                  {uploading ? "Uploading..." : "+ Upload New Image"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={handleUploadImages}
                    className="hidden"
                  />
                </label>
              </div>

              {imageResources.length === 0 ? (
                <div className="p-3 text-center border border-dashed border-border rounded-xl bg-muted/10">
                  <p className="text-[11px] text-muted-foreground">
                    No images selected. Questions will be generated purely from prompt & theory text.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-border rounded-xl">
                  {imageResources.map((res) => {
                    const checked = selectedResourceIds.includes(res.id);
                    return (
                      <label
                        key={res.id}
                        onClick={() => toggleResource(res.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          checked
                            ? "border-accent bg-accent/10 text-foreground font-medium"
                            : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-border text-accent focus:ring-accent"
                        />
                        <span className="truncate">{res.title}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="btn-secondary py-2 px-4 text-xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="ai-generate-form"
            disabled={generating || uploading}
            className="btn-primary py-2 px-5 text-xs inline-flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Questions...
              </>
            ) : (
              "Generate & Add to Editor"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
