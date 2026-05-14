import { API_ENDPOINTS } from '../lib/api/config';
import { apiRequest } from '../lib/api/client';

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
}

const buildQuery = (params: GetNotificationsParams = {}) => {
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
  createNotification: async (
    data: CreateNotificationRequest,
  ): Promise<NotificationResponse> => {
    return apiRequest<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  getAllNotifications: async (
    params: GetNotificationsParams = {},
  ): Promise<NotificationsResponse> => {
    return apiRequest<NotificationsResponse>(
      `${API_ENDPOINTS.NOTIFICATIONS}${buildQuery({
        page: 1,
        limit: 10,
        ...params,
      })}`,
    );
  },

  getNotificationStats: async (
    params: Omit<GetNotificationsParams, 'page' | 'limit'> = {},
  ): Promise<NotificationStats> => {
    return apiRequest<NotificationStats>(
      `${API_ENDPOINTS.NOTIFICATIONS}/stats/summary${buildQuery(params)}`,
    );
  },

  markAsRead: async (
    id: string,
    userId: string,
  ): Promise<NotificationResponse> => {
    return apiRequest<NotificationResponse>(
      `${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      },
    );
  },
};
