import { apiRequest } from '@/app/lib/api/client';
import { API_ENDPOINTS } from '@/app/lib/api/config';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface PopulatedUser {
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  schoolId?: { _id: string; name: string; email: string; location?: { state?: string; city?: string } } | string;
}

export interface Complaint {
  _id: string;
  ticket: string;
  userId: PopulatedUser;
  subject: string;
  description: string;
  schoolId?: { _id: string; name: string; email: string; location?: { state?: string; city?: string } } | string;
  attachment?: string;
  status: ComplaintStatus;
  assignedAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export const supportService = {
  async getAllComplaints(): Promise<Complaint[]> {
    return apiRequest<Complaint[]>(API_ENDPOINTS.COMPLAINTS);
  },

  async getComplaint(id: string): Promise<Complaint> {
    return apiRequest<Complaint>(API_ENDPOINTS.COMPLAINT_BY_ID(id));
  },

  async updateStatus(id: string, status: ComplaintStatus): Promise<Complaint> {
    return apiRequest<Complaint>(API_ENDPOINTS.COMPLAINT_STATUS(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  async deleteComplaint(id: string): Promise<void> {
    await apiRequest<void>(API_ENDPOINTS.COMPLAINT_BY_ID(id), { method: 'DELETE' });
  },
};
