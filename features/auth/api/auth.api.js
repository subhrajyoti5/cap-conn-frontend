import { apiFetch } from "@/lib/api";

export async function fetchMe(token) {
  return apiFetch("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
