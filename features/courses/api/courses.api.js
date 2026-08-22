import { apiFetch } from "@/lib/api";

export async function listCourses(token, query = {}) {
  const qs = new URLSearchParams(query).toString();
  return apiFetch(`/courses${qs ? `?${qs}` : ""}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function getCourse(token, id) {
  return apiFetch(`/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createCourse(token, data) {
  return apiFetch("/courses", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function publishCourse(token, id) {
  return apiFetch(`/courses/${id}/publish`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function enrollCourse(token, id) {
  return apiFetch(`/courses/${id}/enroll`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
