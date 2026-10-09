import { api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/app/lib/api/config';
import { toQueryString } from '@/lib/queryString';
import type {
  AdminUserDetail,
  AdminUserListQuery,
  AdminUserSearchHit,
  UpdateAdminUserStatusPayload,
} from '@/types/adminUsers';

/** Most users one directory search returns (the API's ceiling). */
export const USER_SEARCH_LIMIT = 50;

/**
 * Platform-admin user reads and the account switch (v1.5 §2 search, and the
 * 2026-10-09 addendum's detail and status). Every route is platform-admin
 * only. The broadcast composer's "specific people" search goes through
 * {@link adminUserService.search} too.
 */
export const adminUserService = {
  /**
   * Finds users anywhere on Talim whose name or email contains every word of
   * `q`, by name. Without `q`, the first users of the role, school or status.
   *
   * @param query - The words (`q`), role, school, status (`active` when left
   *   out) and limit (1–50).
   * @returns The users found, each with role, school and status.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async search(query: AdminUserListQuery): Promise<AdminUserSearchHit[]> {
    return api.get<AdminUserSearchHit[]>(`${API_ENDPOINTS.ADMIN_USERS_SEARCH}${toQueryString(query)}`);
  },

  /**
   * One user: identity, status, school, children (parents) or class
   * (students), ticket summary and any pending deletion.
   *
   * @param id - The user id.
   * @returns The user.
   * @throws ApiError - `NOT_FOUND` when no such user exists.
   */
  async get(id: string): Promise<AdminUserDetail> {
    return api.get<AdminUserDetail>(API_ENDPOINTS.ADMIN_USER_BY_ID(id));
  },

  /**
   * Deactivates or reactivates an account. Deactivating signs the user out
   * everywhere. The change is activity-logged with the reason.
   *
   * @param id - The user id.
   * @param payload - `isActive` and an optional reason.
   * @returns The user after the change.
   * @throws ApiError - 409 with `reasonCode` `SELF` (your own account) or
   *   `ACCOUNT_DELETED` (already erased); 403 `ADMIN_ACCOUNT` for Talim staff.
   */
  async setStatus(id: string, payload: UpdateAdminUserStatusPayload): Promise<AdminUserDetail> {
    return api.patch<AdminUserDetail>(API_ENDPOINTS.ADMIN_USER_STATUS(id), payload);
  },
};
