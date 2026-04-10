import { API_ENDPOINTS } from '@/app/lib/api/config';
import { apiRequest } from '@/app/lib/api/client';
import { User } from '@/app/types/auth';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface UpdateAvatarResponse {
  message: string;
  userAvatar: string;
  user: Partial<User>;
}

export const profileService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return apiRequest<User>(API_ENDPOINTS.PROFILE_UPDATE, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async uploadAvatar(file: File): Promise<UpdateAvatarResponse> {
    const form = new FormData();
    form.append('avatar', file);
    return apiRequest<UpdateAvatarResponse>(API_ENDPOINTS.PROFILE_AVATAR, {
      method: 'PUT',
      body: form,
    });
  },

  async removeAvatar(): Promise<UpdateAvatarResponse> {
    return apiRequest<UpdateAvatarResponse>(API_ENDPOINTS.PROFILE_AVATAR, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl: '' }),
    });
  },
};
