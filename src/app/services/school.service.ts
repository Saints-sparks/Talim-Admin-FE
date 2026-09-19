import { api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/app/lib/api/config';
import type {
  CreateSchoolPayload,
  UpdateSchoolPayload,
  UpdateSchoolStatusPayload,
} from '@/types/apiPayloads';

/** A named contact on a school record. Mirrors `PrimaryContactDto`. */
export interface PrimaryContact {
  name: string;
  phone: string;
  email: string;
  role: string;
}

/** A school as the platform console reads it. */
export interface School {
  _id: string;
  name: string;
  email: string;
  physicalAddress: string;
  location: {
    country: string;
    state: string;
  };
  schoolPrefix: string;
  active: boolean;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  primaryContacts: PrimaryContact[];
}

/** Result of `DELETE /schools/delete/:id`. */
export interface SchoolDeletionResult {
  school: School;
  summary: {
    adminsDeleted: number;
    usersDeactivated: number;
    message: string;
  };
}

/** One page of schools, as `PaginatedResponse<School>` is serialised. */
export interface SchoolsResponse {
  data: School[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

/**
 * Body for `POST /schools/create`: the backend `CreateSchoolDto`, generated into
 * `src/types/apiPayloads.ts`. The API runs `forbidNonWhitelisted`, so one extra
 * key is a 400.
 */
export type CreateSchoolData = CreateSchoolPayload;

/**
 * Body for `PUT /schools/update/:id`: the create body without the prefix (and
 * the optional slug), which the form never edits. It is checked against
 * `UpdateSchoolDto` where it is sent.
 */
export type UpdateSchoolData = Omit<CreateSchoolPayload, 'schoolPrefix' | 'slug'>;

/** What `POST /schools/create` returns: the school and the admins it provisioned. */
export interface CreateSchoolResult {
  school: School;
  admins: Array<{ name: string; email: string; role: string }>;
}

export const schoolService = {
  /**
   * One page of schools, optionally narrowed by a search term.
   *
   * @param page - 1-based page number.
   * @param limit - Page size.
   * @param query - Free-text match on name, email or prefix.
   * @returns The page and its pagination meta.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async getAllSchools(page = 1, limit = 10, query?: string): Promise<SchoolsResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (query) params.append('query', query);
    return api.get<SchoolsResponse>(`${API_ENDPOINTS.SCHOOLS_SEARCH}?${params.toString()}`);
  },

  /**
   * One school by id.
   *
   * @param schoolId - The school id.
   * @returns The school.
   * @throws ApiError - `NOT_FOUND` when no such school exists.
   */
  async getSchool(schoolId: string): Promise<School> {
    return api.get<School>(API_ENDPOINTS.SCHOOL_BY_ID(schoolId));
  },

  /**
   * Registers a school and provisions its administrator accounts.
   *
   * @param data - Exactly the fields `CreateSchoolDto` declares.
   * @returns The new school and the admins created for it.
   * @throws ApiError - `CONFLICT` when the name, email or prefix is taken.
   */
  async createSchool(data: CreateSchoolData): Promise<CreateSchoolResult> {
    return api.post<CreateSchoolResult>(API_ENDPOINTS.SCHOOL_CREATE, data);
  },

  /**
   * Updates a school's details.
   *
   * @param schoolId - The school to update.
   * @param data - Exactly the fields `UpdateSchoolDto` declares.
   * @returns The updated school.
   * @throws ApiError - `VALIDATION_FAILED` with per-field details.
   */
  async updateSchool(schoolId: string, data: UpdateSchoolData): Promise<School> {
    return api.put<School>(API_ENDPOINTS.SCHOOL_UPDATE(schoolId), data satisfies UpdateSchoolPayload);
  },

  /**
   * Activates or suspends a school.
   *
   * @param schoolId - The school to change.
   * @param active - True to activate, false to suspend.
   * @returns The updated school.
   * @throws ApiError - On any non-2xx response.
   */
  async updateSchoolStatus(schoolId: string, active: boolean): Promise<School> {
    return api.patch<School>(API_ENDPOINTS.SCHOOL_STATUS(schoolId), { active } satisfies UpdateSchoolStatusPayload);
  },

  /**
   * Soft-deletes a school, removing its admins and deactivating its users.
   *
   * @param schoolId - The school to delete.
   * @returns The deleted school and a summary of what else changed.
   * @throws ApiError - On any non-2xx response.
   */
  async deleteSchool(schoolId: string): Promise<SchoolDeletionResult> {
    return api.delete<SchoolDeletionResult>(API_ENDPOINTS.SCHOOL_DELETE(schoolId));
  },

  /**
   * Restores a soft-deleted school.
   *
   * @param schoolId - The school to restore.
   * @returns The restored school.
   * @throws ApiError - `NOT_FOUND` when the school was never deleted.
   */
  async restoreSchool(schoolId: string): Promise<School> {
    return api.patch<School>(API_ENDPOINTS.SCHOOL_RESTORE(schoolId));
  },
};
