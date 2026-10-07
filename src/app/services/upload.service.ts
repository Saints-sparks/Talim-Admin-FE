import { API_ENDPOINTS, TALIM_APP, TALIM_APP_HEADER } from '@/app/lib/api/config';
import { apiClient, unwrapEnvelope } from '@/lib/apiClient';
import { ApiError } from '@/lib/apiError';
import { sessionStore } from '@/lib/session';

/** Largest logo the UI accepts, matched to the backend's `MAX_UPLOAD_BYTES`. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Image types `POST /upload/image` accepts. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Why a chosen file cannot be uploaded, or `null` when it is fine. Mirrors the
 * server's own limits so the user hears about it before the round trip.
 *
 * @param file - The chosen file.
 * @returns The problem, or `null`.
 */
export function validateImageFile(file: File | null | undefined): string | null {
  if (!file) return 'No file selected.';
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'That file type is not supported. Upload a JPEG, PNG, GIF or WebP image.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `That file is too large. The maximum size is ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`;
  }
  return null;
}

/** Largest attachment `POST /upload/file` accepts (the backend's `MAX_UPLOAD_BYTES`). */
export const MAX_ATTACHMENT_BYTES = 200 * 1024 * 1024;

/** File extensions `POST /upload/file` accepts (the backend's `allowedFileExtensions`). */
export const ACCEPTED_ATTACHMENT_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar',
  'mp4', 'mov', 'webm', 'mp3', 'm4a', 'aac', 'wav', 'ogg',
] as const;

/**
 * Why a chosen file cannot be attached, or `null` when it is fine. Mirrors
 * the server's extension list and size limit for `POST /upload/file`.
 *
 * @param file - The chosen file.
 * @returns The problem, or `null`.
 */
export function validateAttachmentFile(file: File | null | undefined): string | null {
  if (!file) return 'No file selected.';
  const dot = file.name.lastIndexOf('.');
  const extension = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : '';
  if (!(ACCEPTED_ATTACHMENT_EXTENSIONS as readonly string[]).includes(extension)) {
    return `${file.name}: that file type is not supported.`;
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `${file.name} is too large. The maximum size is ${MAX_ATTACHMENT_BYTES / 1024 / 1024}MB.`;
  }
  return null;
}

/**
 * Sends one file as `multipart/form-data` field `file` and resolves the
 * hosted URL the API returns.
 *
 * `XMLHttpRequest` rather than `fetch`, because only XHR exposes upload
 * progress events; it borrows the bearer token from {@link sessionStore} and
 * sends the same `X-Talim-App` header as {@link apiClient}, so it
 * authenticates exactly like the rest of the app, and it raises the same
 * {@link ApiError} type as {@link apiClient} so callers have one error shape.
 *
 * @param endpoint - The absolute upload URL.
 * @param file - The file to send.
 * @param failureMessage - Shown when the server gives no message.
 * @param onProgress - Called with 0–100 as bytes go out.
 * @param signal - Aborts the upload when the caller unmounts.
 * @returns The hosted URL.
 * @throws ApiError - `PAYLOAD_TOO_LARGE`, `SERVICE_UNAVAILABLE` or the server's code.
 */
function uploadMultipart(
  endpoint: string,
  file: File,
  failureMessage: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append('file', file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        parsed = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        const payload = unwrapEnvelope<{ url?: string }>(parsed);
        if (payload?.url) {
          resolve(payload.url);
          return;
        }
        reject(new ApiError('INTERNAL_ERROR', 'The upload succeeded but returned no URL.', xhr.status));
        return;
      }

      const message = (parsed as { message?: string } | null)?.message ?? failureMessage;
      reject(new ApiError(xhr.status === 413 ? 'PAYLOAD_TOO_LARGE' : 'BAD_REQUEST', message, xhr.status));
    };

    xhr.onerror = () => reject(ApiError.unreachable());
    xhr.ontimeout = () => reject(ApiError.timeout());
    xhr.onabort = () => reject(new ApiError('UNKNOWN', 'The upload was cancelled.', 0));

    signal?.addEventListener('abort', () => xhr.abort(), { once: true });

    xhr.open('POST', endpoint);
    xhr.withCredentials = true;
    xhr.setRequestHeader(TALIM_APP_HEADER, TALIM_APP);
    const token = sessionStore.getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(body);
  });
}

/**
 * Uploads an image (`POST /upload/image`) and reports progress.
 *
 * @param file - The image to upload.
 * @param onProgress - Called with 0–100 as bytes go out.
 * @param signal - Aborts the upload when the caller unmounts.
 * @returns The hosted URL of the uploaded image.
 * @throws ApiError - `PAYLOAD_TOO_LARGE`, `SERVICE_UNAVAILABLE` or the server's code.
 */
export function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return uploadMultipart(API_ENDPOINTS.UPLOAD_IMAGE, file, 'The image could not be uploaded.', onProgress, signal);
}

/**
 * Uploads an attachment of any accepted type (`POST /upload/file`) and
 * reports progress. Used by ticket replies and broadcasts, which then send
 * `{ url, name, mimeType, size }` with the message.
 *
 * @param file - The file to upload.
 * @param onProgress - Called with 0–100 as bytes go out.
 * @param signal - Aborts the upload when the caller unmounts.
 * @returns The hosted URL of the uploaded file.
 * @throws ApiError - `PAYLOAD_TOO_LARGE`, `SERVICE_UNAVAILABLE` or the server's code.
 */
export function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return uploadMultipart(API_ENDPOINTS.UPLOAD_FILE, file, 'The file could not be uploaded.', onProgress, signal);
}
