import { api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/app/lib/api/config';
import type { UpdateComplaintStatusPayload } from '@/types/apiPayloads';

/**
 * Mirrors `ComplaintStatus` in
 * `talimBE-V2/src/modules/complaints/data/enums/complaint-status.enum.ts`.
 */
export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

/** Every value `PATCH /complaints/:id/status` accepts, in workflow order. */
export const COMPLAINT_STATUSES: readonly ComplaintStatus[] = [
  'Pending',
  'In Progress',
  'Resolved',
] as const;

/** A school reference as the API populates it on a complaint. */
export interface ComplaintSchool {
  _id: string;
  name: string;
  email: string;
  location?: { state?: string; city?: string };
}

/** The complaint author, as the API populates them. */
export interface PopulatedUser {
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  schoolId?: ComplaintSchool | string;
}

/** One support ticket. Mirrors the `Complaint` schema. */
export interface Complaint {
  _id: string;
  ticket: string;
  userId: PopulatedUser;
  subject: string;
  description: string;
  schoolId?: ComplaintSchool | string;
  attachment?: string;
  status: ComplaintStatus;
  /**
   * Declared on the backend schema but never written by any endpoint — there is
   * no assign route today, so this is always absent. See the T4.17 note in the
   * support screen.
   */
  assignedAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export const supportService = {
  /**
   * Every complaint on the platform. `GET /complaints` is decorated
   * `@Roles(UserRole.ADMIN)`, so only a platform administrator may call it.
   *
   * @returns All complaints, newest first as the API orders them.
   * @throws ApiError - On any non-2xx response.
   */
  async getAllComplaints(): Promise<Complaint[]> {
    return api.get<Complaint[]>(API_ENDPOINTS.COMPLAINTS);
  },

  /**
   * One complaint by id or ticket number.
   *
   * @param id - The complaint id or its ticket number.
   * @returns The complaint.
   * @throws ApiError - `NOT_FOUND` when no such ticket exists.
   */
  async getComplaint(id: string): Promise<Complaint> {
    return api.get<Complaint>(API_ENDPOINTS.COMPLAINT_BY_ID(id));
  },

  /**
   * Moves a complaint through the workflow via `PATCH /complaints/:id/status`.
   * The DTO declares `status` and nothing else, and the API runs
   * `forbidNonWhitelisted`, so no other field may be sent.
   *
   * @param id - The complaint id.
   * @param status - The new status.
   * @returns The updated complaint.
   * @throws ApiError - `VALIDATION_FAILED` for a status outside the enum.
   */
  async updateStatus(id: string, status: ComplaintStatus): Promise<Complaint> {
    return api.patch<Complaint>(API_ENDPOINTS.COMPLAINT_STATUS(id), { status } satisfies UpdateComplaintStatusPayload);
  },

  /**
   * Deletes a complaint.
   *
   * @param id - The complaint id.
   * @throws ApiError - On any non-2xx response.
   */
  async deleteComplaint(id: string): Promise<void> {
    await api.delete<void>(API_ENDPOINTS.COMPLAINT_BY_ID(id));
  },
};
