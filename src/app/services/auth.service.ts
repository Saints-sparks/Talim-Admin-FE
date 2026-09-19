import { API_ENDPOINTS } from '@/app/lib/api/config';
import { api } from '@/lib/apiClient';
import type { AdminLoginPayload, IntrospectPayload } from '@/types/apiPayloads';
import type { SessionUser } from '@/lib/session';
import { AuthResponse, IntrospectResponse, LoginCredentials } from '@/app/types/auth';

/**
 * A stable per-browser device identifier, so the backend can list and revoke
 * sessions. It is not a credential and carries no session state.
 *
 * @returns The device token.
 */
function getDeviceToken(): string {
  if (typeof window === 'undefined') return 'talim-admin-web';

  const existing = localStorage.getItem('talim_device_token');
  if (existing) return existing;

  const token = `talim-admin-${crypto.randomUUID()}`;
  localStorage.setItem('talim_device_token', token);
  return token;
}

export const authService = {
  /**
   * Signs a platform administrator in through `POST /auth/admin-login`, which
   * refuses any account whose role is not `admin`. The backend sets the
   * httpOnly `refreshToken` cookie; the access token comes back in the body and
   * is held in memory only.
   *
   * @param credentials - Email and password.
   * @returns The access token and the introspected user.
   * @throws ApiError - 401 for bad credentials, 403 when the account is not a
   *   platform administrator.
   */
  async login(credentials: LoginCredentials): Promise<{ accessToken: string; user: SessionUser }> {
    const body: AdminLoginPayload = {
      email: credentials.email,
      password: credentials.password,
      deviceToken: credentials.deviceToken || getDeviceToken(),
      platform: credentials.platform || 'admin-web',
    };
    const response = await api.post<AuthResponse>(API_ENDPOINTS.ADMIN_LOGIN, body, { skipAuth: true });

    const user = await this.introspect(response.access_token);
    if (!user) throw new Error('Unable to resolve the administrator profile after sign-in.');

    return { accessToken: response.access_token, user };
  },

  /**
   * Exchanges the httpOnly refresh cookie for a new access token. Returns
   * `null` when there is no valid session, which is the normal cold-start case.
   *
   * @returns The new access token, or `null`.
   */
  async refresh(): Promise<string | null> {
    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.REFRESH_TOKEN,
        undefined,
        { skipAuth: true },
      );
      return response.access_token ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Resolves the user behind an access token. This is the only source of the
   * signed-in identity — nothing in the app decodes the token itself.
   *
   * @param accessToken - The token to introspect.
   * @returns The user, or `null` when the token is not valid.
   */
  async introspect(accessToken: string): Promise<SessionUser | null> {
    try {
      const response = await api.post<IntrospectResponse>(
        API_ENDPOINTS.INTROSPECT,
        { token: accessToken } satisfies IntrospectPayload,
        { skipAuth: true },
      );
      return response.active === false ? null : (response.user ?? null);
    } catch {
      return null;
    }
  },

  /**
   * Revokes the refresh token and clears the server-side cookie. Never throws:
   * the local session is cleared by the caller either way.
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch {
      /* the local session is cleared regardless */
    }
  },
};
