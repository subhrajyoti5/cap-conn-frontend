"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/notifications")
      .then((res) => setNotifications(res.data?.data || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-in stagger-1">
        <div className="skeleton h-8 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-shell">
              <div className="card p-4 skeleton h-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in stagger-1">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          {notifications.filter((n) => !n.isRead).length} unread
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="empty-state-title">No notifications</p>
          <p className="empty-state-desc">You are all caught up.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n, index) => (
            <li
              key={n.id}
              className={`card-shell ${n.isRead ? "" : "border-accent/20"}`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="card p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className={`font-medium text-sm ${n.isRead ? "text-foreground" : "text-primary"}`}>
                    {n.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="btn-tertiary shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}