/**
 * Talim Admin's user directory and user detail (v1.5 addendum 2026-10-09,
 * `talimBE-V2/docs/v1.5-platform-sync.md`, "Addendum (2026-10-09)").
 *
 * TODO-switch: `GET /admin/users/:id`, `PATCH /admin/users/:id/status` and the
 * search's new `status` filter and per-hit `status` were not in the generated
 * contract (`./api.d.ts`) when this was written, so the shapes below are
 * hand-written from the contract doc. Once `npm run types:api` brings
 * `AdminUserDetailDto`, replace each with its alias (`Schema<'AdminUserDetailDto'>`,
 * `RequestBody<'/admin/users/{id}/status', 'patch'>`,
 * `RequestQuery<'/admin/users/search'>`, `Schema<'AdminUserSearchItemDto'>`)
 * and delete the hand-written ones; `tsc` then shows every screen a
 * difference touches.
 */
import type { AdminUserSearchItem, AdminUserSearchQuery } from './broadcasts';
import type { TicketSummary } from './tickets';

/** A user's role, as the API writes it. */
export type AdminUserRole = AdminUserSearchItem['role'];

/** Where an account stands: `deletion_scheduled` during the 30-day grace, `deleted` once erased. */
export type AdminUserStatus = 'active' | 'inactive' | 'deletion_scheduled' | 'deleted';

/** The search's status filter (default `active`); `all` includes every status. */
export type AdminUserStatusFilter = 'active' | 'inactive' | 'deletion_scheduled' | 'all';

/** Query of `GET /admin/users/search`, with the v1.5 addendum's `status` filter. TODO-switch. */
export type AdminUserListQuery = AdminUserSearchQuery & { status?: AdminUserStatusFilter };

/**
 * One user found by `GET /admin/users/search`, with the addendum's `status`.
 * Optional until the backend ships it. TODO-switch.
 */
export type AdminUserSearchHit = AdminUserSearchItem & { status?: AdminUserStatus };

/** A school or class by name. */
export interface AdminUserRef {
  id: string;
  name: string;
}

/** One of a parent's children. */
export interface AdminUserChild {
  id: string;
  name: string;
  className: string | null;
  school: AdminUserRef | null;
}

/** `GET /admin/users/:id` (`AdminUserDetailDto`). TODO-switch. */
export interface AdminUserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  role: AdminUserRole;
  isActive: boolean;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp; `null` when they have never signed in. */
  lastLoginAt: string | null;
  status: AdminUserStatus;
  school: AdminUserRef | null;
  /** Parents only. */
  children?: AdminUserChild[];
  /** Students only. */
  className?: string | null;
  /** Their tickets: open and total counts, and the 5 most recent. */
  tickets: { open: number; total: number; recent: TicketSummary[] };
  /** Set while a self-service deletion is pending. */
  deletion: { requestedAt: string; scheduledFor: string } | null;
}

/** Body of `PATCH /admin/users/:id/status`. TODO-switch. */
export interface UpdateAdminUserStatusPayload {
  isActive: boolean;
  reason?: string;
}
