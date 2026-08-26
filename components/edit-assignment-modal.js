"use client";

import { useEffect, useState } from "react";
import { updateAssessment, uploadAssessmentFilePipeline } from "@/features/assessments/api/assessments.api";

export function EditAssignmentModal({
  isOpen,
  onClose,
  assessment,
  courseId,
  token,
  onUpdated,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [docFile, setDocFile] = useState(null);
  const [docFileName, setDocFileName] = useState("");
  const [docFileUrl, setDocFileUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !assessment) return;
    setTitle(assessment.title || "");
    setDescription(assessment.description || "");
    setTotalMarks(assessment.totalMarks || 100);
    setDocFileName(assessment.fileName || "");
    setDocFileUrl(assessment.fileUrl || "");
    setDocFile(null);
    setError("");

    if (assessment.deadline) {
      const dt = new Date(assessment.deadline);
      // Format to YYYY-MM-DDThh:mm for datetime-local input
      const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDeadline(localIso);
    } else {
      setDeadline("");
    }
  }, [isOpen, assessment]);

  if (!isOpen || !assessment) return null;

  const handleDocFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);
    setDocFileName(file.name);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Assignment title is required.");
      return;
    }
    if (!deadline) {
      setError("Deadline is required.");
      return;
    }
    if (!totalMarks || Number(totalMarks) <= 0) {
      setError("Total marks must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      let finalFileUrl = docFileUrl;
      let finalFileName = docFileName;

      if (docFile) {
        const uploaded = await uploadAssessmentFilePipeline(token, {
          courseId,
          file: docFile,
        });
        finalFileUrl = uploaded.storageKey;
        finalFileName = uploaded.fileName;
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        totalMarks: Number(totalMarks),
        deadline: new Date(deadline).toISOString(),
        fileUrl: finalFileUrl || null,
        fileName: finalFileName || null,
      };

      await updateAssessment(token, assessment.id, payload);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span>✏️</span>
              Edit Assignment Details & Deadline
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Update submission deadline, instructions, or attached files
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Assignment Title <span className="text-destructive">*</span>
            </label>
            <input
              className="input w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment Title"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Instructions / Description
            </label>
            <textarea
              className="input w-full min-h-[75px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or guidelines..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Editable Deadline <span className="text-destructive">*</span>
              </label>
              <input
                type="datetime-local"
                className="input w-full"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Total Marks <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min={1}
                className="input w-full"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
              />
            </div>
          </div>

          {assessment.type === "DOCUMENT" && (
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Assignment Document File
              </label>
              {docFileName ? (
                <div className="flex items-center justify-between bg-muted/20 p-2.5 rounded-lg border border-border">
                  <span className="truncate text-foreground font-medium flex items-center gap-2">
                    <span>📄</span>
                    {docFileName}
                  </span>
                  <label className="text-[11px] text-primary hover:underline cursor-pointer ml-2 shrink-0">
                    Replace
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                      onChange={handleDocFileSelect}
                    />
                  </label>
                </div>
              ) : (
                <label className="btn-secondary btn-sm cursor-pointer inline-flex items-center gap-1">
                  <span>📎</span> Attach file
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                    onChange={handleDocFileSelect}
                  />
                </label>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              className="btn-secondary text-xs py-2 px-3.5"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-4 shadow-sm"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
