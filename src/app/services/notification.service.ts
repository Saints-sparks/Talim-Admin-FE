import { API_BASE_URL } from '../lib/api/config';

export type Priority = 'low' | 'medium' | 'high';
export type RecipientRole = 'student' | 'teacher' | 'parent' | 'admin';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Sender {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  id: string;
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
  recipientRoles: RecipientRole[];
  targetSchools: string[];
  senderId: string;
  priority: Priority;
}

export interface NotificationResponse {
  _id: string;
  title: string;
  message: string;
  attachments: string[];
  senderId: Sender;
  recipientRoles: RecipientRole[];
  targetSchools: School[];
  status: NotificationStatus;
  priority: Priority;
  readBy: string[];
  isScheduled: boolean;
  scheduledFor: string | null;
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

export const notificationService = {
  createNotification: async (data: CreateNotificationRequest): Promise<NotificationResponse> => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create notification');
    }

    return response.json();
  },

  getAllNotifications: async (page: number = 1, limit: number = 10): Promise<NotificationsResponse> => {
    const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch notifications');
    }

    return response.json();
  },
}; 