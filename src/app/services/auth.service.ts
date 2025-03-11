import { API_BASE_URL } from '../lib/api/config';
import nookies from 'nookies';

export interface LoginCredentials {
  email: string;
  password: string;
  deviceToken?: string;
  platform?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId: string | null;
  phoneNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface TokenIntrospectResponse {
  active: boolean;
  exp: number;
  iat: number;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...credentials,
        deviceToken: credentials.deviceToken || 'web',
        platform: credentials.platform || 'web',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    return response.json();
  },

  introspectToken: async (token: string): Promise<TokenIntrospectResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/introspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate token');
    }

    return response.json();
  },

  async logout() {
    const cookies = nookies.get(null);
    const accessToken = cookies.access_token;

    if (!accessToken) {
      throw new Error('No access token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear cookies
      nookies.destroy(null, 'access_token');
      nookies.destroy(null, 'refresh_token');
      
      // Clear localStorage
      localStorage.removeItem('user');

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
}; 