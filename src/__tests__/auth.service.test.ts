import { authService } from '@/app/services/auth.service';
import { ApiError } from '@/lib/apiError';
import { sessionStore } from '@/lib/session';

const fetchMock = jest.fn();

/**
 * A JSON response for the mocked fetch.
 *
 * @param body - The response body.
 * @param status - The HTTP status.
 * @returns The response.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * The `X-Talim-App` header and URL of every mocked fetch call so far.
 *
 * @returns One `{ url, app }` per call.
 */
function sentApps(): Array<{ url: string; app: string | undefined }> {
  return fetchMock.mock.calls.map(([url, init]: [string, RequestInit]) => ({
    url,
    app: (init.headers as Record<string, string> | undefined)?.['X-Talim-App'],
  }));
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  sessionStore.clear();
});

describe('authService sends X-Talim-App: platform-admin on every auth call', () => {
  it('on admin-login and the introspect that follows it', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { access_token: 'tok' } }))
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { active: true, user: { userId: 'u1', email: 'a@talim.test', role: 'admin' } },
        }),
      );

    await expect(
      authService.login({ email: 'a@talim.test', password: 'pw', deviceToken: 'dev' }),
    ).resolves.toMatchObject({ accessToken: 'tok', user: { role: 'admin' } });

    expect(sentApps()).toEqual([
      { url: 'http://api.test/auth/admin-login', app: 'platform-admin' },
      { url: 'http://api.test/auth/introspect', app: 'platform-admin' },
    ]);
  });

  it('on refresh', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { access_token: 'fresh' } }));

    await expect(authService.refresh()).resolves.toBe('fresh');

    expect(sentApps()).toEqual([{ url: 'http://api.test/auth/refresh', app: 'platform-admin' }]);
    expect((fetchMock.mock.calls[0][1] as RequestInit).credentials).toBe('include');
  });

  it('on logout', async () => {
    sessionStore.setToken('tok');
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: null }));

    await authService.logout();

    expect(sentApps()).toEqual([{ url: 'http://api.test/auth/logout', app: 'platform-admin' }]);
  });
});

describe('authService under X-Talim-App', () => {
  it('rejects a non-admin sign-in with the API’s 403 FORBIDDEN, which the login form shows as Access denied', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: this portal is restricted to Talim administrators.',
          },
        },
        403,
      ),
    );

    const error = await authService
      .login({ email: 'teacher@school.test', password: 'pw', deviceToken: 'dev' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'FORBIDDEN', status: 403 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('treats a 401 refresh (no session, or a session that is not an admin’s) as signed out', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: false, error: { code: 'UNAUTHENTICATED', message: 'No session' } }, 401),
    );

    await expect(authService.refresh()).resolves.toBeNull();
  });
});
