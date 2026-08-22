const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  // Enhanced error handling: log details and hint at token refresh on 401
  if (!res.ok) {
    console.error(`API request failed ${path}`, {
      status: res.status,
      statusText: res.statusText,
      data,
    });
    if (res.status === 401) {
      console.warn("Authentication token may be expired. Verify Clerk token refresh.");
    }
    const error = new Error(data?.message || "Request failed");
    error.code = data?.code || "UNKNOWN";
    error.status = res.status;
    throw error;
  }

  return data;
}
