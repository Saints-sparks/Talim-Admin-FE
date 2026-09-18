import { api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/app/lib/api/config';

/** One entry from `GET /auth/activity-logs`. */
export interface ActivityLog {
  _id: string;
  userId: string;
  action: string;
  platform: string;
  deviceToken?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/** One page of activity logs. */
export interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

export const activityService = {
  /**
   * The signed-in administrator's own recent account activity.
   *
   * @param limit - How many entries to fetch.
   * @returns The logs and the total recorded.
   * @throws ApiError - On any non-2xx response.
   */
  async getMyActivity(limit = 15): Promise<ActivityLogsResponse> {
    return api.get<ActivityLogsResponse>(`${API_ENDPOINTS.ACTIVITY_LOGS}?limit=${limit}`);
  },
};
