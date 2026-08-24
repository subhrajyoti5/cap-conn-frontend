"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { apiFetch } from "@/lib/api";

export default function MessageCenterPage() {
  const { user } = useAuth();
  
  // Lists
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);
  
  // Composer state
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);

  // Unified Form Inputs
  const [sendTo, setSendTo] = useState("admin"); // admin, trainer, trainee, broadcast
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [broadcastRole, setBroadcastRole] = useState("TRAINEE");
  
  // Preloads
  const [myTrainers, setMyTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  async function load() {
    try {
      const res = await apiFetch("/notifications");
      const list = res.data || res || [];
      
      // Filter only direct messages, grievances, direct messages, or contact requests
      const msgList = list.filter(
        (n) =>
          n.title?.startsWith("[MESSAGE]") ||
          n.title?.startsWith("[DIRECT MESSAGE]") ||
          n.title?.startsWith("[BROADCAST]")
      );
      
      setMessages(msgList);
    } catch (e) {
      console.error("Error loading messages:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadTraineeTrainers() {
    if (user?.role !== "TRAINEE") return;
    try {
      const res = await apiFetch("/me/enrollments?status=ACTIVE");
      const list = res.data || res || [];
      const trainers = [];
      const seenIds = new Set();
      list.forEach((e) => {
        const trainer = e.course?.trainer;
        if (trainer && !seenIds.has(trainer.id)) {
          seenIds.add(trainer.id);
          trainers.push(trainer);
        }
      });
      setMyTrainers(trainers);
      if (trainers.length > 0) {
        setSelectedTrainerId(trainers[0].id);
        setSendTo("trainer");
      } else {
        setSendTo("admin");
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
    if (user?.role === "TRAINEE") {
      loadTraineeTrainers();
    } else if (user?.role === "TRAINER") {
      setSendTo("trainee");
    } else if (user?.role === "ADMIN") {
      setSendTo("direct");
    }
  }, [user]);

  async function handleMarkRead(id) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setMessages(messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      if (activeMessage?.id === id) {
        setActiveMessage({ ...activeMessage, isRead: true });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    setSending(true);
    try {
      let payload = {
        title: msgTitle,
        body: msgBody,
        type: "SYSTEM",
      };

      if (user?.role === "TRAINEE") {
        if (sendTo === "admin") {
          payload.toAdmins = true;
          payload.title = `[MESSAGE] ${msgTitle}`;
        } else {
          if (!selectedTrainerId) {
            alert("No trainer selected!");
            setSending(false);
            return;
          }
          payload.userIds = [selectedTrainerId];
          payload.title = `[MESSAGE] ${msgTitle}`;
        }
      } else if (user?.role === "TRAINER") {
        if (sendTo === "admin") {
          payload.toAdmins = true;
          payload.title = `[MESSAGE] ${msgTitle}`;
        } else {
          if (!recipientEmail.trim()) {
            alert("Please provide trainee email!");
            setSending(false);
            return;
          }
          const usersRes = await apiFetch("/admin/users");
          const allUsers = usersRes.data || usersRes || [];
          const student = allUsers.find(
            (u) => u.email.toLowerCase() === recipientEmail.trim().toLowerCase()
          );
          if (!student) {
            alert("User not found!");
            setSending(false);
            return;
          }
          payload.userIds = [student.id];
          payload.title = `[MESSAGE] ${msgTitle}`;
        }
      } else if (user?.role === "ADMIN") {
        if (sendTo === "broadcast") {
          await apiFetch("/admin/notifications", {
            method: "POST",
            body: JSON.stringify({
              role: broadcastRole,
              title: `[BROADCAST] ${msgTitle}`,
              body: msgBody,
              type: "ANNOUNCEMENT",
            }),
          });
          alert("Broadcast message sent successfully!");
          setComposing(false);
          setMsgTitle("");
          setMsgBody("");
          setSending(false);
          load();
          return;
        } else {
          if (!recipientEmail.trim()) {
            alert("Please provide recipient email!");
            setSending(false);
            return;
          }
          const usersRes = await apiFetch("/admin/users");
          const allUsers = usersRes.data || usersRes || [];
          const target = allUsers.find(
            (u) => u.email.toLowerCase() === recipientEmail.trim().toLowerCase()
          );
          if (!target) {
            alert("User not found!");
            setSending(false);
            return;
          }
          payload.userIds = [target.id];
          payload.title = `[DIRECT MESSAGE] ${msgTitle}`;
        }
      }

      await apiFetch("/notifications", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Message sent successfully!");
      setComposing(false);
      setMsgTitle("");
      setMsgBody("");
      setRecipientEmail("");
      load();
    } catch (e) {
      console.error(e);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleInitiateReply(senderEmail, originalTitle) {
    setComposing(true);
    const cleanTitle = originalTitle.replace(/^\[.*?\]\s*/, "");
    setMsgTitle(`Re: ${cleanTitle}`);
    setMsgBody("");
    
    if (user?.role === "TRAINEE") {
      // Find trainer with this email or fallback to admin
      const trainer = myTrainers.find((t) => t.email.toLowerCase() === senderEmail.toLowerCase());
      if (trainer) {
        setSendTo("trainer");
        setSelectedTrainerId(trainer.id);
      } else {
        setSendTo("admin");
      }
    } else if (user?.role === "TRAINER") {
      if (senderEmail.includes("admin")) {
        setSendTo("admin");
      } else {
        setSendTo("trainee");
        setRecipientEmail(senderEmail);
      }
    } else {
      setSendTo("direct");
      setRecipientEmail(senderEmail);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-3 gap-6 h-96">
          <div className="col-span-1 bg-muted rounded-xl" />
          <div className="col-span-2 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-in stagger-1">
      <div className="page-header flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Message Center</h1>
          <p className="page-subtitle">Send private communications and announcements across roles.</p>
        </div>
        <button
          onClick={() => {
            setComposing(true);
            setActiveMessage(null);
            setMsgTitle("");
            setMsgBody("");
            setRecipientEmail("");
          }}
          className="btn-primary"
        >
          Compose Message
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[480px] items-stretch">
        {/* Left Side: Inbox List */}
        <div className="col-span-1 border border-border rounded-2xl bg-card p-4 flex flex-col space-y-3">
          <h2 className="font-bold text-xs text-foreground pb-2 border-b border-border flex justify-between items-center">
            <span>Conversations</span>
            <span className="badge badge-neutral font-mono">{messages.length}</span>
          </h2>

          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10">No messages found.</p>
            ) : (
              messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveMessage(m);
                    setComposing(false);
                    if (!m.isRead) {
                      handleMarkRead(m.id);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col space-y-1 ${
                    activeMessage?.id === m.id
                      ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10"
                      : m.isRead
                      ? "bg-card border-border/50 hover:bg-muted/10"
                      : "bg-primary/5 border-primary/10 font-medium"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground line-clamp-1">{m.title}</span>
                    {!m.isRead && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {m.body}
                  </p>
                  <span className="text-[8px] text-muted-foreground block text-right mt-1">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Message Thread View / Compose Form */}
        <div className="col-span-1 md:col-span-2 border border-border rounded-2xl bg-card p-6 flex flex-col justify-between">
          
          {composing ? (
            /* Compose Form */
            <form onSubmit={handleSendMessage} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="font-bold text-sm text-foreground">New Message</h3>
                  <button
                    type="button"
                    onClick={() => setComposing(false)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Back to Inbox
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="label mb-1">Send To</label>
                    <select
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      className="input w-full py-1.5 text-xs"
                    >
                      {user?.role === "TRAINEE" && (
                        <>
                          {myTrainers.length > 0 && <option value="trainer">Course Trainer</option>}
                          <option value="admin">System Administrator</option>
                        </>
                      )}
                      {user?.role === "TRAINER" && (
                        <>
                          <option value="trainee">Trainee</option>
                          <option value="admin">System Administrator</option>
                        </>
                      )}
                      {user?.role === "ADMIN" && (
                        <>
                          <option value="direct">Direct Message User</option>
                          <option value="broadcast">Announcement Broadcast</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Send to Trainer Dropdown */}
                  {user?.role === "TRAINEE" && sendTo === "trainer" && (
                    <div>
                      <label className="label mb-1">Select Trainer</label>
                      <select
                        value={selectedTrainerId}
                        onChange={(e) => setSelectedTrainerId(e.target.value)}
                        className="input w-full py-1.5 text-xs"
                      >
                        {myTrainers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name || t.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Send to Trainee/Direct email inputs */}
                  {((user?.role === "TRAINER" && sendTo === "trainee") || (user?.role === "ADMIN" && sendTo === "direct")) && (
                    <div>
                      <label className="label mb-1">Recipient Email</label>
                      <input
                        type="email"
                        required
                        placeholder="recipient@capconn.in"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="input w-full py-1.5 text-xs"
                      />
                    </div>
                  )}

                  {/* Send to Admin Broadcast */}
                  {user?.role === "ADMIN" && sendTo === "broadcast" && (
                    <div>
                      <label className="label mb-1">Audience Role</label>
                      <select
                        value={broadcastRole}
                        onChange={(e) => setBroadcastRole(e.target.value)}
                        className="input w-full py-1.5 text-xs"
                      >
                        <option value="TRAINEE">All Trainees</option>
                        <option value="TRAINER">All Trainers</option>
                        <option value="ADMIN">All Admins</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="text-xs">
                  <label className="label mb-1">Subject Header</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter message topic..."
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    className="input w-full py-1.5 text-xs"
                  />
                </div>

                <div className="text-xs">
                  <label className="label mb-1">Message Detail Body</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Write your message here..."
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    className="textarea w-full text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-border pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setComposing(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary text-xs"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          ) : activeMessage ? (
            /* Selected Message Display */
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{activeMessage.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Received: {new Date(activeMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`badge text-[9px] uppercase font-bold tracking-wider ${activeMessage.isRead ? "badge-neutral" : "badge-success"}`}>
                    {activeMessage.isRead ? "read" : "unread"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  {activeMessage.body}
                </div>
              </div>

              {/* Quick Reply Trigger Box */}
              {(() => {
                const emailMatch = activeMessage.body?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
                const senderEmail = emailMatch ? emailMatch[1] : "";
                
                if (senderEmail && senderEmail !== user?.email) {
                  return (
                    <div className="border-t border-border pt-4 mt-6 flex justify-between items-center gap-4">
                      <p className="text-[10px] text-muted-foreground truncate">
                        Sender: <strong className="font-mono">{senderEmail}</strong>
                      </p>
                      <button
                        onClick={() => handleInitiateReply(senderEmail, activeMessage.title)}
                        className="btn-primary btn-sm text-xs py-1.5 px-4 flex items-center gap-1.5 shrink-0"
                      >
                        <span>↩</span>
                        Reply
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-16">
              <span className="text-4xl">✉️</span>
              <p className="font-semibold text-xs text-foreground">No Selected Conversation</p>
              <p className="text-[10px] text-muted-foreground max-w-xs leading-normal">
                Choose an item from the conversations list, or compose a new message.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
