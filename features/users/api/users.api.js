import { apiFetch } from "@/lib/api";

export async function listPendingUsers(token, query = {}) {
  const qs = new URLSearchParams(query).toString();
  return apiFetch(`/admin/users/pending${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function approveUser(token, id) {
  return apiFetch(`/admin/users/${id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function rejectUser(token, id, reason) {
  return apiFetch(`/admin/users/${id}/reject`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  });
}
