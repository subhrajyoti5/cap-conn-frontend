import { apiFetch } from "@/lib/api";

export async function generateAiQuestions(
  token,
  courseId,
  { resourceIds, customInstructions, questionCount, marksPerQuestion }
) {
  return apiFetch(`/courses/${courseId}/assessments/generate-ai`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      resourceIds,
      customInstructions: customInstructions || undefined,
      questionCount,
      marksPerQuestion: marksPerQuestion ?? 1,
    }),
  });
}

export async function createAssessment(token, payload) {
  return apiFetch("/assessments", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateAssessment(token, id, payload) {
  return apiFetch(`/assessments/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function publishAssessment(token, id) {
  return apiFetch(`/assessments/${id}/publish`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteAssessment(token, id) {
  return apiFetch(`/assessments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAssessment(token, id) {
  return apiFetch(`/assessments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listCourseAssessments(token, courseId) {
  return apiFetch(`/courses/${courseId}/assessments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function startAssessment(token, id) {
  return apiFetch(`/assessments/${id}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitAssessment(token, id, answers) {
  return apiFetch(`/assessments/${id}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ answers }),
  });
}

export async function getResult(token, id) {
  return apiFetch(`/assessments/${id}/result`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
