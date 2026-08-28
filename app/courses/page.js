"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { listCourses } from "@/features/courses/api/courses.api";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Plus, Search, Filter, BookOpen, Users, UserCheck, ArrowRight } from "lucide-react";

const DOMAIN_COLOR_THEMES = [
  { bg: "bg-emerald-950 border-b border-emerald-900", badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { bg: "bg-blue-950 border-b border-blue-900", badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { bg: "bg-indigo-950 border-b border-indigo-900", badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { bg: "bg-amber-950 border-b border-amber-900", badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { bg: "bg-rose-950 border-b border-rose-900", badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  { bg: "bg-teal-950 border-b border-teal-900", badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  { bg: "bg-slate-900 border-b border-slate-800", badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
];

export default function CoursesPage() {
  const { getToken, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      try {
        const token = await getToken();
        const [coursesRes, subjectsRes] = await Promise.all([
          listCourses(token),
          apiFetch("/subjects").catch(() => ({ data: [] })),
        ]);
        setCourses(coursesRes.data || []);
        setSubjectsList(subjectsRes.data || []);
      } catch (err) {
        console.error("Error loading courses list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [getToken]);

  const canCreate = user?.role === "TRAINER" || user?.role === "ADMIN";

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "ALL" || c.subjectId === selectedSubject;
    const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 w-full bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl" />
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
            <span className="bg-primary/20 text-primary-foreground border border-primary/30 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider inline-block">
              Course Directory
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Explore Available Courses
            </h1>
          </div>

          {canCreate && (
            <Link
              href="/courses/create"
              className="btn-primary text-xs py-2.5 px-4 font-semibold shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-card border border-border/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title, description, or subject..."
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
              className="text-xs bg-transparent border-none focus:ring-0 text-foreground cursor-pointer"
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
            className="input-field text-xs py-2 px-3 bg-muted/20 border-border/80 cursor-pointer"
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
        <div className="bg-card border border-border/80 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <p className="font-display font-bold text-sm text-foreground">No matching courses found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || selectedSubject !== "ALL" || selectedStatus !== "ALL"
              ? "Try resetting your search query or filters to discover available courses."
              : canCreate
                ? "Create your first course to begin publishing learning materials."
                : "No published courses are currently available."}
          </p>
          {canCreate && (
            <Link href="/courses/create" className="btn-primary text-xs py-2 px-4 shadow-xs inline-flex items-center gap-1.5 mt-2 font-semibold">
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => {
            const activeEnrollmentsCount = course.enrollments?.filter((e) => e.status === "ACTIVE")?.length || course.enrollments?.length || 0;
            const theme = DOMAIN_COLOR_THEMES[idx % DOMAIN_COLOR_THEMES.length];

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-primary/60 hover:shadow-xl transition-all flex flex-col justify-between h-[270px]"
              >
                {/* Solid Rich Domain Header Banner */}
                <div className={`p-5 ${theme.bg} min-h-[110px] flex flex-col justify-between shrink-0 text-white`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`${theme.badgeBg} border text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md truncate max-w-[65%]`}>
                      {course.subject?.name || "Specialized Domain"}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md border ${course.status === "PUBLISHED"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-white/10 text-white/80 border-white/20"
                      }`}>
                      {course.status}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-white line-clamp-2 leading-snug mt-3">
                    {course.title}
                  </h3>
                </div>

                {/* Course Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-card text-foreground">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description || "Comprehensive scientific training curriculum and resources."}
                  </p>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-primary/20">
                        {course.trainer?.name ? course.trainer.name[0].toUpperCase() : "T"}
                      </div>
                      <span className="truncate text-xs font-medium text-foreground">{course.trainer?.name || "Trainer"}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span>{activeEnrollmentsCount}</span>
                      </span>
                      <span className="font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Enter Course</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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