import { apiFetch } from "@/lib/api";

export async function listCourses(token, query = {}) {
  const qs = new URLSearchParams(query).toString();
  return apiFetch(`/courses${qs ? `?${qs}` : ""}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function getCourse(token, id) {
  return apiFetch(`/courses/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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

export async function updateCourseStatus(token, id, status) {
  return apiFetch(`/courses/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

export async function deleteCourse(token, id) {
  return apiFetch(`/courses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function enrollCourse(token, id) {
  return apiFetch(`/courses/${id}/enroll`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateCourseFeatured(token, id, isFeatured, featuredOrder) {
  return apiFetch(`/courses/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isFeatured, featuredOrder }),
  });
}

export async function reorderFeaturedCoursesApi(token, courseOrders) {
  return apiFetch(`/courses/reorder-featured`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ courseOrders }),
  });
}

