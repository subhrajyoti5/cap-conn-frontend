"use client";

import { useEffect } from "react";

export default function GlobalErrorPage({ error, reset }) {
  useEffect(() => {
    // Log the error to console or error monitoring service
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in-50">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-sm">
        <span className="material-symbols-outlined text-3xl">warning</span>
      </div>

      <h2 className="text-2xl font-bold font-display text-foreground mb-2">
        Something went wrong!
      </h2>
      
      <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
        An unexpected error occurred while rendering this page. Our team has been notified, or you can try recovering by clicking below.
      </p>

      {error?.message && (
        <div className="mb-6 p-3 bg-muted/40 border border-border rounded-lg max-w-lg text-xs font-mono text-muted-foreground break-all text-left">
          <strong>Error Details:</strong> {error.message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="btn-primary py-2.5 px-5 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Try Again
        </button>

        <a
          href="/"
          className="btn-secondary py-2.5 px-5 font-semibold text-xs rounded-xl flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">home</span>
          Return Home
        </a>
      </div>
    </div>
  );
}
