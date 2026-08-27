"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { Logo } from "@/components/logo";
import { apiFetch } from "@/lib/api";
import { Bell, CheckCheck, Check, Clock, X, Sparkles } from "lucide-react";

export function Navbar({ onMenuClick, onToggleSidebar }) {
  const { isSignedIn, signOut, user } = useAuth();
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);

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

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  async function handleMarkRead(id, e) {
    if (e) e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  }

  async function handleMarkAllRead() {
    try {
      const unreadList = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadList.map((n) => apiFetch(`/notifications/${n.id}/read`, { method: "PATCH" }))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.abs(now - date) / 36e5;
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <header className="glass-nav sticky top-0 z-40 h-14 border-b border-border">
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
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              
              {/* Notification Bell Trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center relative transition-all ${
                  dropdownOpen
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
                aria-label="Toggle notifications dropdown"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Redesigned Notifications Dropdown Window */}
              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[460px]">
                  
                  {/* Dropdown Header */}
                  <div className="p-3.5 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-xs text-foreground">Notifications</h4>
                      {unreadCount > 0 ? (
                        <span className="bg-primary/10 text-primary text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-primary/20">
                          {unreadCount} new
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                          All read
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-primary hover:text-primary-hover font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="overflow-y-auto divide-y divide-border/60 flex-1 min-h-[160px]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted/40 text-muted-foreground flex items-center justify-center mx-auto">
                          <Bell className="w-5 h-5 opacity-60" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">No notifications yet</p>
                        <p className="text-[11px] text-muted-foreground">You will see system updates and alerts here.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.isRead && handleMarkRead(n.id)}
                          className={`p-3.5 text-xs transition-colors flex items-start gap-3 cursor-pointer ${
                            n.isRead
                              ? "bg-card hover:bg-muted/20 text-muted-foreground"
                              : "bg-primary/5 hover:bg-primary/10 text-foreground font-medium"
                          }`}
                        >
                          {/* Unread Status Dot */}
                          <div className="pt-1 shrink-0">
                            {n.isRead ? (
                              <div className="w-2 h-2 rounded-full bg-border" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className={`text-xs truncate ${n.isRead ? "font-medium text-foreground/80" : "font-bold text-foreground"}`}>
                                {n.title}
                              </h5>
                              <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                {formatDate(n.createdAt)}
                              </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2 break-words">
                              {n.body}
                            </p>
                          </div>

                          {/* Quick Mark Read Action */}
                          {!n.isRead && (
                            <button
                              onClick={(e) => handleMarkRead(n.id, e)}
                              title="Mark as read"
                              className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
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
