import { API_BASE_URL } from '@/app/lib/api/config';
import { ApiError } from './apiError';
import { sessionStore } from './session';

/** Request options accepted by the client (a superset of `fetch`'s). */
export interface RequestConfig extends RequestInit {
  /** Abort after this many milliseconds. Default 30 000. */
  timeoutMs?: number;
  /**
   * Send without the bearer token and never attempt a token refresh. Use for
   * public auth calls (admin-login, refresh): a 401 there means "wrong
   * credentials", not "session expired".
   */
  skipAuth?: boolean;
  /** Internal: set once a request has been retried after a token refresh. */
  _retry?: boolean;
}

/** Fired on `window` when the session is gone and the user must sign in again. */
export const AUTH_SESSION_EXPIRED_EVENT = 'auth-session-expired';

type ErrorListener = (error: ApiError) => void;

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * The single HTTP client for the Talim Admin portal.
 *
 * - Prefixes relative paths with `API_BASE_URL` and attaches the bearer token
 *   held in {@link sessionStore} (memory only — never a readable cookie).
 * - Refreshes the token once on 401 (queueing concurrent requests) against the
 *   httpOnly `refreshToken` cookie, then signs the user out if that fails.
 * - Reports offline / unreachable / timed-out requests as `ApiError`s with
 *   stable codes, so pages never see a raw `TypeError`.
 */
class ApiClient {
  private refreshCallback: (() => Promise<boolean>) | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string | null) => void;
    reject: (error?: unknown) => void;
  }> = [];
  private errorListeners = new Set<ErrorListener>();

  /**
   * Registers the function that obtains a fresh token, provided by
   * `AuthContext` so the client never has to know the auth endpoints.
   *
   * @param callback - Resolves `true` when a new token reached the session store.
   */
  setRefreshCallback(callback: () => Promise<boolean>): void {
    this.refreshCallback = callback;
  }

  /**
   * Subscribes to every `ApiError` the client produces, for global toasts and
   * connectivity banners.
   *
   * @param listener - Called with each error.
   * @returns An unsubscribe function.
   */
  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  private emitError(error: ApiError): void {
    for (const listener of this.errorListeners) {
      try {
        listener(error);
      } catch {
        /* a listener must never break a request */
      }
    }
  }

  private processQueue(error: unknown, token: string | null = null): void {
    for (const { resolve, reject } of this.failedQueue) {
      if (error) reject(error);
      else resolve(token);
    }
    this.failedQueue = [];
  }

  private async handleRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise<string | null>((resolve, reject) =>
        this.failedQueue.push({ resolve, reject }),
      );
    }
    this.isRefreshing = true;
    try {
      if (!this.refreshCallback) throw new Error('No refresh callback set');
      const success = await this.refreshCallback();
      if (!success) throw new Error('Refresh failed');
      const token = sessionStore.getToken();
      this.processQueue(null, token);
      return token;
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint;
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  private withAuth(config: RequestConfig): RequestConfig {
    const next: RequestConfig = { ...config, credentials: 'include' };
    if (next.skipAuth) return next;
    const token = sessionStore.getToken();
    if (token) {
      next.headers = {
        Authorization: `Bearer ${token}`,
        ...(next.headers as Record<string, string> | undefined),
      };
    }
    return next;
  }

  /**
   * Performs `fetch` with a timeout and connectivity handling.
   *
   * @param url - The absolute URL to call.
   * @param config - Fetch options plus `timeoutMs`.
   * @returns The response of any status; throws `ApiError` when the request
   *   never completed.
   */
  private async doFetch(url: string, config: RequestConfig): Promise<Response> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const error = ApiError.offline();
      this.emitError(error);
      throw error;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    const upstream = config.signal;
    if (upstream) upstream.addEventListener('abort', () => controller.abort(), { once: true });

    try {
      return await fetch(url, { ...config, signal: controller.signal });
    } catch (err) {
      let error: ApiError;
      if ((err as Error)?.name === 'AbortError') {
        if (upstream?.aborted) throw err;
        error = ApiError.timeout();
      } else if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        error = ApiError.offline();
      } else {
        error = ApiError.unreachable();
      }
      this.emitError(error);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Low-level request returning the raw `Response` for any status, refreshing
   * the access token once on a 401.
   *
   * @param url - Absolute URL, or a path relative to `API_BASE_URL`.
   * @param config - Fetch options plus `timeoutMs` and `skipAuth`.
   * @returns The response.
   */
  async request(url: string, config: RequestConfig = {}): Promise<Response> {
    const fullUrl = this.buildUrl(url);
    let response = await this.doFetch(fullUrl, this.withAuth(config));

    if (response.status === 401 && !config._retry && !config.skipAuth) {
      try {
        await this.handleRefresh();
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
        }
        throw refreshError;
      }
      response = await this.doFetch(fullUrl, this.withAuth({ ...config, _retry: true }));
    }

    return response;
  }

  /**
   * Performs a request and parses the JSON body, unwrapping the canonical
   * `{ success, data }` envelope when the server sends one. Any non-2xx status
   * becomes an `ApiError` carrying the server's `error.code` and details.
   *
   * @typeParam T - Shape of the successful payload.
   * @param url - Absolute URL, or a path relative to `API_BASE_URL`.
   * @param config - Fetch options.
   * @returns The parsed payload.
   */
  async json<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.request(url, config);
    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
    }

    if (!response.ok) {
      const error = ApiError.fromResponse(
        response,
        body as Parameters<typeof ApiError.fromResponse>[1],
      );
      this.emitError(error);
      throw error;
    }

    return unwrapEnvelope<T>(body);
  }

  /**
   * Builds a JSON (or `FormData`) request config for a body-carrying method.
   *
   * @param method - The HTTP method.
   * @param data - The payload; `FormData` is sent as-is.
   * @param config - Extra fetch options.
   * @returns The merged config.
   */
  bodyConfig(method: string, data: unknown, config: RequestConfig): RequestConfig {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return {
      ...config,
      method,
      headers: isFormData
        ? config.headers
        : {
            'Content-Type': 'application/json',
            ...(config.headers as Record<string, string> | undefined),
          },
      body: data === undefined ? undefined : isFormData ? (data as FormData) : JSON.stringify(data),
    };
  }
}

