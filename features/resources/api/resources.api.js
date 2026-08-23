import { apiFetch } from "@/lib/api";

/**
 * 1. Request presigned PUT URL and storage key from backend
 */
export async function getUploadUrl(token, { courseId, fileName, mimeType, sizeBytes }) {
  return apiFetch("/resources/upload-url", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ courseId, fileName, mimeType, sizeBytes }),
  });
}

/**
 * 2. Upload raw binary buffer directly to Cloudflare R2 via presigned PUT URL
 */
export function uploadFileToR2(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        reject(new Error(`R2 Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during Cloudflare R2 binary upload."));
    };

    xhr.send(file);
  });
}

/**
 * 3. Persist resource metadata in database after successful R2 upload or for external Drive links
 */
export async function createResource(token, { courseId, title, type, storageKey, sizeBytes, mimeType }) {
  return apiFetch("/resources", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      courseId,
      title,
      type,
      storageKey,
      sizeBytes: Number(sizeBytes) || 1024,
      mimeType: mimeType || "application/octet-stream",
    }),
  });
}

/**
 * 4. Fetch resource download/streaming URL
 */
export async function getResource(token, id) {
  return apiFetch(`/resources/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * 5. Delete a course resource
 */
export async function deleteResource(token, id) {
  return apiFetch(`/resources/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * End-to-end Helper: Uploads a file directly to R2 and registers it in the backend
 */
export async function uploadResourcePipeline(token, { courseId, file, title, type, onProgress }) {
  // 1. Get presigned URL
  const { data } = await getUploadUrl(token, {
    courseId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  });

  const { uploadUrl, storageKey } = data;

  // 2. Direct binary PUT to Cloudflare R2
  await uploadFileToR2(uploadUrl, file, onProgress);

  // 3. Save metadata in DB
  const resourceRes = await createResource(token, {
    courseId,
    title: title || file.name,
    type: type || (file.type?.startsWith("video/") ? "LECTURE" : "DOCUMENT"),
    storageKey,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
  });

  return resourceRes.data;
}
