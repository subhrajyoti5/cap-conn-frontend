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

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-muted">No notifications.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`border rounded-lg p-4 flex justify-between items-start gap-4 ${
                n.isRead
                  ? "border-border-warm bg-white"
                  : "border-accent/40 bg-accent/5"
              }`}
            >
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-muted mt-1">{n.body}</p>
                <p className="text-xs text-muted mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs px-2 py-1 border border-border-warm rounded hover:bg-surface-alt transition-colors whitespace-nowrap"
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
