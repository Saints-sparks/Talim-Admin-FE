import { API_ENDPOINTS } from '../lib/api/config';
import { api } from '@/lib/apiClient';

export type Priority = 'low' | 'medium' | 'high';
export type RecipientRole = 'student' | 'teacher' | 'parent' | 'admin';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type NotificationSource = 'school' | 'talim' | 'system';
export type NotificationDeliveryChannel = 'inApp' | 'email' | 'push';
export type NotificationCategory =
  | 'announcement'
  | 'attendance'
  | 'academics'
  | 'grading'
  | 'resources'
  | 'messages'
  | 'account'
  | 'other';

export interface Sender {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  id?: string;
  userAvatar?: string;
}

export interface School {
  _id: string;
  name: string;
}

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

export interface CreateNotificationRequest {
  title: string;
  message: string;
  attachments?: string[];
  recipientRoles?: RecipientRole[];
  targetSchools?: string[];
  senderId: string;
  priority: Priority;
  type?: string;
  source?: NotificationSource;
  category?: NotificationCategory;
  metadata?: Record<string, unknown>;
  recipientId?: string;
  deliveryChannels?: NotificationDeliveryChannel[];
}

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
  source?: NotificationSource;
  sourceLabel?: string;
  category?: NotificationCategory;
  type?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deliveryStats?: NotificationDeliveryStats;
}

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

export interface NotificationsResponse {
  data: NotificationResponse[];
  meta: PaginationMeta;
}

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

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  source?: NotificationSource;
  category?: NotificationCategory;
  type?: string;
  schoolId?: string;
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
   * Re-delivers a notification to the recipients it previously failed for.
   *
   * @param id - The notification id.
   * @returns The notification with refreshed delivery statistics.
   * @throws ApiError - `INVALID_STATE_TRANSITION` when nothing failed.
   */
  resendNotification: async (id: string): Promise<NotificationResponse> =>
    api.post<NotificationResponse>(API_ENDPOINTS.NOTIFICATION_RESEND(id)),

  /**
   * Copies a notification into a new draft owned by `senderId`.
   *
   * @param id - The notification to copy.
   * @param senderId - The administrator the copy belongs to.
   * @returns The new draft.
   * @throws ApiError - On any non-2xx response.
   */
  duplicateNotification: async (id: string, senderId: string): Promise<NotificationResponse> =>
    api.post<NotificationResponse>(API_ENDPOINTS.NOTIFICATION_DUPLICATE(id), { senderId }),

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
