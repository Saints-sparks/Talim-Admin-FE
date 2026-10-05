import { API_ENDPOINTS } from '../lib/api/config';
import { api } from '@/lib/apiClient';
import type { CreateNotificationPayload } from '@/types/apiPayloads';
import type { Schema } from '@/types/apiContract';

/** `NotificationPriority`, from `CreateNotificationDto` in the generated contract. */
export type Priority = NonNullable<CreateNotificationPayload['priority']>;

/**
 * `UserRole`, which is what `recipientRoles` is typed as, from the generated
 * contract. Note `admin` is the *platform* administrator; a school's own
 * administrator is `school_admin`.
 */
export type RecipientRole = NonNullable<CreateNotificationPayload['recipientRoles']>[number];

/** Delivery state of a notification, from `NotificationItemDto` in the generated contract. */
export type NotificationStatus = NonNullable<Schema<'NotificationItemDto'>['status']>;

/** `NotificationSource`, from the generated contract. */
export type NotificationSource = NonNullable<CreateNotificationPayload['source']>;

/** `NotificationDeliveryChannel`, from the generated contract. */
export type NotificationDeliveryChannel = NonNullable<
  CreateNotificationPayload['deliveryChannels']
>[number];

/** `NotificationCategory`, from the generated contract. */
export type NotificationCategory = NonNullable<CreateNotificationPayload['category']>;

/** The administrator who sent a notification, as the API populates them. */
export interface Sender {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  id?: string;
  userAvatar?: string;
}

/** A school reference on a notification. */
export interface School {
  _id: string;
  name: string;
}

/** Real delivery counters. Absent on notifications the queue has not reported on. */
export interface NotificationDeliveryStats {
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  deliveredRate: number;
  byRole?: Partial<Record<RecipientRole, number>>;
  byChannel?: {
    inApp?: number;
    email?: number;
    push?: number;
  };
  sentAt?: string | null;
  scheduledAt?: string | null;
  deliveredAt?: string | null;
}

/**
 * Body for `POST /notifications`. Exactly the fields `CreateNotificationDto`
 * declares — the API runs `forbidNonWhitelisted`, so one extra key is a 400.
 */
export type CreateNotificationRequest = CreateNotificationPayload;

/**
 * One notification as the API returns it. Stays hand-written: the contract's
 * `NotificationItemDto` types `readBy`/`targetSchools` as untyped records and
 * has no `deliveryStats`, which this screen reads when present.
 */
export interface NotificationResponse {
  _id: string;
  id?: string;
  title: string;
  message: string;
  attachments: string[];
  senderId?: Sender;
  senderName?: string;
  senderEmail?: string;
  recipientRoles: RecipientRole[];
  targetSchools: School[];
  status: NotificationStatus;
  priority: Priority;
  readBy: string[];
  isRead?: boolean;
  isScheduled?: boolean;
  scheduledFor?: string | null;
  deliveryChannels?: NotificationDeliveryChannel[];
  source?: NotificationSource;
  sourceLabel?: string;
  category?: NotificationCategory;
  type?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deliveryStats?: NotificationDeliveryStats;
}

/** Pagination envelope shared by every paginated list. */
export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

/** One page of notifications. */
export interface NotificationsResponse {
  data: NotificationResponse[];
  meta: PaginationMeta;
}

/** Platform-wide notification counters from `GET /notifications/stats/summary`. */
export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  pending: number;
  failed: number;
  scheduled: number;
  drafts: number;
  deliveryRate: number;
  bySource: Record<NotificationSource, number>;
  byChannel: Record<NotificationDeliveryChannel, number>;
  byCategory: Partial<Record<NotificationCategory, number>>;
}

/**
 * Query for `GET /notifications` and its stats sibling. Only what
 * `NotificationQueryDto` accepts: there is no school filter on either route.
 */
export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  source?: NotificationSource;
  category?: NotificationCategory;
  type?: string;
}

/**
 * Serialises defined params into a query string.
 *
 * @param params - The filter values.
 * @returns The query string including `?`, or an empty string.
 */
const buildQuery = (params: GetNotificationsParams = {}): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const notificationService = {
  /**
   * Sends (or schedules) a platform notification.
   *
   * @param data - Exactly the fields `CreateNotificationDto` declares.
   * @returns The created notification.
   * @throws ApiError - `VALIDATION_FAILED` with per-field details.
   */
  createNotification: async (data: CreateNotificationRequest): Promise<NotificationResponse> =>
    api.post<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS, data),

  /**
   * One page of notifications.
   *
   * @param params - Page, size and optional source/category/school filters.
   * @returns The page and its pagination meta.
   * @throws ApiError - On any non-2xx response.
   */
  getAllNotifications: async (
    params: GetNotificationsParams = {},
  ): Promise<NotificationsResponse> =>
    api.get<NotificationsResponse>(
      `${API_ENDPOINTS.NOTIFICATIONS}${buildQuery({ page: 1, limit: 20, ...params })}`,
    ),

  /**
   * One notification with its delivery statistics.
   *
   * @param id - The notification id.
   * @returns The notification.
   * @throws ApiError - `NOT_FOUND` when it does not exist.
   */
  getNotificationById: async (id: string): Promise<NotificationResponse> =>
    api.get<NotificationResponse>(API_ENDPOINTS.NOTIFICATION_BY_ID(id)),

  /**
   * Platform-wide delivery counters for the dashboard tiles.
   *
   * @param params - Optional source/category/school filters.
   * @returns The summary counters.
   * @throws ApiError - On any non-2xx response.
   */
  getNotificationStats: async (
    params: Omit<GetNotificationsParams, 'page' | 'limit'> = {},
  ): Promise<NotificationStats> =>
    api.get<NotificationStats>(
      `${API_ENDPOINTS.NOTIFICATIONS}/stats/summary${buildQuery(params)}`,
    ),

  /**
   * Marks a notification read for one user.
   *
   * @param id - The notification id.
   * @param userId - The reader.
   * @returns The updated notification.
   * @throws ApiError - On any non-2xx response.
   */
  markAsRead: async (id: string, userId: string): Promise<NotificationResponse> =>
    api.put<NotificationResponse>(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, { userId }),
};
