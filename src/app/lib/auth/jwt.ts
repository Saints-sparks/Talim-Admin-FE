import { JwtPayload } from '@/app/types/auth';

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return decodeURIComponent(
      Array.from(window.atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
  }

  return Buffer.from(padded, 'base64').toString('utf-8');
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string, skewSeconds = 10): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds + skewSeconds;
};

