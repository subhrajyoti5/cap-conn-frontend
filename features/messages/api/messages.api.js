import { apiFetch } from "@/lib/api";

export async function getConversations(token) {
  return apiFetch("/messages/conversations", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getThread(token, partnerId) {
  return apiFetch(`/messages/thread/${partnerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendMessage(token, { receiverId, content }) {
  return apiFetch("/messages", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ receiverId, content }),
  });
}

export async function markThreadRead(token, partnerId) {
  return apiFetch(`/messages/read/${partnerId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDirectory(token) {
  return apiFetch("/messages/directory", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
