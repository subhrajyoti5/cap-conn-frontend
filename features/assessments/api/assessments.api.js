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

export async function submitDocumentAssessment(token, id, { fileUrl, fileName, notes }) {
  return apiFetch(`/assessments/${id}/submit-document`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fileUrl, fileName, notes }),
  });
}

export async function getAssessmentUploadUrl(token, { courseId, fileName, mimeType, sizeBytes }) {
  return apiFetch("/assessments/upload-url", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ courseId, fileName, mimeType, sizeBytes }),
  });
}

export async function uploadAssessmentFilePipeline(token, { courseId, file }) {
  const { data } = await getAssessmentUploadUrl(token, {
    courseId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  });

  const { uploadUrl, storageKey } = data;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  return {
    storageKey,
    fileName: file.name,
  };
}

export async function listSubmissions(token, id, query = {}) {
  const params = new URLSearchParams(query);
  const qStr = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/assessments/${id}/submissions${qStr}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function gradeSubmission(token, id, submissionId, { score, feedback }) {
  return apiFetch(`/assessments/${id}/submissions/${submissionId}/grade`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ score, feedback }),
  });
}

export async function getResult(token, id) {
  return apiFetch(`/assessments/${id}/result`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
