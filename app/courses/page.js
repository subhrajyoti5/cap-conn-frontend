"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/features/auth/auth-context";
import Link from "next/link";
import { listCourses } from "@/features/courses/api/courses.api";

const CARD_GRADIENTS = [
  "from-teal-600 to-emerald-700",
  "from-cyan-600 to-blue-700",
  "from-violet-600 to-indigo-700",
  "from-amber-600 to-orange-700",
  "from-rose-600 to-pink-700",
];

export default function CoursesPage() {
  const { getToken, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await listCourses(token);
        setCourses(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  const canCreate = user?.role !== "TRAINEE";

  const subjectsList = useMemo(() => {
    const subsMap = new Map();
    courses.forEach((c) => {
      if (c.subject) {
        subsMap.set(c.subject.id, c.subject.name);
      }
    });
    return Array.from(subsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
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
  }, [courses, searchQuery, selectedSubject, selectedStatus]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-44 w-full bg-muted rounded-2xl" />
        <div className="h-12 w-full bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in stagger-1">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white p-8 shadow-lg shadow-emerald/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="badge bg-white/20 text-white border-transparent text-xs font-mono uppercase tracking-wider">
              Classroom Directory
            </span>
            <h1 className="font-display text-display-lg text-white mt-3 leading-tight">
              Explore Courses & Classrooms
            </h1>
            <p className="text-white/80 text-xs mt-2 leading-relaxed max-w-xl">
              Browse active subjects, view course materials, connect with certified instructors, and manage your learning trajectory.
            </p>
          </div>
          {canCreate && (
            <Link
              href="/courses/create"
              className="btn-secondary bg-white text-emerald-800 border-transparent hover:bg-white/90 shrink-0 self-start sm:self-center font-bold text-xs py-3 px-5 shadow-md flex items-center gap-1.5"
            >
              <span>➕</span>
              Create Course
            </Link>
          )}
        </div>
        <div className="absolute right-0 bottom-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none" />
      </div>

      {/* Filter and Search Toolbar */}
      <div className="card border border-border p-4 bg-card rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by title, description, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs pl-9 pr-4 py-2.5 w-full bg-muted/20 border-border focus:border-primary"
          />
          <svg className="w-4 h-4 text-muted-foreground absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field text-xs py-2 px-3 bg-muted/20 border-border"
          >
            <option value="ALL">All Subjects</option>
            {subjectsList.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field text-xs py-2 px-3 bg-muted/20 border-border"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="empty-state bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <svg className="empty-state-icon mx-auto w-12 h-12 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="empty-state-title font-display font-bold text-base text-foreground">No matching courses found</p>
          <p className="empty-state-desc text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || selectedSubject !== "ALL" || selectedStatus !== "ALL"
              ? "Try resetting your search query or filters to discover available classrooms."
              : canCreate
              ? "Create your first course classroom to begin publishing learning materials."
              : "No published courses are currently available."}
          </p>
          {canCreate && (
            <Link href="/courses/create" className="btn-primary inline-flex mt-2">
              Create New Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
            const activeEnrollmentsCount = course.enrollments?.filter(e => e.status === "ACTIVE")?.length || course.enrollments?.length || 0;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group card-shell flex flex-col justify-between overflow-hidden h-72 hover:shadow-elevated transition-all duration-300 rounded-2xl border border-border bg-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Course Banner */}
                <div className={`bg-gradient-to-br ${gradient} p-5 text-white relative shrink-0 overflow-hidden`}>
                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase font-mono tracking-wider bg-black/20 text-white/95 px-2 py-0.5 rounded-md backdrop-blur-xs truncate max-w-[65%]">
                        {course.subject?.name || "LMS Subject"}
                      </span>
                      <span className={`badge text-[9px] uppercase tracking-wider ${course.status === "PUBLISHED" ? "bg-white/20 text-white" : "bg-black/30 text-white"}`}>
                        {course.status}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold leading-snug text-white group-hover:underline line-clamp-2 pt-1">
                      {course.title}
                    </h3>
                  </div>

                  <div className="absolute right-0 top-0 w-28 h-28 bg-white/10 rounded-full -mr-8 -mt-8 pointer-events-none" />
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description || "No course summary details provided yet."}
                  </p>

                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                          {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "I"}
                        </div>
                        <span className="text-foreground font-medium text-xs truncate">
                          {course.trainer?.name || course.trainer?.email || "Instructor"}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-muted-foreground shrink-0 flex items-center gap-1">
                        <span>👥</span>
                        {activeEnrollmentsCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-end text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                      <span className="inline-flex items-center gap-1">
                        Enter Classroom
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}