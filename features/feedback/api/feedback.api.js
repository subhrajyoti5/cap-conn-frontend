import { apiFetch } from "@/lib/api";

export async function submitCourseFeedback(token, courseId, { rating, comment }) {
  return apiFetch(`/courses/${courseId}/feedback`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment }),
  });
}

export async function deleteCourseFeedback(token, courseId) {
  return apiFetch(`/courses/${courseId}/feedback`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getCourseFeedback(token, courseId) {
  return apiFetch(`/courses/${courseId}/feedback`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitTrainerFeedback(token, courseId, trainerId, { rating, comment }) {
  return apiFetch(`/courses/${courseId}/trainers/${trainerId}/feedback`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment }),
  });
}

export async function deleteTrainerFeedback(token, courseId, trainerId) {
  return apiFetch(`/courses/${courseId}/trainers/${trainerId}/feedback`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTrainerCourseFeedback(token, courseId, trainerId) {
  return apiFetch(`/courses/${courseId}/trainers/${trainerId}/feedback`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitResourceFeedback(token, resourceId, { rating, comment }) {
  return apiFetch(`/resources/${resourceId}/feedback`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment }),
  });
}

export async function updateResourceFeedback(token, commentId, { rating, comment }) {
  return apiFetch(`/resources/comments/${commentId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment }),
  });
}

export async function deleteResourceFeedback(token, commentId) {
  return apiFetch(`/resources/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getResourceFeedback(token, resourceId) {
  return apiFetch(`/resources/${resourceId}/feedback`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitAssessmentComment(token, assessmentId, { comment, isGrievance }) {
  return apiFetch(`/assessments/${assessmentId}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ comment, isGrievance }),
  });
}

export async function updateAssessmentComment(token, commentId, { comment, isGrievance }) {
  return apiFetch(`/assessments/comments/${commentId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ comment, isGrievance }),
  });
}

export async function deleteAssessmentComment(token, commentId) {
  return apiFetch(`/assessments/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAssessmentComments(token, assessmentId) {
  return apiFetch(`/assessments/${assessmentId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
