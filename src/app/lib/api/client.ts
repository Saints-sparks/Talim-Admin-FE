import { API_ENDPOINTS } from './config';
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from '@/app/lib/auth/session';
import { emitAuthSessionExpired } from '@/app/lib/auth/events';

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiErrorPayload {
  message?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshRequest: Promise<string | null> | null = null;

const toError = async (response: Response): Promise<ApiError> => {
  let payload: ApiErrorPayload | null = null;

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  return new ApiError(
    response.status,
    payload?.message || `Request failed with status ${response.status}`,
  );
};

const mergeHeaders = (
  initHeaders: HeadersInit | undefined,
  token: string | null,
): Headers => {
  const headers = new Headers(initHeaders);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = (async () => {
    try {
      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw await toError(response);
      }

      const payload = (await response.json()) as { access_token: string };
      setAccessToken(payload.access_token);
      return payload.access_token;
    } catch {
      clearAuthSession();
      emitAuthSessionExpired();
      return null;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
};

export const apiRequest = async <T>(
  input: string,
  options: ApiRequestOptions = {},
  hasRetried = false,
): Promise<T> => {
  const { skipAuth = false, ...requestInit } = options;
  const accessToken = skipAuth ? null : getAccessToken();
  const headers = mergeHeaders(requestInit.headers, accessToken);

  const response = await fetch(input, {
    ...requestInit,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !skipAuth && !hasRetried) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      return apiRequest<T>(
        input,
        {
          ...requestInit,
          headers: mergeHeaders(requestInit.headers, refreshedToken),
        },
        true,
      );
    }
  }

  if (!response.ok) {
    throw await toError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

