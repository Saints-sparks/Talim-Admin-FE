import { API_ENDPOINTS } from '@/app/lib/api/config';
import { apiRequest } from '@/app/lib/api/client';
import { clearAuthSession, setAccessToken } from '@/app/lib/auth/session';
import { decodeJwtPayload } from '@/app/lib/auth/jwt';
import {
  AuthResponse,
  IntrospectResponse,
  LoginCredentials,
  User,
} from '@/app/types/auth';

const getDeviceToken = (): string => {
  if (typeof window === 'undefined') {
    return 'talim-admin-web';
  }

  const existingToken = localStorage.getItem('talim_device_token');
  if (existingToken) {
    return existingToken;
  }

  const token = `talim-admin-${crypto.randomUUID()}`;
  localStorage.setItem('talim_device_token', token);
  return token;
};

const getFallbackUserFromToken = (token: string): User | null => {
  const payload = decodeJwtPayload(token);
  if (!payload?.sub || !payload.email || !payload.role) {
    return null;
  }

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    schoolId: payload.schoolId ?? undefined,
  };
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ accessToken: string; user: User }> {
    const response = await apiRequest<AuthResponse>(API_ENDPOINTS.ADMIN_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...credentials,
        deviceToken: credentials.deviceToken || getDeviceToken(),
        platform: credentials.platform || 'admin-web',
      }),
      skipAuth: true,
    });

    setAccessToken(response.access_token);

    const introspectResponse = await apiRequest<IntrospectResponse>(
      API_ENDPOINTS.INTROSPECT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.access_token }),
        skipAuth: true,
      },
    );

    const user = introspectResponse.user || getFallbackUserFromToken(response.access_token);
    if (!user) {
      throw new Error('Unable to resolve user profile after login');
    }

    return {
      accessToken: response.access_token,
      user,
    };
  },

  async introspect(accessToken: string): Promise<User | null> {
    try {
      const response = await apiRequest<IntrospectResponse>(API_ENDPOINTS.INTROSPECT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: accessToken }),
        skipAuth: true,
      });

      return response.user;
    } catch {
      return getFallbackUserFromToken(accessToken);
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<{ message: string }>(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch {
      // Swallow logout API errors and clear local session anyway.
    } finally {
      clearAuthSession();
    }
  },
};

