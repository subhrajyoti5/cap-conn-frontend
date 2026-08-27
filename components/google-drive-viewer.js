"use client";

import { useState, useEffect } from "react";

/**
 * Converts various Google Drive / Docs / Slides URLs to their embeddable preview URLs
 */
export function getEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";

  // Google Slides Presentation
  const presentationMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presentationMatch && presentationMatch[1]) {
    return `https://docs.google.com/presentation/d/${presentationMatch[1]}/embed?start=false&loop=false&delayms=3000`;
  }

  // Google Drive File (PDF, images, certificates, etc.)
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  // Google Docs Document
  const docMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) {
    return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
  }

  // Google Sheets
  const sheetMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch && sheetMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/preview`;
  }

  // If already an embed or preview URL, return as is
  if (url.includes("/preview") || url.includes("/embed")) {
    return url;
  }

  return url;
}

export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes("docs.google.com") ||
    url.includes("drive.google.com")
  );
}

/**
 * Interactive Modal for viewing Google Drive / Slides / Docs files
 */
export function GoogleDriveViewerModal({ isOpen, onClose, url, title = "Document Viewer", type = "DOCUMENT" }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIframeLoaded(false);
  }, [url]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !url) return null;

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div
        className={`bg-[#0f172a] text-slate-100 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-5xl h-[88vh]"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#1e293b]/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              {type === "PRESENTATION" ? (
                <span className="icon text-xl" aria-hidden="true">co_present</span>
              ) : (
                <span className="icon text-xl" aria-hidden="true">description</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Google Drive Viewer &bull; {type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Open in Google Drive"
            >
              <span>Open in Drive</span>
              <span className="icon text-sm" aria-hidden="true">open_in_new</span>
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <span className="icon text-base" aria-hidden="true">fullscreen_exit</span>
              ) : (
                <span className="icon text-base" aria-hidden="true">fullscreen</span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
              title="Close viewer"
              aria-label="Close"
            >
              <span className="icon text-xl" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="relative flex-1 w-full h-full bg-[#090d16] overflow-hidden">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#090d16] text-slate-400 z-10">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading document viewer...</p>
            </div>
          )}

          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Google Drive Document / Presentation Frame
 */
export function GoogleDriveInlineViewer({ url, title = "Preview", className = "h-96" }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const embedUrl = getEmbedUrl(url);

  if (!url) return null;

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-border bg-surface ${className}`}>
      {!iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-surface text-muted z-10">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs">Loading document...</span>
        </div>
      )}
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        onLoad={() => setIframeLoaded(true)}
      />
    </div>
  );
}
