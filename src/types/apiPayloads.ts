/**
 * Request payloads for every write endpoint the Talim Admin app calls, taken
 * from the backend contract (`./api.d.ts`) instead of written by hand.
 *
 * A service that types its parameter with one of these aliases makes `tsc`
 * compare the object the app builds with the backend DTO. The API runs
 * `whitelist + forbidNonWhitelisted`, so a missing required field, a wrong enum
 * value or one extra property is a 400 in production; here it is a compile
 * error the next time the contract is refreshed (`npm run types:api`).
 */
import type { RequestBody } from './apiContract';

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Body of `POST /auth/admin-login`. */
export type AdminLoginPayload = RequestBody<'/auth/admin-login', 'post'>;
/** Body of `POST /auth/introspect`. */
export type IntrospectPayload = RequestBody<'/auth/introspect', 'post'>;
/** Body of `PUT /auth/profile/update`. */
export type UpdateProfileContractPayload = RequestBody<'/auth/profile/update', 'put'>;
/** JSON body of `PUT /auth/profile/avatar` (`{ avatarUrl: '' }` removes the avatar). */
export type UpdateAvatarPayload = RequestBody<'/auth/profile/avatar', 'put'>;

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