/**
 * Unwraps the canonical `{ success, data }` envelope. Endpoints that predate it
 * return their payload directly, so anything without `success` passes through.
 *
 * @typeParam T - Shape of the payload.
 * @param body - The parsed response body.
 * @returns The payload.
 */
export function unwrapEnvelope<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

/** Singleton client. Import this everywhere; never call `fetch` directly. */
export const apiClient = new ApiClient();

/**
 * Typed facade over the client: every method parses the JSON body, unwraps the
 * envelope and throws `ApiError` on any non-2xx, offline or timed-out request.
 *
 * @example
 * const schools = await api.get<SchoolsResponse>("/schools/search?page=1");
 */
export const api = {
  /**
   * Performs a `GET`.
   *
   * @param url - Path or absolute URL.
   * @param config - Extra fetch options.
   * @returns The parsed payload.
   */
  get: <T = unknown>(url: string, config: RequestConfig = {}) =>
    apiClient.json<T>(url, { ...config, method: 'GET' }),
  /**
   * Performs a `POST`.
   *
   * @param url - Path or absolute URL.
   * @param data - The request payload.
   * @param config - Extra fetch options.
   * @returns The parsed payload.
   */
  post: <T = unknown>(url: string, data?: unknown, config: RequestConfig = {}) =>
    apiClient.json<T>(url, apiClient.bodyConfig('POST', data, config)),
  /**
   * Performs a `PUT`.
   *
   * @param url - Path or absolute URL.
   * @param data - The request payload.
   * @param config - Extra fetch options.
   * @returns The parsed payload.
   */
  put: <T = unknown>(url: string, data?: unknown, config: RequestConfig = {}) =>
    apiClient.json<T>(url, apiClient.bodyConfig('PUT', data, config)),
  /**
   * Performs a `PATCH`.
   *
   * @param url - Path or absolute URL.
   * @param data - The request payload.
   * @param config - Extra fetch options.
   * @returns The parsed payload.
   */
  patch: <T = unknown>(url: string, data?: unknown, config: RequestConfig = {}) =>
    apiClient.json<T>(url, apiClient.bodyConfig('PATCH', data, config)),
  /**
   * Performs a `DELETE`.
   *
   * @param url - Path or absolute URL.
   * @param config - Extra fetch options.
   * @returns The parsed payload.
   */
  delete: <T = unknown>(url: string, config: RequestConfig = {}) =>
    apiClient.json<T>(url, { ...config, method: 'DELETE' }),
};
