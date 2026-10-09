import { api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/app/lib/api/config';
import { toQueryString } from '@/lib/queryString';
import { adminUserService } from './admin-user.service';
import type { CreateBroadcastPayload } from '@/types/apiPayloads';
import type {
  AdminUserSearchItem,
  AdminUserSearchQuery,
  Broadcast,
  BroadcastAudience,
  BroadcastListQuery,
  BroadcastPage,
  BroadcastPreview,
  CreateBroadcastResult,
} from '@/types/broadcasts';

/** Rows per page of the broadcast history. */
export const BROADCAST_PAGE_SIZE = 20;

/** People one search for the audience returns (the API allows 1–50). */
export const PEOPLE_SEARCH_LIMIT = 20;

/**
 * Talim Admin notifications (v1.5 §2, "v1.5 as built"): a platform-level
 * announcement sent to any audience, in-app always, push and email
 * optional, now or at a set time. Every route is platform-admin only.
 *
 * It replaces this portal's use of `POST /notifications` and
 * `GET /notifications` (one composer, one history).
 */
export const broadcastService = {
  /**
   * Counts who an audience reaches, by school and by role, without sending.
   *
   * @param audience - Everyone, or (schools × roles) ∪ specific people.
   * @returns The recipient count and its breakdowns.
   * @throws ApiError - `VALIDATION_FAILED` when the audience names nobody or is malformed.
   */
  async preview(audience: BroadcastAudience): Promise<BroadcastPreview> {
    return api.post<BroadcastPreview>(API_ENDPOINTS.ADMIN_BROADCASTS_PREVIEW, { audience });
  },

  /**
   * Sends a broadcast now, or schedules it when `sendAt` is in the future
   * (a past `sendAt` sends now).
   *
   * @param payload - Title (1..120), body (1..2000), attachment URLs, target,
   *   audience, channels and `sendAt` (at most a year ahead).
   * @returns The new broadcast's id, `scheduled` or `sending`, and the recipient estimate.
   * @throws ApiError - `VALIDATION_FAILED` for a bad field or an audience that names nobody.
   */
  async create(payload: CreateBroadcastPayload): Promise<CreateBroadcastResult> {
    return api.post<CreateBroadcastResult>(API_ENDPOINTS.ADMIN_BROADCASTS, payload);
  },

  /**
   * One page of broadcasts, newest first, each with its delivery stats.
   *
   * @param query - Status filter and page.
   * @returns The page and its pagination meta.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async list(query: BroadcastListQuery = {}): Promise<BroadcastPage> {
    return api.get<BroadcastPage>(`${API_ENDPOINTS.ADMIN_BROADCASTS}${toQueryString({ limit: BROADCAST_PAGE_SIZE, ...query })}`);
  },

  /**
   * One broadcast with its stats, its schools' names and the people it names.
   *
   * @param id - The broadcast id.
   * @returns The broadcast.
   * @throws ApiError - `NOT_FOUND` when no such broadcast exists.
   */
  async get(id: string): Promise<Broadcast> {
    return api.get<Broadcast>(API_ENDPOINTS.ADMIN_BROADCAST_BY_ID(id));
  },

  /**
   * Cancels a scheduled broadcast.
   *
   * @param id - The broadcast id.
   * @returns The cancelled broadcast.
   * @throws ApiError - 409 with `reasonCode` `BROADCAST_NOT_SCHEDULED` once it
   *   has started sending.
   */
  async cancel(id: string): Promise<Broadcast> {
    return api.post<Broadcast>(API_ENDPOINTS.ADMIN_BROADCAST_CANCEL(id));
  },

  /**
   * Finds people anywhere on Talim for an audience's "specific people":
   * active users whose name or email contains every word of `q`, by name.
   * The same search as the user directory ({@link adminUserService.search}).
   *
   * @param query - The words (`q`), and optionally a role, a school and a limit (1–50).
   * @returns The people found, each with their role and school.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async searchPeople(query: AdminUserSearchQuery): Promise<AdminUserSearchItem[]> {
    return adminUserService.search({ limit: PEOPLE_SEARCH_LIMIT, ...query });
  },
};
