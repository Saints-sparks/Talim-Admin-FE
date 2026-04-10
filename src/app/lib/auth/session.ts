import nookies from 'nookies';
import { User } from '@/app/types/auth';
import { decodeJwtPayload } from './jwt';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const USER_STORAGE_KEY = 'talim_admin_user';

const defaultCookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export const getAccessToken = (): string | null => {
  const cookies = nookies.get(null);
  return cookies[ACCESS_TOKEN_COOKIE] || null;
};

export const setAccessToken = (token: string): void => {
  const payload = decodeJwtPayload(token);
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const maxAge = payload?.exp ? Math.max(payload.exp - nowInSeconds, 0) : 60 * 60;

  nookies.set(null, ACCESS_TOKEN_COOKIE, token, {
    ...defaultCookieOptions,
    maxAge,
  });
};

export const clearAccessToken = (): void => {
  nookies.destroy(null, ACCESS_TOKEN_COOKIE, {
    path: '/',
  });
};

export const setStoredUser = (user: User): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const serialized = localStorage.getItem(USER_STORAGE_KEY);
  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized) as User;
  } catch {
    return null;
  }
};

export const clearStoredUser = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(USER_STORAGE_KEY);
};

export const clearAuthSession = (): void => {
  clearAccessToken();
  clearStoredUser();
};

