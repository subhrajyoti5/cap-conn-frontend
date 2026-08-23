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
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-40 bg-surface-alt rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-20" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          {notifications.filter((n) => !n.isRead).length} unread
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No notifications</p>
          <p className="empty-state-desc">You are all caught up.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`card p-4 flex items-start justify-between gap-4 ${
                n.isRead ? "bg-white" : "bg-accent-50/30 border-accent/20"
              }`}
            >
              <div className="min-w-0">
                <p className={`font-medium text-sm ${n.isRead ? "text-ink" : "text-primary"}`}>
                  {n.title}
                </p>
                <p className="text-sm text-muted mt-0.5">{n.body}</p>
                <p className="text-xs text-muted mt-1.5">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
