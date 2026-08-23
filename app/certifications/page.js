"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import { GoogleDriveViewerModal, isGoogleDriveUrl } from "@/components/google-drive-viewer";
import Link from "next/link";

export default function CertificationsPage() {
  const { getToken } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document Viewer Modal State
  const [selectedCert, setSelectedCert] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await apiFetch("/certifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertifications(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  const handlePreviewCertificate = (cert) => {
    setSelectedCert(cert);
    setViewerOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in stagger-1">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-6 skeleton h-36" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-bold">Certifications & Credentials</h1>
          <p className="page-subtitle text-sm text-muted mt-1">
            Verified academic, cloud, and professional credentials with Google Drive file previews.
          </p>
        </div>
        <Link href="/courses" className="btn-secondary shrink-0">
          Browse Courses
        </Link>
      </div>

      {certifications.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.77 1.354m-.003-6.846A6.003 6.003 0 0012 3.75c1.47 0 2.82.527 3.873 1.404" />
          </svg>
          <p className="empty-state-title">No certifications found</p>
          <p className="empty-state-desc">You have not registered any certifications yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certifications.map((cert, index) => {
            const hasDriveLink = isGoogleDriveUrl(cert.credentialUrl);
            return (
              <div
                key={cert.id || index}
                className="card-shell"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="card p-6 h-full flex flex-col justify-between border border-border bg-surface hover:shadow-lg transition-all duration-200">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <span className="text-xl">🏆</span>
                      </div>
                      <span className="badge badge-success text-xs font-medium">Verified</span>
                    </div>

                    <h3 className="font-semibold text-base text-ink mb-1 line-clamp-2">{cert.name}</h3>
                    <p className="text-xs font-medium text-muted mb-4">{cert.issuer}</p>

                    <div className="space-y-1.5 text-xs text-muted border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span>Issued:</span>
                        <span className="text-ink font-medium">
                          {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      {cert.expiryDate && (
                        <div className="flex justify-between">
                          <span>Valid Until:</span>
                          <span className="text-ink font-medium">
                            {new Date(cert.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                    {hasDriveLink ? (
                      <button
                        onClick={() => handlePreviewCertificate(cert)}
                        className="btn-primary text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View in Drive Viewer</span>
                      </button>
                    ) : cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs py-1.5 px-3 w-full text-center"
                      >
                        View Credential ↗
                      </a>
                    ) : (
                      <span className="text-xs text-muted">No URL attached</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Google Drive Certificate Modal Preview */}
      {selectedCert && (
        <GoogleDriveViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          url={selectedCert.credentialUrl}
          title={`${selectedCert.name} (${selectedCert.issuer})`}
          type="CERTIFICATE"
        />
      )}
    </div>
  );
}
