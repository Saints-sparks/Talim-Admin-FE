/**
 * Talim Admin's user directory and user detail (v1.5 addendum 2026-10-09,
 * `talimBE-V2/docs/v1.5-platform-sync.md`, "Addendum (2026-10-09)" and
 * "As built"). Every shape aliases the generated contract (`./api.d.ts`,
 * refreshed with `npm run types:api`), so `tsc` flags any drift. The search's
 * query and hits are `AdminUserSearchQuery` and `AdminUserSearchItem` in
 * `./broadcasts`.
 */
import type { RequestBody, Schema } from './apiContract';
import type { AdminUserSearchItem, AdminUserSearchQuery } from './broadcasts';

/** A user's role, as the API writes it. */
export type AdminUserRole = AdminUserSearchItem['role'];

/** Where an account stands: `deletion_scheduled` during the 30-day grace, `deleted` once erased. */
export type AdminUserStatus = AdminUserSearchItem['status'];

/** The search's status filter (default `active`); `all` includes every status, erased accounts too. */
export type AdminUserStatusFilter = NonNullable<AdminUserSearchQuery['status']>;

/**
 * `GET /admin/users/:id` (and the `PATCH .../status` answer). Identity fields
 * are top-level; `children` is `[]` for non-parents (each child's `id` is
 * their user id, `studentId` their Student record); `className` is `null`
 * for non-students; `deletion` is set while a deletion is pending and after
 * the erase.
 */
export type AdminUserDetail = Schema<'AdminUserDetailDto'>;

/** Body of `PATCH /admin/users/:id/status`. */
export type UpdateAdminUserStatusPayload = RequestBody<'/admin/users/{id}/status', 'patch'>;
