"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getConversations,
  getThread,
  sendMessage,
  getDirectory,
} from "@/features/messages/api/messages.api";
import {
  MessageSquare,
  Plus,
  Search,
  ArrowLeft,
  Send,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  User,
  Users,
  Lock,
  X,
  MessageCircle,
  Inbox,
  Filter,
} from "lucide-react";

function MessagesContent() {
  const { getToken, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [directoryContacts, setDirectoryContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // Active chat state
  const [activePartner, setActivePartner] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // Navigation mode: "CHATS" | "DIRECTORY"
  const [viewMode, setViewMode] = useState("CHATS");

  // Search & Filter inputs
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  // Admin Support Ticket state (stored per partner ID)
  const [openTickets, setOpenTickets] = useState({});
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  // Load ticket states from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("capacity_admin_tickets");
      if (saved) {
        setOpenTickets(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading saved tickets:", e);
    }
  }, []);

  const saveTicketState = (partnerId, isOpen) => {
    const updated = { ...openTickets, [partnerId]: isOpen };
    setOpenTickets(updated);
    try {
      localStorage.setItem("capacity_admin_tickets", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving ticket state:", e);
    }
  };

  const isCurrentTicketOpen = activePartner ? !!openTickets[activePartner.id] : false;

  const chatScrollRef = useRef(null);

  // Auto-scroll chat stream to bottom
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages, loadingThread]);

  async function loadData() {
    try {
      const token = await getToken();
      if (!token) return;

      const [convsRes, dirRes] = await Promise.all([
        getConversations(token),
        getDirectory(token),
      ]);

      const convs = convsRes.data || [];
      const contacts = dirRes.data || [];

      setConversations(convs);
      setDirectoryContacts(contacts);

      // Check if URL has ?userId=<id>
      const targetUserId = searchParams.get("userId");
      if (targetUserId) {
        openThreadWithUserId(targetUserId, convs, contacts);
      } else if (convs.length > 0 && !activePartner) {
        // DEFAULT: open most recent conversation
        selectPartner(convs[0].partner);
      }
    } catch (e) {
      console.error("Error loading messaging data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function openThreadWithUserId(targetId, currentConvs = [], currentContacts = []) {
    const existing = currentConvs.find((c) => c.partner?.id === targetId);
    if (existing) {
      selectPartner(existing.partner);
    } else {
      const contact = currentContacts.find((c) => c.id === targetId);
      if (contact) {
        selectPartner(contact);
      } else {
        selectPartner({ id: targetId, name: "User", role: "MEMBER" });
      }
    }
  }

  useEffect(() => {
    loadData();
  }, [searchParams]);

  async function selectPartner(partner) {
    if (!partner) return;
    setActivePartner(partner);
    setViewMode("CHATS");
    setLoadingThread(true);

    // Ensure partner is present in conversations array so 2-pane view renders immediately
    setConversations((prev) => {
      const exists = prev.some((c) => c.partner?.id === partner.id);
      if (!exists) {
        return [{ partner, lastMessage: null, unreadCount: 0 }, ...prev];
      }
      return prev.map((c) =>
        c.partner?.id === partner.id ? { ...c, unreadCount: 0 } : c
      );
    });

    try {
      const token = await getToken();
      const res = await getThread(token, partner.id);
      if (res.data) {
        setThreadMessages(res.data.messages || []);
        if (res.data.partner) {
          setActivePartner(res.data.partner);
        }
      }
    } catch (e) {
      console.error("Error loading thread:", e);
    } finally {
      setLoadingThread(false);
    }
  }

  async function handleSend(e) {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activePartner || sending) return;

    // Check if sending to ADMIN and user is TRAINEE without an OPEN ticket
    const targetIsAdmin = activePartner.role === "ADMIN";
    const senderIsAdmin = user?.role === "ADMIN";
    const senderIsTrainer = user?.role === "TRAINER";

    if (targetIsAdmin && !senderIsAdmin && !senderIsTrainer && !isCurrentTicketOpen) {
      setPendingMessage(messageText.trim());
      setShowTicketModal(true);
      return;
    }

    await executeSendMessage(messageText.trim());
  }

  async function confirmAndOpenTicket() {
    setShowTicketModal(false);
    if (activePartner) {
      saveTicketState(activePartner.id, true);
    }
    const textToSend = pendingMessage || messageText.trim();
    setPendingMessage("");
    if (textToSend) {
      await executeSendMessage(textToSend);
    }
  }

  async function executeSendMessage(content) {
    setMessageText("");
    setSending(true);

    try {
      const token = await getToken();
      const res = await sendMessage(token, {
        receiverId: activePartner.id,
        content,
      });

      if (res.data) {
        const newMsg = res.data;
        setThreadMessages((prev) => [...prev, newMsg]);

        // Update conversation list
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.partner.id === activePartner.id);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              lastMessage: newMsg,
            };
            const [item] = updated.splice(idx, 1);
            return [item, ...updated];
          } else {
            return [
              {
                partner: activePartner,
                lastMessage: newMsg,
                unreadCount: 0,
              },
              ...prev,
            ];
          }
        });
      }
    } catch (e) {
      console.error("Failed to send message:", e);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const handleOpenDirectory = async () => {
    setViewMode("DIRECTORY");
    if (directoryContacts.length === 0) {
      setLoadingDirectory(true);
      try {
        const token = await getToken();
        const res = await getDirectory(token);
        setDirectoryContacts(res.data || []);
      } catch (e) {
        console.error("Error fetching directory contacts:", e);
      } finally {
        setLoadingDirectory(false);
      }
    }
  };

  // Filtering conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.partner?.name?.toLowerCase().includes(term) ||
      c.partner?.email?.toLowerCase().includes(term) ||
      c.lastMessage?.content?.toLowerCase().includes(term)
    );
  });

  // Filtering contacts directory
  const filteredDirectoryContacts = directoryContacts.filter((c) => {
    const matchesSearch =
      !searchTerm.trim() ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.sharedCourses &&
        c.sharedCourses.some((sc) =>
          sc.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const matchesRole =
      selectedRoleFilter === "ALL" || c.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-muted/60 rounded-lg" />
        <div className="h-[calc(100vh-145px)] min-h-[580px] w-full bg-muted/40 rounded-2xl" />
      </div>
    );
  }

  const hasChats = conversations.length > 0;
  const isPartnerAdmin = activePartner?.role === "ADMIN";

  return (
    <div className="space-y-3 max-w-7xl mx-auto animate-in stagger-1">
      {/* Header Banner */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-display text-display-md font-bold text-foreground flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-primary shrink-0" />
            <span>Direct Messages Hub</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Private, encrypted communications with trainees, trainers, and organization admins.
          </p>
        </div>
      </div>

      {/* Main Full-Screen Container Card */}
      <div className="border border-border/80 rounded-2xl overflow-hidden bg-card shadow-elevated flex flex-col h-[calc(100vh-145px)] min-h-[580px] w-full">
        {/* Top Control Bar with Search & Conditional Back Action */}
        <div className="p-3.5 border-b border-border/80 bg-muted/20 flex items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={
                viewMode === "DIRECTORY"
                  ? "Search available members, emails, or courses..."
                  : "Search conversations, contacts, or messages..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field text-xs pl-9 pr-3 py-2 w-full bg-card border-border/80 focus:border-primary shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "DIRECTORY" && (
              <>
                <div className="flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-2 py-1">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="text-xs bg-transparent border-none focus:ring-0 text-foreground"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="TRAINER">Trainers</option>
                    <option value="TRAINEE">Trainees</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>

                <button
                  onClick={() => setViewMode("CHATS")}
                  className="btn-secondary text-xs py-2 px-3.5 shadow-xs flex items-center gap-1.5 shrink-0 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Chats ({conversations.length})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* CONTAINER BODY */}
        {viewMode === "DIRECTORY" ? (
          /* ================= MODE: FULL-WIDTH DIRECTORY VIEW ================= */
          <div className="flex-1 overflow-y-auto p-5 min-h-0 bg-card">
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex justify-between items-center border-b border-border/80 pb-3">
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Available Organization Members ({filteredDirectoryContacts.length})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select a member to start a private conversation thread.
                  </p>
                </div>
              </div>

              {loadingDirectory ? (
                <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
                  Loading contacts directory...
                </div>
              ) : filteredDirectoryContacts.length === 0 ? (
                <div className="py-20 text-center text-xs text-muted-foreground italic">
                  No matching contacts found in directory.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredDirectoryContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/20 hover:border-primary/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-slate-700">
                          {contact.name
                            ? contact.name[0].toUpperCase()
                            : contact.email
                            ? contact.email[0].toUpperCase()
                            : "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-foreground truncate">
                              {contact.name || contact.email?.split("@")[0] || "User"}
                            </span>
                            <span
                              className={`badge text-[8px] uppercase font-mono px-1.5 py-0.5 rounded-md ${
                                contact.role === "ADMIN"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : contact.role === "TRAINER"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              }`}
                            >
                              {contact.role}
                            </span>
                          </div>

                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {contact.email}
                          </p>

                          {contact.sharedCourses && contact.sharedCourses.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {contact.sharedCourses.map((cName, idx) => (
                                <span
                                  key={idx}
                                  className="bg-primary/10 text-primary text-[9px] font-medium px-1.5 py-0.5 rounded-md truncate max-w-[180px]"
                                >
                                  Shared: {cName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => selectPartner(contact)}
                        className="btn-primary w-full text-xs py-2 font-semibold shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Start Chat</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (!hasChats && !activePartner) ? (
          /* ================= MODE: ZERO CONVERSATIONS (SINGLE CENTERED CTA) ================= */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-card">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="font-bold text-base text-foreground font-display">
                No Conversations Yet
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have not initiated any private messages. Click below to explore available trainers, trainees, and organization members!
              </p>
            </div>

            <button
              onClick={handleOpenDirectory}
              className="btn-primary text-xs py-2.5 px-5 shadow-sm flex items-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Chat</span>
            </button>
          </div>
        ) : (
          /* ================= MODE: DEFAULT 2-PANE SPLIT VIEW FOR HAS CHATS ================= */
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border/80 flex-1 min-h-0">
            {/* Left Pane: Active Conversations List */}
            <div className="col-span-1 flex flex-col bg-muted/10 h-full min-h-0">
              <div className="p-3 border-b border-border/80 bg-card/60 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="uppercase text-[10px] tracking-wider font-mono">Conversations ({conversations.length})</span>
                <button
                  onClick={handleOpenDirectory}
                  className="btn-primary text-[11px] py-1 px-2.5 font-semibold shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                {filteredConversations.map((c) => {
                  const isActive = activePartner?.id === c.partner.id;
                  const isPartnerAdminInList = c.partner?.role === "ADMIN";

                  return (
                    <button
                      key={c.partner.id}
                      onClick={() => selectPartner(c.partner)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-all ${
                        isActive
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "hover:bg-muted/20 bg-card"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shadow-xs border ${
                          isPartnerAdminInList
                            ? "bg-slate-900 text-amber-400 border-amber-500/30"
                            : "bg-slate-800 text-slate-100 border-slate-700"
                        }`}>
                          {c.partner?.name
                            ? c.partner.name[0].toUpperCase()
                            : c.partner?.email
                            ? c.partner.email[0].toUpperCase()
                            : "U"}
                        </div>
                        {c.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-card">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-xs text-foreground truncate">
                            {c.partner?.name || c.partner?.email?.split("@")[0] || "User"}
                          </span>
                          {c.lastMessage && (
                            <span className="text-[9px] font-mono text-muted-foreground shrink-0 ml-1">
                              {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mb-1">
                          <span
                            className={`badge text-[8px] uppercase font-mono px-1.5 py-0 rounded ${
                              isPartnerAdminInList
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold"
                                : c.partner?.role === "TRAINER"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            }`}
                          >
                            {isPartnerAdminInList ? "ADMIN SUPPORT" : c.partner?.role || "MEMBER"}
                          </span>
                        </div>

                        {c.lastMessage?.content && (
                          <p className="text-[11px] text-muted-foreground truncate leading-tight">
                            {c.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Active Chat Stream View */}
            <div className="col-span-1 md:col-span-2 flex flex-col h-full bg-card min-h-0">
              {activePartner ? (
                <>
                  {/* Partner Header with Admin Support Ticket Controls */}
                  <div className="p-3.5 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0 gap-2 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border ${
                        isPartnerAdmin
                          ? "bg-slate-900 text-amber-400 border-amber-500/30"
                          : "bg-slate-800 text-slate-100 border-slate-700"
                      }`}>
                        {activePartner.name
                          ? activePartner.name[0].toUpperCase()
                          : activePartner.email
                          ? activePartner.email[0].toUpperCase()
                          : "U"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-foreground truncate">
                            {activePartner.name || activePartner.email || "Chat User"}
                          </h3>
                          <span
                            className={`badge text-[8px] uppercase font-mono px-1.5 py-0.5 rounded ${
                              isPartnerAdmin
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold"
                                : activePartner.role === "TRAINER"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            }`}
                          >
                            {isPartnerAdmin ? "ADMIN SUPPORT" : activePartner.role}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground truncate">
                          {activePartner.email}
                        </p>
                      </div>
                    </div>

                    {/* Support Ticket Status Header Controls (Trainees Only) */}
                    {isPartnerAdmin && user?.role === "TRAINEE" && (
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrentTicketOpen ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Ticket Active
                            </span>
                            <button
                              onClick={() => saveTicketState(activePartner.id, false)}
                              className="text-[10px] btn-secondary py-1 px-2.5 font-medium hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                            >
                              Close Ticket
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="bg-muted/80 text-muted-foreground border border-border/80 text-[10px] font-medium px-2.5 py-1 rounded-full">
                              Ticket Closed
                            </span>
                            <button
                              onClick={() => {
                                setPendingMessage("");
                                setShowTicketModal(true);
                              }}
                              className="text-[10px] btn-primary py-1 px-3 font-semibold shadow-xs"
                            >
                              Open Support Ticket
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chat Messages Stream */}
                  <div
                    ref={chatScrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5 scroll-smooth min-h-0"
                  >
                    {/* Official System Warning Banner for Admin Support Chats (Role-Specific) */}
                    {isPartnerAdmin && (
                      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-foreground space-y-1.5 text-xs shadow-xs mb-3">
                        <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300 font-display">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Official Admin Support Notice</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          Admins handle system-level issues, platform discrepancies, and critical escalations.
                          {user?.role === "TRAINER" ? (
                            <strong className="text-foreground font-medium"> Trainers should contact Admins primarily for course administrative approvals, subject domain management, or platform technical support.</strong>
                          ) : (
                            <strong className="text-foreground font-medium"> Trainees are advised to consult assigned course trainers or peers for academic assistance before reaching out to Admins.</strong>
                          )}
                          {" "}Please ensure your issue requires administrative intervention.
                        </p>
                      </div>
                    )}

                    {loadingThread ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : threadMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-muted-foreground">
                        <MessageCircle className="w-8 h-8 opacity-40" />
                        <p className="text-xs font-medium text-foreground">
                          Start of conversation
                        </p>
                        <p className="text-[11px] max-w-xs">
                          Send a message to start chatting with {activePartner.name || "this user"}.
                        </p>
                      </div>
                    ) : (
                      threadMessages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${
                              isMe ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`max-w-[78%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                                isMe
                                  ? "bg-primary text-primary-foreground rounded-br-none shadow-2xs"
                                  : "bg-card border border-border/80 text-foreground rounded-bl-none shadow-2xs"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                              <div
                                className={`text-[9px] font-mono text-right mt-1 opacity-70 ${
                                  isMe ? "text-primary-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Sticky Message Input Footer */}
                  <form
                    onSubmit={handleSend}
                    className="p-3 border-t border-border/80 bg-card flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      required
                      placeholder={
                        isPartnerAdmin && !isCurrentTicketOpen && user?.role !== "ADMIN"
                          ? "Type your message (Requires opening Admin Support Ticket)..."
                          : `Type a message to ${activePartner.name || "user"}...`
                      }
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="input-field text-xs py-2 px-3 flex-1 bg-muted/20 border-border/80 focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="btn-primary text-xs py-2 px-4 shadow-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      <span>
                        {sending
                          ? "Sending..."
                          : isPartnerAdmin && !isCurrentTicketOpen && user?.role !== "ADMIN"
                          ? "Open Ticket & Send"
                          : "Send"}
                      </span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Select a conversation
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Click any conversation on the left sidebar to view messages.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Admin Support Ticket */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border/80 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground font-display">
                  Request Admin Support Ticket?
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Official Organization Support Desk
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-2 leading-relaxed">
              <p className="text-foreground font-medium text-[11px]">
                Are you sure you want to initiate an official Admin Support ticket?
              </p>
              <p className="text-[11px] text-muted-foreground">
                <strong className="text-amber-700 dark:text-amber-300 font-medium">Important Advisory:</strong>{" "}
                {user?.role === "TRAINER" ? (
                  <span>Trainers should reach out to Admins primarily for course administrative approvals, subject domain management, or platform technical support.</span>
                ) : (
                  <span>Trainees should first consult course trainers for learning or course content questions before reaching out to Organization Admins.</span>
                )}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowTicketModal(false);
                  setPendingMessage("");
                }}
                className="btn-secondary text-xs py-1.5 px-3.5 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndOpenTicket}
                className="btn-primary text-xs py-1.5 px-4 font-semibold shadow-xs"
              >
                Confirm & Open Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessageCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Loading messages...
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
