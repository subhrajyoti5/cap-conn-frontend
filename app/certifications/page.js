"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import { listCourses, getCourse } from "@/features/courses/api/courses.api";
import { GoogleDriveViewerModal, isGoogleDriveUrl } from "@/components/google-drive-viewer";
import Link from "next/link";

// Pre-designed Executive Blank Certificate Templates (HTML5 / Data Backgrounds)
const PRESET_BACKGROUNDS = [
  {
    id: "GOLD_CREST",
    name: "Classic Gold Crest & Ribbon (Official)",
    bgType: "SVG",
    previewBg: "from-amber-600 to-orange-700",
    defaultPos: { x: 50, y: 44, fontSize: 34, color: "#1e293b", fontFamily: "cursive" },
    renderSvg: (children) => (
      <div className="relative w-full aspect-[4/3] bg-white border-8 border-slate-900 rounded-lg overflow-hidden shadow-2xl p-6 select-none flex flex-col justify-between">
        {/* Navy & Gold Corner Arcs */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-slate-900 via-sky-950 to-amber-500 rounded-br-full opacity-90 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-gradient-to-tl from-slate-900 via-sky-950 to-amber-500 rounded-tl-full opacity-90 pointer-events-none" />
        <div className="absolute inset-3 border-2 border-amber-500/50 rounded-xs pointer-events-none" />
        
        {/* Gold Badge Ribbon Watermark */}
        <div className="absolute bottom-10 left-12 flex flex-col items-center pointer-events-none opacity-90">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-lg border-4 border-amber-600 flex items-center justify-center text-amber-950 font-bold text-2xl">
            ★
          </div>
          <div className="w-6 h-12 bg-red-600 -mt-2 rounded-b-md shadow-md" />
        </div>

        {/* Certificate Header Text */}
        <div className="relative z-10 text-center mt-6 space-y-1">
          <h2 className="font-serif text-3xl font-extrabold tracking-widest text-slate-900 uppercase">
            CERTIFICATE
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-12 bg-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">OF ACHIEVEMENT</span>
            <span className="h-[1px] w-12 bg-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500 pt-4 italic">This proudly certifies that</p>
        </div>

        {/* Custom Positioned Dynamic Name Overlay Slot */}
        {children}

        {/* Footer info */}
        <div className="relative z-10 flex justify-between items-end px-12 pb-4 text-slate-700 text-xs">
          <div className="text-center border-t border-slate-400 pt-1 w-36">
            <p className="font-semibold text-[11px]">Authorized Signatory</p>
            <p className="text-[9px] text-slate-500">Capacity Connect LMS</p>
          </div>
          <div className="text-center border-t border-slate-400 pt-1 w-36">
            <p className="font-semibold text-[11px]">Date of Issue</p>
            <p className="text-[9px] text-slate-500">Official Seal</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ROYAL_EMERALD",
    name: "Royal Emerald & Gold Leaf",
    bgType: "SVG",
    previewBg: "from-emerald-700 to-teal-800",
    defaultPos: { x: 50, y: 46, fontSize: 36, color: "#064e3b", fontFamily: "serif" },
    renderSvg: (children) => (
      <div className="relative w-full aspect-[4/3] bg-amber-50/30 border-8 border-emerald-950 rounded-lg overflow-hidden shadow-2xl p-6 select-none flex flex-col justify-between">
        <div className="absolute inset-3 border-4 border-double border-emerald-600/40 rounded-xs pointer-events-none" />
        
        <div className="relative z-10 text-center mt-6 space-y-1">
          <span className="text-3xl text-emerald-700">🌿</span>
          <h2 className="font-serif text-3xl font-extrabold tracking-widest text-emerald-950 uppercase">
            CERTIFICATE OF EXCELLENCE
          </h2>
          <p className="text-[11px] text-emerald-800 pt-4 italic">Is hereby presented to</p>
        </div>

        {children}

        <div className="relative z-10 flex justify-between items-end px-12 pb-4 text-emerald-900 text-xs">
          <div className="text-center border-t border-emerald-700/60 pt-1 w-36">
            <p className="font-bold text-[11px]">Academic Registrar</p>
          </div>
          <div className="text-center border-t border-emerald-700/60 pt-1 w-36">
            <p className="font-bold text-[11px]">Verified Credentials</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "MODERN_INDIGO",
    name: "Modern Tech Executive Indigo",
    bgType: "SVG",
    previewBg: "from-indigo-700 to-violet-800",
    defaultPos: { x: 50, y: 44, fontSize: 34, color: "#1e1b4b", fontFamily: "sans" },
    renderSvg: (children) => (
      <div className="relative w-full aspect-[4/3] bg-slate-900 border-8 border-indigo-600 rounded-lg overflow-hidden shadow-2xl p-6 select-none flex flex-col justify-between text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 text-center mt-6 space-y-1">
          <span className="badge bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-[10px] font-mono uppercase">
            Official Technical Mastery
          </span>
          <h2 className="font-display text-3xl font-black tracking-wider text-white uppercase mt-2">
            CERTIFICATE OF COMPLETION
          </h2>
          <p className="text-[11px] text-indigo-200/80 pt-3">This document certifies that</p>
        </div>

        {children}

        <div className="relative z-10 flex justify-between items-end px-12 pb-4 text-indigo-200 text-xs">
          <div className="text-center border-t border-indigo-500/40 pt-1 w-36">
            <p className="font-bold text-[11px] text-white">Lead Instructor</p>
          </div>
          <div className="text-center border-t border-indigo-500/40 pt-1 w-36">
            <p className="font-bold text-[11px] text-white">Digital Verification</p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function CertificationsPage() {
  const { getToken, user } = useAuth();
  const isTrainerOrAdmin = user?.role === "TRAINER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  // Tab State: "CERTIFICATES" | "SEND_CERTIFICATES"
  const [activeTab, setActiveTab] = useState("CERTIFICATES");

  // Trainee certificates list
  const [certifications, setCertifications] = useState([]);
  // Trainer/Admin distributed certificates list
  const [distributedCertifications, setDistributedCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedCert, setSelectedCert] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [digitalPreviewCert, setDigitalPreviewCert] = useState(null);
  const [inspectRecipientsCert, setInspectRecipientsCert] = useState(null);
  const [successModalData, setSuccessModalData] = useState(null);

  // Trainer Certificate Studio State
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrolledTrainees, setEnrolledTrainees] = useState([]);
  const [selectedTraineeIds, setSelectedTraineeIds] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(false);

  // Custom Image & Position Configuration State
  const [customImageBg, setCustomImageBg] = useState(null);
  const [nameX, setNameX] = useState(50);
  const [nameY, setNameY] = useState(44);
  const [fontSize, setFontSize] = useState(34);
  const [fontColor, setFontColor] = useState("#1e293b");
  const [fontFamily, setFontFamily] = useState("cursive");

  // Form Metadata State
  const [certName, setCertName] = useState("Certificate of Completion");
  const [certIssuer, setCertIssuer] = useState(user?.name ? `${user.name} (Capacity Connect)` : "Capacity Connect LMS");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  async function loadData() {
    const token = await getToken();
    if (!token) return;
    try {
      if (isTrainerOrAdmin) {
        // Fetch distributed certificates
        const distRes = await apiFetch("/certifications/distributed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const distData = distRes.data || [];
        setDistributedCertifications(distData);
      } else {
        // Fetch trainee awarded certificates
        const res = await apiFetch("/certifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertifications(res.data || []);
      }
    } catch (e) {
      console.error("Error loading certifications:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [getToken, isTrainerOrAdmin]);

  useEffect(() => {
    async function loadTrainerCourses() {
      if (!isTrainerOrAdmin) return;
      const token = await getToken();
      if (!token) return;
      try {
        const res = await listCourses(token);
        const allCourses = res.data || [];
        // Only main (primary) trainer can send certificates for a course (or Admin can see all)
        const eligibleCourses =
          user?.role === "ADMIN"
            ? allCourses
            : allCourses.filter((c) => (c.primaryTrainerId ? c.primaryTrainerId === user?.id : c.trainerId === user?.id));
        setCourses(eligibleCourses);
        if (eligibleCourses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(eligibleCourses[0].id);
        }
      } catch (e) {
        console.error("Error fetching courses for studio:", e);
      }
    }
    if (activeTab === "SEND_CERTIFICATES") {
      loadTrainerCourses();
    }
  }, [activeTab, isTrainerOrAdmin, getToken, user?.id, user?.role]);

  useEffect(() => {
    async function loadCourseDetails() {
      if (!selectedCourseId) return;
      setLoadingCourse(true);
      const token = await getToken();
      if (!token) return;
      try {
        const res = await getCourse(token, selectedCourseId);
        const courseData = res.data || res;
        const activeEnrollments = courseData.enrollments?.filter((e) => e.status === "ACTIVE") || [];
        const trainees = activeEnrollments.map((e) => e.trainee).filter(Boolean);
        setEnrolledTrainees(trainees);
        setSelectedTraineeIds(trainees.map((t) => t.id));
      } catch (e) {
        console.error("Error fetching course trainees:", e);
      } finally {
        setLoadingCourse(false);
      }
    }
    if (activeTab === "SEND_CERTIFICATES") {
      loadCourseDetails();
    }
  }, [selectedCourseId, activeTab, getToken]);

  const handleCustomImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const bgData = event.target.result;
        setCustomImageBg(bgData);
        showToast("🖼️ Custom blank certificate background uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSavedTemplate = (tmpl) => {
    if (tmpl.customImageBg) {
      setCustomImageBg(tmpl.customImageBg);
    }
    if (tmpl.namePos) {
      setNameX(tmpl.namePos.x);
      setNameY(tmpl.namePos.y);
      setFontSize(tmpl.namePos.fontSize);
      setFontColor(tmpl.namePos.color);
      setFontFamily(tmpl.namePos.fontFamily);
    }
    showToast(`Imported previously sent certificate design: ${tmpl.name}`);
  };

  const handleIssueCertificates = async (e) => {
    e.preventDefault();
    if (!customImageBg) {
      showToast("⚠️ Please upload a blank certificate image or select a previously sent certificate.");
      return;
    }
    if (selectedTraineeIds.length === 0) {
      showToast("⚠️ Please select at least one trainee to award certificates.");
      return;
    }
    if (!certName.trim()) {
      showToast("⚠️ Certificate title is required.");
      return;
    }

    setIssuing(true);
    const token = await getToken();
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);

    const templateDataPayload = {
      customImageBg: customImageBg,
      namePos: { x: nameX, y: nameY, fontSize, color: fontColor, fontFamily },
      courseId: selectedCourseId,
      courseTitle: selectedCourse ? selectedCourse.title : "",
    };

    try {
      await apiFetch("/certifications/issue", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          traineeIds: selectedTraineeIds,
          name: certName.trim(),
          issuer: certIssuer.trim(),
          credentialUrl: credentialUrl.trim() || null,
          templateData: JSON.stringify(templateDataPayload),
        }),
      });

      // Open Success Window Modal
      setSuccessModalData({
        title: certName.trim(),
        count: selectedTraineeIds.length,
        courseTitle: selectedCourse ? selectedCourse.title : "Course",
      });

      loadData();
    } catch (e) {
      console.error("Error issuing certificates:", e);
      showToast("❌ Failed to issue certificates. Please check payload size or network connection.");
    } finally {
      setIssuing(false);
    }
  };

  function parseTemplateData(cert) {
    if (!cert?.templateData) return null;
    try {
      return typeof cert.templateData === "string" ? JSON.parse(cert.templateData) : cert.templateData;
    } catch (e) {
      return null;
    }
  }

  // Group distributed certificates by unique batch (Name + IssueDate + Issuer)
  const groupedDistributedCertificates = Object.values(
    distributedCertifications
      .filter((c) => c.issuerId || c.templateData || c.userId !== user?.id)
      .reduce((acc, cert) => {
        const key = `${cert.name}_${new Date(cert.issueDate).toDateString()}_${cert.issuer}`;
        if (!acc[key]) {
          acc[key] = {
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issueDate: cert.issueDate,
            templateData: cert.templateData,
            credentialUrl: cert.credentialUrl,
            trainees: [],
          };
        }
        if (cert.user) {
          acc[key].trainees.push({
            id: cert.user.id,
            name: cert.user.name,
            email: cert.user.email,
            issueDate: cert.issueDate,
          });
        }
        return acc;
      }, {})
  );

  // Extract ONLY previously sent certificates for Option B selector
  const previouslySentCertificates = groupedDistributedCertificates
    .map((batch) => {
      const tmpl = parseTemplateData(batch);
      if (!tmpl?.customImageBg) return null;
      return {
        id: `PREV_${batch.id}`,
        name: `${batch.name} (${batch.trainees.length} Trainees)`,
        customImageBg: tmpl.customImageBg,
        namePos: tmpl.namePos,
      };
    })
    .filter(Boolean);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-44 w-full bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-800 text-white p-8 shadow-lg shadow-orange/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="badge bg-white/20 text-white border-transparent text-xs font-mono uppercase tracking-wider">
              {isTrainerOrAdmin ? "Certificate Management & Distribution" : "Academic & Credential Vault"}
            </span>
            <h1 className="font-display text-display-lg text-white mt-3 leading-tight">
              {isTrainerOrAdmin ? "Certificate Distribution Window" : "Certifications & Credentials"}
            </h1>
            <p className="text-white/80 text-xs mt-2 leading-relaxed max-w-xl">
              {isAdmin
                ? "View all certificates distributed across courses by trainers and inspect batch recipient lists."
                : isTrainerOrAdmin
                ? "Upload custom blank certificate templates, position text fields, and issue verified credentials to course trainees."
                : "View and verify your official course completion certificates and academic credentials."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isTrainerOrAdmin && (
              <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl flex items-center gap-1 border border-white/20">
                <button
                  onClick={() => setActiveTab("CERTIFICATES")}
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${activeTab === "CERTIFICATES" ? "bg-white text-orange-950 shadow-sm" : "text-white hover:bg-white/10"}`}
                >
                  Certificates ({groupedDistributedCertificates.length})
                </button>
                {!isAdmin && (
                  <button
                    onClick={() => setActiveTab("SEND_CERTIFICATES")}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === "SEND_CERTIFICATES" ? "bg-white text-orange-950 shadow-sm" : "text-white hover:bg-white/10"}`}
                  >
                    <span>📜</span> Send Certificates
                  </button>
                )}
              </div>
            )}
            {!isTrainerOrAdmin && (
              <Link href="/courses" className="btn-secondary bg-white text-orange-900 font-bold text-xs py-2.5 px-4">
                Browse Courses
              </Link>
            )}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none" />
      </div>

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-4 rounded-xl font-medium animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* CERTIFICATES TAB (TRAINEE VIEW or TRAINER/ADMIN DISTRIBUTED VIEW) */}
      {activeTab === "CERTIFICATES" && (
        <div className="space-y-6">
          {/* TRAINEE VIEW */}
          {!isTrainerOrAdmin && (
            <div>
              {certifications.length === 0 ? (
                <div className="empty-state bg-card border border-border rounded-2xl p-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center text-3xl">
                    🏆
                  </div>
                  <p className="empty-state-title font-display font-bold text-base text-foreground">No certifications awarded yet</p>
                  <p className="empty-state-desc text-xs text-muted-foreground max-w-sm mx-auto">
                    Complete enrolled courses or wait for your instructors to issue official course certificates.
                  </p>
                  <Link href="/courses" className="btn-primary inline-flex mt-2">
                    Explore Active Classrooms
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certifications.map((cert, index) => {
                    const hasDriveLink = isGoogleDriveUrl(cert.credentialUrl);
                    return (
                      <div
                        key={cert.id || index}
                        className="group card-shell flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card hover:shadow-elevated transition-all duration-300"
                      >
                        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 text-white relative">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-2xl">📜</span>
                            <span className="badge bg-white/20 text-white border-transparent text-[9px] font-mono uppercase tracking-wider">
                              Verified Certificate
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-base text-white mt-3 line-clamp-2 leading-snug">
                            {cert.name}
                          </h3>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">🏛️ {cert.issuer}</p>
                            <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border/60 pt-2">
                              <div className="flex justify-between">
                                <span>Issue Date:</span>
                                <span className="font-mono text-foreground">
                                  {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                            <button
                              onClick={() => setDigitalPreviewCert(cert)}
                              className="btn-primary text-xs py-2 flex-1 text-center font-bold shadow-xs"
                            >
                              🎓 View Certificate
                            </button>
                            {cert.credentialUrl && (
                              <button
                                onClick={() => {
                                  setSelectedCert(cert);
                                  setViewerOpen(true);
                                }}
                                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 font-bold"
                              >
                                🔗 {hasDriveLink ? "Drive" : "Credential"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TRAINER & ADMIN DISTRIBUTED CERTIFICATES VIEW */}
          {isTrainerOrAdmin && (
            <div>
              {groupedDistributedCertificates.length === 0 ? (
                <div className="empty-state bg-card border border-border rounded-2xl p-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center text-3xl">
                    📜
                  </div>
                  <p className="empty-state-title font-display font-bold text-base text-foreground">No distributed certificates yet</p>
                  <p className="empty-state-desc text-xs text-muted-foreground max-w-sm mx-auto">
                    {isAdmin
                      ? "No certificates have been issued by trainers across the platform."
                      : "You have not distributed any certificates to course members yet."}
                  </p>
                  {!isAdmin && (
                    <button onClick={() => setActiveTab("SEND_CERTIFICATES")} className="btn-primary inline-flex mt-2">
                      Send Certificate Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedDistributedCertificates.map((batch, index) => {
                    const tmpl = parseTemplateData(batch);
                    return (
                      <div
                        key={batch.id || index}
                        className="group card-shell flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card hover:shadow-elevated transition-all duration-300"
                      >
                        <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-5 text-white relative">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-2xl">📜</span>
                            <span className="badge bg-white/20 text-white border-transparent text-[9px] font-mono uppercase tracking-wider">
                              Distributed Batch
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-base text-white mt-3 line-clamp-2 leading-snug">
                            {batch.name}
                          </h3>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                              <span>🏛️ {batch.issuer}</span>
                              {tmpl?.courseTitle && <span className="font-mono text-[10px] text-primary truncate max-w-[120px]">{tmpl.courseTitle}</span>}
                            </p>
                            <div className="text-[11px] text-muted-foreground space-y-1.5 pt-2 border-t border-border/60">
                              <div className="flex justify-between items-center">
                                <span>Recipients Awarded:</span>
                                <span className="badge bg-primary/10 text-primary font-bold text-xs font-mono">
                                  👥 {batch.trainees.length} Trainees
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sent Date:</span>
                                <span className="font-mono text-foreground font-semibold">
                                  {batch.issueDate ? new Date(batch.issueDate).toLocaleDateString() : "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                            <button
                              onClick={() => setInspectRecipientsCert(batch)}
                              className="btn-primary text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1 font-semibold shadow-xs"
                            >
                              <span>👁️</span> View Trainees ({batch.trainees.length})
                            </button>

                            {tmpl?.customImageBg && (
                              <button
                                onClick={() => {
                                  handleSelectSavedTemplate({
                                    name: batch.name,
                                    customImageBg: tmpl.customImageBg,
                                    namePos: tmpl.namePos,
                                  });
                                  setActiveTab("SEND_CERTIFICATES");
                                }}
                                className="btn-secondary text-xs py-2 px-3 flex-1 text-center font-semibold"
                                title="Import into Send Certificates editor"
                              >
                                Reuse Template ↗
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SEND CERTIFICATES STUDIO TAB (Trainers Only) */}
      {activeTab === "SEND_CERTIFICATES" && !isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Classroom & Template Configuration Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Classroom & Trainees */}
            <div className="card border border-border p-6 bg-card rounded-2xl space-y-5 shadow-sm">
              <div className="border-b border-border pb-3">
                <h2 className="font-display font-bold text-sm text-foreground">1. Select Classroom & Trainees</h2>
                <p className="text-[11px] text-muted-foreground">Pick trainees to receive custom image certificates</p>
              </div>

              <div>
                <label className="label text-xs font-semibold">Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="input-field text-xs w-full max-w-full py-2.5 bg-muted/20 border-border font-medium truncate cursor-pointer"
                  style={{ maxWidth: "100%" }}
                >
                  {courses.length === 0 ? (
                    <option value="">No main trainer courses found</option>
                  ) : (
                    courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label text-xs font-semibold">
                    Enrolled Trainees ({selectedTraineeIds.length}/{enrolledTrainees.length})
                  </label>
                  {enrolledTrainees.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTraineeIds(
                          selectedTraineeIds.length === enrolledTrainees.length ? [] : enrolledTrainees.map((t) => t.id)
                        )
                      }
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      {selectedTraineeIds.length === enrolledTrainees.length ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>

                {loadingCourse ? (
                  <div className="space-y-2 py-2 animate-pulse">
                    <div className="h-9 bg-muted rounded-xl" />
                  </div>
                ) : enrolledTrainees.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border rounded-xl">
                    No active enrolled trainees in this classroom.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {enrolledTrainees.map((trainee) => {
                      const isSelected = selectedTraineeIds.includes(trainee.id);
                      return (
                        <div
                          key={trainee.id}
                          onClick={() =>
                            setSelectedTraineeIds((prev) =>
                              prev.includes(trainee.id) ? prev.filter((id) => id !== trainee.id) : [...prev, trainee.id]
                            )
                          }
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5 font-semibold" : "border-border/60 hover:bg-muted/20"}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input type="checkbox" checked={isSelected} readOnly className="rounded border-border text-primary h-3.5 w-3.5" />
                            <span className="truncate text-foreground text-xs">{trainee.name || trainee.email}</span>
                          </div>
                          {isSelected && <span className="text-primary font-bold text-xs">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Custom Blank Certificate Background Upload / Saved Template Selector */}
            <div className="card border border-border p-6 bg-card rounded-2xl space-y-5 shadow-sm">
              <div className="border-b border-border pb-3">
                <h2 className="font-display font-bold text-sm text-foreground">2. Certificate Background Design</h2>
                <p className="text-[11px] text-muted-foreground">Upload custom blank certificate image or pick saved template</p>
              </div>

              {/* Upload Custom Image Button */}
              <div className="space-y-2">
                <label className="label text-xs font-semibold">Option A: Upload New Blank Certificate Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border/60"></div>
                <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase font-mono">Option B: Previously Sent Certificates</span>
                <div className="flex-grow border-t border-border/60"></div>
              </div>

              {/* Scrollable Previously Sent Certificates Selector */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {previouslySentCertificates.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border rounded-xl">
                    No previously sent certificates yet. Upload a blank certificate image above to start.
                  </p>
                ) : (
                  previouslySentCertificates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectSavedTemplate(tmpl)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${customImageBg === tmpl.customImageBg ? "border-primary bg-primary/10 font-bold shadow-xs" : "border-border/70 hover:bg-muted/30"}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {tmpl.customImageBg ? (
                          <div className="w-8 h-6 rounded-md bg-cover bg-center shrink-0 border" style={{ backgroundImage: `url(${tmpl.customImageBg})` }} />
                        ) : (
                          <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-600 to-orange-700 shrink-0 flex items-center justify-center text-[10px] text-white font-bold">📜</div>
                        )}
                        <span className="text-foreground truncate">{tmpl.name}</span>
                      </div>
                      {customImageBg === tmpl.customImageBg && <span className="text-primary font-bold text-xs shrink-0">Active</span>}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* 3. Trainee Name Field Positioning & Typography */}
            <div className="card border border-border p-6 bg-card rounded-2xl space-y-5 shadow-sm">
              <div className="border-b border-border pb-3">
                <h2 className="font-display font-bold text-sm text-foreground">3. Trainee Name Text Field Position</h2>
                <p className="text-[11px] text-muted-foreground">Adjust target box location & text style on canvas</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Vertical Position (Top Y%)</span>
                    <span className="font-mono text-primary">{nameY}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={nameY}
                    onChange={(e) => setNameY(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Horizontal Position (Left X%)</span>
                    <span className="font-mono text-primary">{nameX}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={nameX}
                    onChange={(e) => setNameX(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs font-semibold">Font Size ({fontSize}px)</label>
                    <input
                      type="range"
                      min="18"
                      max="60"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="label text-xs font-semibold">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0 bg-transparent"
                      />
                      <span className="font-mono text-xs uppercase">{fontColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label text-xs font-semibold">Typography Style</label>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFontFamily("cursive")}
                      className={`p-2 rounded-lg border text-center text-xs font-serif italic ${fontFamily === "cursive" ? "border-primary bg-primary/10 font-bold" : "border-border"}`}
                    >
                      Calligraphy
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily("serif")}
                      className={`p-2 rounded-lg border text-center text-xs font-serif ${fontFamily === "serif" ? "border-primary bg-primary/10 font-bold" : "border-border"}`}
                    >
                      Classic Serif
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily("sans")}
                      className={`p-2 rounded-lg border text-center text-xs font-sans ${fontFamily === "sans" ? "border-primary bg-primary/10 font-bold" : "border-border"}`}
                    >
                      Modern Sans
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Canvas Preview Editor & Submit Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card border border-border p-6 bg-card rounded-2xl space-y-6 shadow-sm">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-sm text-foreground">Live Interactive Canvas Preview</h2>
                  <p className="text-[11px] text-muted-foreground">Trainee name is dynamically positioned over the custom background</p>
                </div>
                <span className="badge bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase font-bold">
                  Interactive Editor
                </span>
              </div>

              {/* CANVAS CONTAINER */}
              <div className="relative w-full rounded-xl overflow-hidden shadow-xl border border-border/80 bg-slate-100 dark:bg-slate-900">
                {customImageBg ? (
                  <div className="relative w-full aspect-[4/3] bg-contain bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: `url(${customImageBg})` }}>
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all duration-75 px-4"
                      style={{
                        top: `${nameY}%`,
                        left: `${nameX}%`,
                        fontSize: `${fontSize}px`,
                        color: fontColor,
                        fontFamily: fontFamily === "cursive" ? "Georgia, cursive" : fontFamily === "serif" ? "Playfair Display, Georgia, serif" : "Inter, sans-serif",
                        fontStyle: fontFamily === "cursive" ? "italic" : "normal",
                        fontWeight: fontFamily === "cursive" || fontFamily === "serif" ? "700" : "800",
                      }}
                    >
                      Trainee Name
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[4/3] flex flex-col items-center justify-center p-8 text-center space-y-3 bg-muted/20 border-2 border-dashed border-border rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl">
                      🖼️
                    </div>
                    <p className="font-bold text-sm text-foreground">No Certificate Image Loaded</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Upload a custom blank certificate image above or select a previously sent certificate to preview positioning.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Metadata & Final Action */}
              <form onSubmit={handleIssueCertificates} className="space-y-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-xs font-semibold">Certificate Title</label>
                    <input
                      type="text"
                      required
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      className="input-field text-xs w-full py-2.5"
                      placeholder="e.g. Certificate of Excellence in Climate Science"
                    />
                  </div>

                  <div>
                    <label className="label text-xs font-semibold">Issuing Authority / Instructor</label>
                    <input
                      type="text"
                      required
                      value={certIssuer}
                      onChange={(e) => setCertIssuer(e.target.value)}
                      className="input-field text-xs w-full py-2.5"
                      placeholder="e.g. Capacity Connect Academy"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs font-semibold">Google Drive Verification URL (Optional)</label>
                  <input
                    type="url"
                    value={credentialUrl}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    className="input-field text-xs w-full py-2.5"
                    placeholder="https://drive.google.com/file/d/.../view"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={issuing || selectedTraineeIds.length === 0}
                    className="btn-primary py-3.5 px-8 font-bold text-xs shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <span>📜</span>
                    {issuing
                      ? "Awarding Certificates..."
                      : `Award Certificates to Selected Trainees (${selectedTraineeIds.length})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
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

      {/* Modal: View Recipients of Distributed Certificate (Trainer & Admin) */}
      {inspectRecipientsCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectRecipientsCert(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center bg-muted"
            >
              ✕
            </button>

            <div className="border-b border-border pb-3">
              <span className="badge bg-primary/10 text-primary font-mono text-[10px] uppercase font-bold">
                Batch Recipients Directory
              </span>
              <h3 className="font-display font-bold text-lg text-foreground mt-1">{inspectRecipientsCert.name}</h3>
              <p className="text-xs text-muted-foreground">Issued By: {inspectRecipientsCert.issuer}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Trainees Awarded ({inspectRecipientsCert.trainees.length})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {inspectRecipientsCert.trainees.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">{t.name || "Trainee"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{t.email}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {t.issueDate ? new Date(t.issueDate).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setInspectRecipientsCert(null)}
                className="btn-primary text-xs py-2 px-6 font-bold"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Certificate Badge Modal (For Trainees & Viewing) */}
      {digitalPreviewCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setDigitalPreviewCert(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center bg-muted z-30"
            >
              ✕
            </button>

            {(() => {
              const tmplData = parseTemplateData(digitalPreviewCert);
              const customBg = tmplData?.customImageBg;
              const pos = tmplData?.namePos || { x: 50, y: 44, fontSize: 34, color: "#1e293b", fontFamily: "cursive" };

              return (
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-xl border border-border bg-slate-100 dark:bg-slate-900">
                  {customBg ? (
                    <div className="relative w-full aspect-[4/3] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${customBg})` }}>
                      <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-4"
                        style={{
                          top: `${pos.y}%`,
                          left: `${pos.x}%`,
                          fontSize: `${pos.fontSize}px`,
                          color: pos.color,
                          fontFamily: pos.fontFamily === "cursive" ? "Georgia, cursive" : pos.fontFamily === "serif" ? "Playfair Display, Georgia, serif" : "Inter, sans-serif",
                          fontStyle: pos.fontFamily === "cursive" ? "italic" : "normal",
                          fontWeight: pos.fontFamily === "cursive" || pos.fontFamily === "serif" ? "700" : "800",
                        }}
                      >
                        {user?.name || "Trainee Recipient"}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[4/3] flex flex-col items-center justify-center p-8 text-center space-y-3 bg-muted/20 border-2 border-dashed border-border rounded-xl">
                      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl">
                        📜
                      </div>
                      <p className="font-bold text-sm text-foreground">{digitalPreviewCert.name}</p>
                      <p className="text-xs text-muted-foreground">Issued to {user?.name || "Trainee"}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-muted-foreground">
                Issued By: <span className="font-semibold text-foreground">{digitalPreviewCert.issuer}</span>
              </p>
              <button
                onClick={() => window.print()}
                className="btn-primary text-xs py-2 px-6 font-bold flex items-center gap-1.5"
              >
                <span>🖨️</span> Print / Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Window Modal */}
      {successModalData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl">
              🎉
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-foreground">Certificates Issued Successfully!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your certificate <strong className="text-foreground">"{successModalData.title}"</strong> has been awarded to{" "}
                <strong className="text-primary">{successModalData.count} trainees</strong> in{" "}
                <strong className="text-foreground">{successModalData.courseTitle}</strong>.
              </p>
            </div>

            <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 text-xs text-muted-foreground font-mono">
              In-app notifications & credentials have been delivered to all recipient accounts.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setSuccessModalData(null);
                  setActiveTab("CERTIFICATES");
                }}
                className="btn-primary flex-1 py-3 font-bold text-xs shadow-sm"
              >
                View Distributed Certificates
              </button>
              <button
                onClick={() => setSuccessModalData(null)}
                className="btn-secondary py-3 px-5 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}