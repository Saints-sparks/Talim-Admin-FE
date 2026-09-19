/**
 * Request payloads for every write endpoint the Talim Admin app calls, taken
 * from the backend contract (`./api.d.ts`) instead of written by hand.
 *
 * A service that types its parameter with one of these aliases makes `tsc`
 * compare the object the app builds with the backend DTO. The API runs
 * `whitelist + forbidNonWhitelisted`, so a missing required field, a wrong enum
 * value or one extra property is a 400 in production; here it is a compile
 * error the next time the contract is refreshed (`npm run types:api`).
 *
 * Deliberately NOT here: `PUT /auth/profile/avatar`. The contract documents it
 * as multipart only; the app also sends `{ avatarUrl: '' }` as JSON to remove
 * the avatar, which the endpoint accepts, so that call stays hand-typed.
 */
import type { RequestBody } from './apiContract';

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Body of `POST /auth/admin-login`. */
export type AdminLoginPayload = RequestBody<'/auth/admin-login', 'post'>;
/** Body of `POST /auth/introspect`. */
export type IntrospectPayload = RequestBody<'/auth/introspect', 'post'>;
/** Body of `PUT /auth/profile/update`. */
export type UpdateProfileContractPayload = RequestBody<'/auth/profile/update', 'put'>;

// ─── Schools ──────────────────────────────────────────────────────────────────

/** Body of `POST /schools/create` (school registration). */
export type CreateSchoolPayload = RequestBody<'/schools/create', 'post'>;
/** Body of `PUT /schools/update/{id}`. */
export type UpdateSchoolPayload = RequestBody<'/schools/update/{id}', 'put'>;
/** Body of `PATCH /schools/{id}/status`. */
export type UpdateSchoolStatusPayload = RequestBody<'/schools/{id}/status', 'patch'>;

// ─── Payments ─────────────────────────────────────────────────────────────────

/** Body of `PATCH /payments/platform/providers/{providerName}/config`. */
export type PlatformProviderConfigPayload = RequestBody<
  '/payments/platform/providers/{providerName}/config',
  'patch'
>;

// ─── Notifications and support ────────────────────────────────────────────────

/** Body of `POST /notifications` (an announcement or notification from Talim). */
export type CreateNotificationPayload = RequestBody<'/notifications', 'post'>;
/** Body of `PATCH /complaints/{id}/status`. */
export type UpdateComplaintStatusPayload = RequestBody<'/complaints/{id}/status', 'patch'>;
