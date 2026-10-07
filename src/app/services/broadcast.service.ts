import { api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/app/lib/api/config';
import { toQueryString } from '@/lib/queryString';
import type {
  Broadcast,
  BroadcastAudience,
  BroadcastListQuery,
  BroadcastPage,
  BroadcastPreview,
  CreateBroadcastPayload,
  CreateBroadcastResult,
} from '@/types/v15';

/** Rows per page of the broadcast history. */
export const BROADCAST_PAGE_SIZE = 20;

/**
 * Talim Admin notifications (v1.5 contract §2): a platform-level
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
   * @throws ApiError - `VALIDATION_FAILED` for an empty or malformed audience.
   */
  async preview(audience: BroadcastAudience): Promise<BroadcastPreview> {
    return api.post<BroadcastPreview>(API_ENDPOINTS.ADMIN_BROADCASTS_PREVIEW, { audience });
  },

  /**
   * Sends a broadcast now, or schedules it when `sendAt` is set.
   *
   * @param payload - Title (1..120), body (1..2000), attachments, target, audience, channels and `sendAt`.
   * @returns The new broadcast's id, `scheduled` or `sending`, and the recipient estimate.
   * @throws ApiError - `VALIDATION_FAILED` for a bad field (a `sendAt` in the past among them).
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
   * One broadcast with its stats.
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
   * @returns The server's answer; callers refetch.
   * @throws ApiError - `CONFLICT` (409) once it is no longer scheduled.
   */
  async cancel(id: string): Promise<unknown> {
    return api.post<unknown>(API_ENDPOINTS.ADMIN_BROADCAST_CANCEL(id));
  },
};
