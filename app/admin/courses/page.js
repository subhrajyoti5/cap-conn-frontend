"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/features/auth/auth-context";
import Link from "next/link";
import {
  listCourses,
  updateCourseStatus,
  deleteCourse,
  updateCourseFeatured,
  reorderFeaturedCoursesApi,
} from "@/features/courses/api/courses.api";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Archive,
  RotateCcw,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function AdminCoursesPage() {
  const { getToken } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Active Tab: "ACTIVE_CATALOG" | "SUSPENDED_VAULT"
  const [activeTab, setActiveTab] = useState("ACTIVE_CATALOG");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal State for Suspend / Restore / Permanent Delete
  const [modalType, setModalType] = useState(null); // "SUSPEND" | "RESTORE" | "DELETE_PERMANENT"
  const [selectedCourse, setSelectedCourse] = useState(null);

  async function loadCourses() {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await listCourses(token);
      setCourses(res.data || []);
    } catch (e) {
      console.error("Error loading admin courses:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, [getToken]);

  const subjectsList = useMemo(() => {
    const subsMap = new Map();
    courses.forEach((c) => {
      if (c.subject) {
        subsMap.set(c.subject.id, c.subject.name);
      }
    });
    return Array.from(subsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [courses]);

  // Separate active vs suspended courses
  const activeCatalogCourses = useMemo(() => {
    return courses.filter((c) => ["PUBLISHED", "ACTIVE", "DRAFT"].includes(c.status));
  }, [courses]);

  const suspendedVaultCourses = useMemo(() => {
    return courses.filter((c) => ["SUSPENDED", "ARCHIVED"].includes(c.status));
  }, [courses]);

  // Featured / Newly Added Curation list
  const featuredCoursesList = useMemo(() => {
    return courses
      .filter((c) => (c.status === "PUBLISHED" || c.status === "ACTIVE") && c.isFeatured !== false)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  }, [courses]);

  const nonFeaturedCoursesList = useMemo(() => {
    return courses.filter(
      (c) => (c.status === "PUBLISHED" || c.status === "ACTIVE") && c.isFeatured === false
    );
  }, [courses]);

  const [curatedList, setCuratedList] = useState([]);
  const [savingCuration, setSavingCuration] = useState(false);

  useEffect(() => {
    setCuratedList(featuredCoursesList);
  }, [featuredCoursesList]);

  async function handleToggleFeatured(courseId, targetStatus) {
    const token = await getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      await updateCourseFeatured(token, courseId, targetStatus, 0);
      await loadCourses();
    } catch (e) {
      console.error("Error toggling course featured status:", e);
    } finally {
      setActionLoading(false);
    }
  }

  function handleMoveCourse(index, direction) {
    const updated = [...curatedList];
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCuratedList(updated);
  }

  async function handleSaveFeaturedSequence() {
    const token = await getToken();
    if (!token) return;
    setSavingCuration(true);
    try {
      const courseOrders = curatedList.map((c, idx) => ({
        id: c.id,
        featuredOrder: idx + 1,
        isFeatured: true,
      }));
      await reorderFeaturedCoursesApi(token, courseOrders);
      await loadCourses();
    } catch (e) {
      console.error("Error saving featured sequence:", e);
    } finally {
      setSavingCuration(false);
    }
  }

  const currentTabCourses = activeTab === "ACTIVE_CATALOG" ? activeCatalogCourses : suspendedVaultCourses;

  const filteredCourses = useMemo(() => {
    return currentTabCourses.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.subject?.name && c.subject.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject =
        selectedSubject === "ALL" || c.subjectId === selectedSubject;

      const matchesStatus =
        selectedStatus === "ALL" || c.status === selectedStatus;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [currentTabCourses, searchQuery, selectedSubject, selectedStatus]);

  const handleConfirmAction = async () => {
    if (!selectedCourse || !modalType) return;
    setActionLoading(true);

    try {
      const token = await getToken();
      if (modalType === "SUSPEND") {
        await updateCourseStatus(token, selectedCourse.id, "SUSPENDED");
      } else if (modalType === "RESTORE") {
        await updateCourseStatus(token, selectedCourse.id, "PUBLISHED");
      } else if (modalType === "DELETE_PERMANENT") {
        await deleteCourse(token, selectedCourse.id);
      }

      setModalType(null);
      setSelectedCourse(null);
      await loadCourses();
    } catch (e) {
      console.error("Action error:", e);
      alert(e.message || "Operation failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-7xl mx-auto">
        <div className="h-44 w-full bg-muted/50 rounded-2xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted/40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in stagger-1">
      {/* Enterprise Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
              Admin Course Governance
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Course Catalog & Suspended Courses
            </h1>
            <p className="text-xs text-slate-300">
              Supervise active platform courses or manage suspended and archived courses.
            </p>
          </div>

          <Link
            href="/courses/create"
            className="btn-primary text-xs py-2.5 px-4 font-semibold shadow-md shrink-0 flex items-center gap-1.5 text-white hover:text-white"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white hover:text-white">Create Course</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Tabs (Active Catalog vs Suspended vs Curation) */}
      <div className="flex items-center gap-3 border-b border-border/80 pb-2 flex-wrap">
        <button
          onClick={() => {
            setActiveTab("ACTIVE_CATALOG");
            setSelectedStatus("ALL");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "ACTIVE_CATALOG"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground border border-border/80 hover:bg-muted/20"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Active Courses</span>
          <span className="ml-1.5 bg-black/20 text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
            {activeCatalogCourses.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("NEWLY_ADDED_CURATION");
            setSelectedStatus("ALL");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "NEWLY_ADDED_CURATION"
              ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
              : "bg-card text-muted-foreground border border-border/80 hover:bg-muted/20"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Newly Added Curation</span>
          <span className="ml-1.5 bg-black/20 text-current px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
            {courses.filter((c) => (c.status === "PUBLISHED" || c.status === "ACTIVE") && c.isFeatured !== false).length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("SUSPENDED_VAULT");
            setSelectedStatus("ALL");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "SUSPENDED_VAULT"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-card text-muted-foreground border border-border/80 hover:bg-muted/20"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Suspended</span>
          {suspendedVaultCourses.length > 0 && (
            <span className="ml-1.5 bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] font-mono">
              {suspendedVaultCourses.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-card border border-border/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search courses, trainers, or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs pl-9 pr-4 py-2.5 w-full bg-muted/20 border-border/80 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs bg-transparent border-none focus:ring-0 text-foreground"
            >
              <option value="ALL">All Subjects</option>
              {subjectsList.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field text-xs py-2 px-3 bg-muted/20 border-border/80"
          >
            <option value="ALL">All Statuses</option>
            {activeTab === "ACTIVE_CATALOG" ? (
              <>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </>
            ) : (
              <>
                <option value="SUSPENDED">Suspended</option>
                <option value="ARCHIVED">Archived</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Curation Panel when activeTab === "NEWLY_ADDED_CURATION" */}
      {activeTab === "NEWLY_ADDED_CURATION" ? (
        <div className="space-y-6">
          {/* Curation Header Banner */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-bold text-base text-foreground">
                  Trainee Homepage "Newly Added" Showcase Curation
                </h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                Add or remove courses from the Featured / Newly Added horizontal scroll showcase, and use the controls below to manually adjust their display sequence. Position #1 will appear leftmost for trainees.
              </p>
            </div>
            <button
              onClick={handleSaveFeaturedSequence}
              disabled={savingCuration || curatedList.length === 0}
              className="btn-primary text-xs py-2.5 px-5 font-bold shadow-md shrink-0 flex items-center gap-2 text-white hover:text-white"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{savingCuration ? "Saving Sequence..." : "Save Sequence Order"}</span>
            </button>
          </div>

          {/* Curated Featured Sequence */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center justify-between">
                <span>Featured Sequence ({curatedList.length} Courses)</span>
                <span className="text-[11px] font-mono text-muted-foreground font-normal">Leftmost → Rightmost</span>
              </h3>

              {curatedList.length === 0 ? (
                <div className="bg-card border border-border/80 rounded-2xl p-8 text-center text-xs text-muted-foreground">
                  No courses are currently featured in the Newly Added showcase. Add courses from the right panel.
                </div>
              ) : (
                <div className="space-y-3">
                  {curatedList.map((course, idx) => (
                    <div
                      key={course.id}
                      className="bg-card border border-border/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-amber-500/40 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md truncate">
                              {course.subject?.name || "General"}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground">
                              Trainer: {course.trainer?.name || "N/A"}
                            </span>
                          </div>
                          <h4 className="font-display font-bold text-sm text-foreground truncate">
                            {course.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-muted/40 border border-border/60 rounded-xl p-1">
                          <button
                            onClick={() => handleMoveCourse(idx, "UP")}
                            disabled={idx === 0}
                            title="Move Left / Higher Priority"
                            className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveCourse(idx, "DOWN")}
                            disabled={idx === curatedList.length - 1}
                            title="Move Right / Lower Priority"
                            className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleToggleFeatured(course.id, false)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Non-featured Available Catalog */}
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-foreground">
                Available Courses ({nonFeaturedCoursesList.length})
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {nonFeaturedCoursesList.length === 0 ? (
                  <div className="bg-card border border-border/80 rounded-2xl p-6 text-center text-xs text-muted-foreground">
                    All published courses are currently included in the Newly Added showcase.
                  </div>
                ) : (
                  nonFeaturedCoursesList.map((course) => (
                    <div
                      key={course.id}
                      className="bg-card border border-border/80 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <span className="text-[9px] font-mono text-primary uppercase block">
                          {course.subject?.name || "General"}
                        </span>
                        <h4 className="font-bold text-foreground truncate">{course.title}</h4>
                      </div>
                      <button
                        onClick={() => handleToggleFeatured(course.id, true)}
                        disabled={actionLoading}
                        className="px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-bold shrink-0 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="bg-card border border-border/80 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                {activeTab === "SUSPENDED_VAULT" ? <Archive className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
              </div>
              <p className="font-display font-bold text-sm text-foreground">
                {activeTab === "SUSPENDED_VAULT"
                  ? "No suspended or archived courses"
                  : "No matching courses found in active catalog"}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeTab === "SUSPENDED_VAULT"
                  ? "Any course you suspend from the active catalog will safely appear here under Suspended for restoration or permanent deletion."
                  : "Try resetting your search query or filters to supervise platform courses."}
              </p>
            </div>
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => {
            const activeEnrollmentsCount = course.enrollments?.filter(e => e.status === "ACTIVE")?.length || course.enrollments?.length || 0;
            const isSuspended = course.status === "SUSPENDED" || course.status === "ARCHIVED";

            const DOMAIN_COLOR_THEMES = [
              { bg: "bg-emerald-950 border-b border-emerald-900", badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
              { bg: "bg-blue-950 border-b border-blue-900", badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
              { bg: "bg-indigo-950 border-b border-indigo-900", badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
              { bg: "bg-amber-950 border-b border-amber-900", badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
              { bg: "bg-rose-950 border-b border-rose-900", badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
              { bg: "bg-slate-900 border-b border-slate-800", badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
            ];
            const theme = isSuspended
              ? { bg: "bg-slate-950 border-b border-slate-900", badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/30" }
              : DOMAIN_COLOR_THEMES[idx % DOMAIN_COLOR_THEMES.length];

            return (
              <div
                key={course.id}
                className="group bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl transition-all flex flex-col justify-between h-[310px]"
              >
                {/* Solid Domain Header Banner */}
                <div className={`p-5 ${theme.bg} min-h-[110px] flex flex-col justify-between shrink-0 text-white relative`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${theme.badgeBg}`}>
                      {course.subject?.name || "General Course"}
                    </span>
                    <span
                      className={`badge text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                        course.status === "SUSPENDED"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : course.status === "PUBLISHED"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mt-2">
                    {course.title}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description || "No overview description added for this course."}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="font-medium text-foreground">{course.trainer?.name || "Unassigned"}</span>
                    </div>

                    <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                      {activeEnrollmentsCount} Enrolled
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-muted/20 border-t border-border/80 flex items-center justify-between gap-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isSuspended ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setModalType("RESTORE");
                        }}
                        className="btn-secondary text-[11px] py-1.5 px-2.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setModalType("DELETE_PERMANENT");
                        }}
                        className="btn-secondary text-[11px] py-1.5 px-2.5 font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setModalType("SUSPEND");
                      }}
                      className="btn-secondary text-[11px] py-1.5 px-2.5 font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* WARNING CONFIRMATION MODAL */}
      {modalType && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => {
                setModalType(null);
                setSelectedCourse(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {modalType === "SUSPEND" && (
              <>
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      Confirm Course Suspension
                    </h3>
                    <p className="text-xs text-muted-foreground">Administrative Governance Action</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to suspend <strong className="text-foreground">"{selectedCourse.title}"</strong>?
                  Suspended courses will be removed from trainee catalogs and hidden from active views. You can safely restore it anytime from the <strong>Suspended</strong> tab.
                </p>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setModalType(null);
                      setSelectedCourse(null);
                    }}
                    disabled={actionLoading}
                    className="btn-secondary text-xs py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmAction}
                    disabled={actionLoading}
                    className="btn-primary bg-amber-600 hover:bg-amber-700 text-white text-xs py-2 px-4 font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{actionLoading ? "Suspending..." : "Confirm Suspend"}</span>
                  </button>
                </div>
              </>
            )}

            {modalType === "RESTORE" && (
              <>
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      Confirm Course Restoration
                    </h3>
                    <p className="text-xs text-muted-foreground">Restore to Active Catalog</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Restore <strong className="text-foreground">"{selectedCourse.title}"</strong>? This will return the course back to <strong>PUBLISHED</strong> status and make it accessible to trainees and trainers immediately.
                </p>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setModalType(null);
                      setSelectedCourse(null);
                    }}
                    disabled={actionLoading}
                    className="btn-secondary text-xs py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmAction}
                    disabled={actionLoading}
                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{actionLoading ? "Restoring..." : "Confirm Restore"}</span>
                  </button>
                </div>
              </>
            )}

            {modalType === "DELETE_PERMANENT" && (
              <>
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-rose-600 dark:text-rose-400">
                      PERMANENT DELETE WARNING
                    </h3>
                    <p className="text-xs text-muted-foreground">Irreversible Action</p>
                  </div>
                </div>

                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
                  <strong>DANGER:</strong> Are you sure you want to permanently delete <strong className="underline">"{selectedCourse.title}"</strong>?
                  This action CANNOT be undone and will permanently erase all associated assessments, resources, and record history.
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setModalType(null);
                      setSelectedCourse(null);
                    }}
                    disabled={actionLoading}
                    className="btn-secondary text-xs py-2 px-4 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmAction}
                    disabled={actionLoading}
                    className="btn-primary bg-rose-600 hover:bg-rose-700 text-white text-xs py-2 px-4 font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{actionLoading ? "Deleting..." : "Delete Permanently"}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}