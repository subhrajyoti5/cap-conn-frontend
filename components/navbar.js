"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { Logo } from "@/components/logo";
import { apiFetch } from "@/lib/api";

export function Navbar({ onMenuClick, onToggleSidebar }) {
  const { isSignedIn, signOut, user } = useAuth();
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  async function loadNotifications() {
    if (!isSignedIn) return;
    setLoadingNotifications(true);
    try {
      const res = await apiFetch("/notifications");
      const allList = res.data || res || [];
      
      // Filter out Direct Messages, Grievances, Direct Messages, and Contact Requests
      const filteredList = allList.filter(
        (n) =>
          !n.title?.startsWith("[MESSAGE]") &&
          !n.title?.startsWith("[GRIEVANCE]") &&
          !n.title?.startsWith("[DIRECT MESSAGE]") &&
          !n.title?.startsWith("[CONTACT REQUEST]")
      );
      
      setNotifications(filteredList);
      setUnreadCount(filteredList.filter((n) => !n.isRead).length);
    } catch (e) {
      console.error("Error loading notifications:", e);
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      loadNotifications();
    }
  }, [isSignedIn]);

  // Poll notifications
  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(() => {
      loadNotifications();
    }, 25000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  async function handleMarkRead(id) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error("Error marking read:", e);
    }
  }

  async function handleMarkAllRead() {
    try {
      const unreadList = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadList.map((n) => apiFetch(`/notifications/${n.id}/read`, { method: "PATCH" }))
      );
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  }

  return (
    <header className="glass-nav sticky top-0 z-40 h-14">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        
        {/* Left section: Hamburger toggles and Branding logo */}
        <div className="flex items-center gap-3">
          {isSignedIn && (
            <>
              {/* Mobile hamburger menu (opens side drawer) */}
              <button
                onClick={onMenuClick}
                className="lg:hidden btn-icon text-muted-foreground hover:text-foreground"
                aria-label="Open navigation"
              >
                <span className="icon" aria-hidden="true">menu</span>
              </button>
              {/* Desktop hamburger menu (collapses desktop sidebar) */}
              <button
                onClick={onToggleSidebar}
                className="hidden lg:inline-flex btn-icon text-muted-foreground hover:text-foreground"
                aria-label="Toggle navigation collapse"
              >
                <span className="icon" aria-hidden="true">menu</span>
              </button>
            </>
          )}
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-accent" />
            <span className="font-body text-lg font-semibold text-foreground hidden sm:inline">
              Capacity Connect
            </span>
          </Link>
        </div>

        {/* Right section: Notifications bell & Sign out */}
        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <Link href="/sign-in" className="btn-tertiary hidden sm:inline-flex">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary">
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Get Started</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 relative">
              
              {/* Notification Bell Trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn-icon border border-border text-muted-foreground hover:text-foreground relative"
                aria-label="Toggle notifications dropdown"
              >
                <span className="icon" aria-hidden="true">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown Window */}
              {dropdownOpen && (
                <div className="absolute right-0 top-11 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-elevated z-50 p-4 space-y-3 flex flex-col">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="font-bold text-xs text-foreground">Alerts ({unreadCount} unread)</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline font-semibold">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 min-h-[120px]">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">No new announcements or alerts.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-lg border text-[11px] space-y-1 relative group transition-colors ${
                            n.isRead ? "bg-card border-border/40" : "bg-primary/5 border-primary/10"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-foreground line-clamp-1">{n.title}</span>
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                className="text-[9px] text-primary hover:underline font-bold"
                              >
                                Read
                              </button>
                            )}
                          </div>
                          <p className="text-muted-foreground leading-normal break-words">{n.body}</p>
                          <span className="text-[8px] text-muted-foreground block text-right mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <span className="text-xs text-muted-foreground hidden md:inline max-w-[150px] truncate">
                {user?.email}
              </span>
              
              <button
                onClick={signOut}
                className="btn-tertiary border border-border hidden sm:inline-flex py-1.5 px-3 text-xs"
              >
                Sign Out
              </button>
              <button
                onClick={signOut}
                className="btn-icon text-muted-foreground sm:hidden"
                aria-label="Sign out"
              >
                <span className="icon" aria-hidden="true">logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
