"use client";

import { useState } from "react";
import { uploadResourcePipeline } from "@/features/resources/api/resources.api";

export function UploadResourceModal({ isOpen, onClose, courseId, token, onResourceUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("DOCUMENT");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isVideo = selected.type.startsWith("video/");
    const maxBytes = isVideo ? 500 * 1024 * 1024 : 25 * 1024 * 1024;

    if (selected.size > maxBytes) {
      setError(`File size exceeds limit (${isVideo ? "500MB for video" : "25MB for document/presentation"}).`);
      return;
    }

    setError("");
    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
    if (isVideo) {
      setType("LECTURE");
    } else if (selected.name.endsWith(".ppt") || selected.name.endsWith(".pptx")) {
      setType("PRESENTATION");
    } else {
      setType("DOCUMENT");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      await uploadResourcePipeline(token, {
        courseId,
        file,
        title: title.trim() || file.name,
        type,
        onProgress: (p) => setProgress(p),
      });

      if (onResourceUploaded) {
        onResourceUploaded();
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to upload file. Please verify R2 credentials and file size.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div className="w-full max-w-md rounded-xl bg-card border border-border shadow-xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="font-display text-base font-semibold text-foreground">Upload Course File</h2>
          <button
            onClick={onClose}
            disabled={uploading}
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

        <form onSubmit={handleUpload} className="space-y-4 mt-4 text-xs">
          {/* File Input */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Select File (Videos up to 500MB &bull; Documents up to 25MB)
            </label>
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="w-full text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
            />
            {file && (
              <p className="text-muted-foreground mt-1">
                Selected: <strong>{file.name}</strong> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 1 Architecture Overview"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Resource Type */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="select w-full"
            >
              <option value="DOCUMENT">Document (PDF, Word, Blueprint)</option>
              <option value="PRESENTATION">Presentation Slide Deck</option>
              <option value="LECTURE">Lecture Video (MP4, WebM)</option>
              <option value="STUDY_MATERIAL">Study Material</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Uploading to R2...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="btn-primary text-xs py-1.5 px-4"
            >
              {uploading ? `Uploading (${progress}%)` : "Upload File"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
