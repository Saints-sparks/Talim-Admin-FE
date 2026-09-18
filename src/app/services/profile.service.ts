import { API_ENDPOINTS } from '@/app/lib/api/config';
import { api } from '@/lib/apiClient';
import type { SessionUser } from '@/lib/session';

/** Body for `PUT /auth/profile/update/`. Mirrors `UpdateProfileDto`. */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/** Response of `PUT /auth/profile/avatar`. */
export interface UpdateAvatarResponse {
  message: string;
  userAvatar: string;
  user: Partial<SessionUser>;
}

export const profileService = {
  /**
   * Updates the signed-in administrator's own profile.
   *
   * @param payload - Only the fields the DTO declares; the API runs
   *   `forbidNonWhitelisted`, so one extra key is a 400.
   * @returns The updated user.
   * @throws ApiError - `VALIDATION_FAILED` with per-field details.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<SessionUser> {
    return api.put<SessionUser>(API_ENDPOINTS.PROFILE_UPDATE, payload);
  },

  /**
   * Replaces the signed-in administrator's avatar.
   *
   * @param file - The image to upload.
   * @returns The new avatar URL and the patched user.
   * @throws ApiError - `PAYLOAD_TOO_LARGE` when the file exceeds the limit.
   */
  async uploadAvatar(file: File): Promise<UpdateAvatarResponse> {
    const form = new FormData();
    form.append('avatar', file);
    return api.put<UpdateAvatarResponse>(API_ENDPOINTS.PROFILE_AVATAR, form);
  },

  /**
   * Clears the signed-in administrator's avatar.
   *
   * @returns The patched user.
   * @throws ApiError - On any non-2xx response.
   */
  async removeAvatar(): Promise<UpdateAvatarResponse> {
    return api.put<UpdateAvatarResponse>(API_ENDPOINTS.PROFILE_AVATAR, { avatarUrl: '' });
  },
};
