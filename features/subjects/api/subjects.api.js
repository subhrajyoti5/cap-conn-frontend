import { apiFetch } from "@/lib/api";

export async function listSubjects(token) {
  return apiFetch("/subjects", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
