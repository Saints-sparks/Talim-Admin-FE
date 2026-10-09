import { ApiError, getErrorMessage } from '@/lib/apiError';
import type { PillTone } from '@/components/tl/styles';
import { oneOf, ROLE_LABELS } from '@/components/support/desk-model';
import type {
  AdminUserDetail,
  AdminUserListQuery,
  AdminUserRole,
  AdminUserStatus,
  AdminUserStatusFilter,
} from '@/types/adminUsers';

/** The user directory's path. */
export const USERS_PATH = '/talimadmindashboard/users';

/**
 * The detail page's path for a user.
 *
 * @param id - The user id.
 * @returns The path.
 */
export function userHref(id: string): string {
  return `${USERS_PATH}/${encodeURIComponent(id)}`;
}

/** Every role, in the order the role filter lists them. */
export const USER_ROLES: readonly AdminUserRole[] = ['parent', 'student', 'teacher', 'school_admin', 'school_sub_admin', 'admin'];

/** The status filter's choices, in order; `active` is the API's default. */
export const USER_STATUS_FILTERS: readonly AdminUserStatusFilter[] = ['active', 'inactive', 'deletion_scheduled', 'all'];

/** Label and pill tone per account status. */
export const USER_STATUS_META: Record<AdminUserStatus, { label: string; tone: PillTone }> = {
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Deactivated', tone: 'muted' },
  deletion_scheduled: { label: 'Deletion scheduled', tone: 'warning' },
  deleted: { label: 'Deleted', tone: 'danger' },
};

/** Label per status filter choice. */
export const USER_STATUS_FILTER_LABELS: Record<AdminUserStatusFilter, string> = {
  active: 'Active',
  inactive: 'Deactivated',
  deletion_scheduled: 'Deletion scheduled',
  all: 'Any status',
};

/** Longest reason the status sheet sends. */
export const STATUS_REASON_MAX_LENGTH = 500;

/** Every directory filter, as the URL carries it. */
export interface UserFilters {
  q: string;
  role: AdminUserRole | '';
  schoolId: string;
  status: AdminUserStatusFilter;
}

/** The filters a bare `/talimadmindashboard/users` opens on. */
export const DEFAULT_USER_FILTERS: UserFilters = { q: '', role: '', schoolId: '', status: 'active' };

/**
 * Reads the directory filters from the URL, ignoring unknown values.
 *
 * @param params - The page's search params.
 * @returns The filters.
 */
export function parseUserFilters(params: Pick<URLSearchParams, 'get'>): UserFilters {
  return {
    q: params.get('q') ?? '',
    role: oneOf<AdminUserRole | ''>(params.get('role'), USER_ROLES, ''),
    schoolId: params.get('school') ?? '',
    status: oneOf<AdminUserStatusFilter>(params.get('status'), USER_STATUS_FILTERS, DEFAULT_USER_FILTERS.status),
  };
}

/**
 * Writes the directory filters back to a query string, leaving out defaults
 * so a plain link stays `/talimadmindashboard/users`.
 *
 * @param filters - The filters.
 * @returns The query string including `?`, or an empty string.
 */
export function userFiltersToSearch(filters: UserFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.role) params.set('role', filters.role);
  if (filters.schoolId) params.set('school', filters.schoolId);
  if (filters.status !== DEFAULT_USER_FILTERS.status) params.set('status', filters.status);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * Turns the URL filters into the `GET /admin/users/search` query. The status
 * is always sent, so a hit's status is known even when the API leaves it out.
 *
 * @param filters - The filters.
 * @param limit - How many users to ask for.
 * @returns The query.
 */
export function toUserQuery(filters: UserFilters, limit: number): AdminUserListQuery {
  return {
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
    status: filters.status,
    limit,
  };
}

/**
 * A role's label ("School admin").
 *
 * @param role - The role as the API writes it.
 * @returns The label, or the raw role when unknown.
 */
export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

/**
 * A user's display name, falling back to their email.
 *
 * @param user - The user.
 * @returns The name.
 */
export function userDisplayName(user: Pick<AdminUserDetail, 'firstName' | 'lastName' | 'email'>): string {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || 'Unnamed user';
}

/**
 * Why Talim Admin can't switch this account on or off from the page, or
 * `null` when it can. The API refuses these too; this saves the round trip.
 *
 * @param user - The user.
 * @param myUserId - The signed-in admin's id.
 * @returns The explanation, or `null`.
 */
export function statusLock(user: Pick<AdminUserDetail, 'id' | 'role' | 'status'>, myUserId: string | null | undefined): string | null {
  if (user.status === 'deleted') return 'This account has been deleted, so it can no longer be reactivated.';
  if (user.id === myUserId) return 'This is your own account. Another Talim admin has to change it.';
  if (user.role === 'admin') return 'Talim staff accounts can’t be deactivated here.';
  return null;
}

/**
 * The words for a failed deactivate or reactivate, from the route's own
 * reason (`reasonCode`): `SELF`, `ADMIN_ACCOUNT` and `ACCOUNT_DELETED`;
 * anything else uses the server's message.
 *
 * @param error - What was thrown.
 * @param deactivating - True when the admin was switching the account off.
 * @returns The message to show.
 */
export function statusErrorMessage(error: unknown, deactivating: boolean): string {
  if (!(error instanceof ApiError)) return getErrorMessage(error);
  switch (error.reasonCode) {
    case 'SELF':
      return `You can’t ${deactivating ? 'deactivate' : 'reactivate'} your own account. Another Talim admin has to do it.`;
    case 'ADMIN_ACCOUNT':
      return 'Talim staff accounts can’t be deactivated or reactivated here.';
    case 'ACCOUNT_DELETED':
      return 'This account has been deleted. Its personal details are gone, so it can’t be changed.';
    default:
      return error.message;
  }
}
