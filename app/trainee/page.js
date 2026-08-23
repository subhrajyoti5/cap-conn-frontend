"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function TraineeDashboardPage() {
  const { getToken, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await apiFetch("/dashboard/trainee", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Active Courses", value: data?.activeCourses || 0, desc: "Currently enrolled" },
    { label: "Pending Assessments", value: data?.pendingAssessments || 0, desc: "Requires submission" },
    { label: "Completed Assessments", value: data?.completedAssessments || 0, desc: "Evaluated & graded" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-display-md text-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your ongoing courses, assignments, and verified credentials.
          </p>
        </div>
        <Link
          href="/courses"
          className="btn-primary self-start sm:self-auto"
        >
          Browse All Courses
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="font-display text-lg text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/courses"
            className="card-interactive p-5 text-left group"
          >
            <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
              Enrolled Courses
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              View study materials and presentation slide decks.
            </p>
          </Link>

          <Link
            href="/certifications"
            className="card-interactive p-5 text-left group"
          >
            <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
              Certifications
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Preview verified certificate documents with Drive viewer.
            </p>
          </Link>

          <Link
            href="/courses"
            className="card-interactive p-5 text-left group"
          >
            <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
              Assessments & Quizzes
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Take pending quizzes and review graded scores.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Certifications if available */}
      {data?.certifications && data.certifications.length > 0 && (
        <div className="card-padded">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base text-foreground">
              Verified Certifications
            </h3>
            <Link href="/certifications" className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-foreground">{cert.name}</p>
                  <p className="text-muted-foreground">{cert.issuer}</p>
                </div>
                <span className="badge-success">Verified</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}