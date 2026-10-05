import type { operations } from '@/types/api';

// The API origin comes from the environment so each deployment (local, preview,
// production) points at its own backend. Next.js inlines NEXT_PUBLIC_* at build
// time, so a missing value fails the build here rather than at runtime.
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!configuredApiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local for local development, or set it in the deployment's environment variables.",
  );
}

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

/** The values the API accepts in {@link TALIM_APP_HEADER}, from the generated contract. */
export type TalimApp = NonNullable<
  NonNullable<operations['AuthenticationController_refreshToken']['parameters']['header']>['X-Talim-App']
>;

/**
 * Request header that names the calling Talim web app. With it, the API keeps
 * this app's refresh token in its own httpOnly cookie (`refreshToken_<app>`)
 * instead of the one shared by every portal, so signing in to another portal in
 * the same browser no longer signs this one out, and it signs in or refreshes
 * only an account whose role belongs in the app.
 */
export const TALIM_APP_HEADER = 'X-Talim-App';

/**
 * This portal's {@link TALIM_APP_HEADER} value. The API admits only `admin`
 * accounts under it (403 `FORBIDDEN` on sign-in, 401 on refresh otherwise) and
 * keeps the session in the `refreshToken_platform-admin` cookie.
 */
export const TALIM_APP = 'platform-admin' satisfies TalimApp;

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  INTROSPECT: `${API_BASE_URL}/auth/introspect`,

  SCHOOLS_SEARCH: `${API_BASE_URL}/schools/search`,
  SCHOOL_CREATE: `${API_BASE_URL}/schools/create`,
  SCHOOL_BY_ID: (schoolId: string) => `${API_BASE_URL}/schools/${schoolId}`,
  SCHOOL_UPDATE: (schoolId: string) =>
    `${API_BASE_URL}/schools/update/${schoolId}`,
  SCHOOL_STATUS: (schoolId: string) =>
    `${API_BASE_URL}/schools/${schoolId}/status`,
  SCHOOL_DELETE: (schoolId: string) => `${API_BASE_URL}/schools/delete/${schoolId}`,
  SCHOOL_RESTORE: (schoolId: string) => `${API_BASE_URL}/schools/restore/${schoolId}`,

  UPLOAD_IMAGE: `${API_BASE_URL}/upload/image`,

  ADMIN_LOGIN: `${API_BASE_URL}/auth/admin-login`,
  ACTIVITY_LOGS: `${API_BASE_URL}/auth/activity-logs`,

  COMPLAINTS: `${API_BASE_URL}/complaints`,
  COMPLAINT_BY_ID: (id: string) => `${API_BASE_URL}/complaints/${id}`,
  COMPLAINT_STATUS: (id: string) => `${API_BASE_URL}/complaints/${id}/status`,

  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  NOTIFICATION_BY_ID: (id: string) => `${API_BASE_URL}/notifications/${id}`,

  PROFILE_UPDATE: `${API_BASE_URL}/auth/profile/update/`,
  PROFILE_AVATAR: `${API_BASE_URL}/auth/profile/avatar`,
  PROFILE_BY_ID: (userId: string) => `${API_BASE_URL}/auth/profile/${userId}`,

  PAYMENT_PLATFORM_PROVIDERS: `${API_BASE_URL}/payments/platform/providers`,
  PAYMENT_PLATFORM_PROVIDER_CONFIG: (name: string) => `${API_BASE_URL}/payments/platform/providers/${name}/config`,
  PAYMENT_PLATFORM_PROVIDER_ENABLE: (name: string) => `${API_BASE_URL}/payments/platform/providers/${name}/enable`,
  PAYMENT_PLATFORM_PROVIDER_DISABLE: (name: string) => `${API_BASE_URL}/payments/platform/providers/${name}/disable`,
} as const;
