import { api, apiClient, unwrapEnvelope } from '@/lib/apiClient';
import { ApiError } from '@/lib/apiError';
import { sessionStore } from '@/lib/session';

const fetchMock = jest.fn();

/** A JSON response for the mocked fetch. */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  sessionStore.clear();
});

describe('unwrapEnvelope', () => {
  it('returns the data field of a canonical envelope', () => {
    expect(unwrapEnvelope<{ id: string }>({ success: true, data: { id: 'a' } })).toEqual({ id: 'a' });
  });

  it('passes legacy payloads through untouched', () => {
    expect(unwrapEnvelope<{ id: string }>({ id: 'a' })).toEqual({ id: 'a' });
    expect(unwrapEnvelope<unknown[]>([1, 2])).toEqual([1, 2]);
    expect(unwrapEnvelope<null>(null)).toBeNull();
  });
});

describe('api requests', () => {
  it('attaches the in-memory bearer token and sends cookies', async () => {
    sessionStore.set({ userId: 'u', email: 'a@b.c', role: 'admin' }, 'tok-1');
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await api.get('/schools/search');

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok-1');
    expect(init.credentials).toBe('include');
  });

  it('omits the bearer token on skipAuth calls', async () => {
    sessionStore.setToken('tok-1');
    fetchMock.mockResolvedValue(jsonResponse({ access_token: 'x' }));

    await api.post('/auth/admin-login', { email: 'a' }, { skipAuth: true });

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('prefixes relative paths with the API base URL and leaves absolute ones alone', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({})));

    await api.get('/complaints');
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/complaints');

    await api.get('https://elsewhere.test/thing');
    expect(fetchMock.mock.calls[1][0]).toBe('https://elsewhere.test/thing');
  });

  it('unwraps the envelope on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: [{ _id: '1' }] }));
    await expect(api.get('/complaints')).resolves.toEqual([{ _id: '1' }]);
  });

  it('throws a coded ApiError on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Not yours' } }, 403),
    );

    await expect(api.get('/complaints')).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'Not yours',
      status: 403,
    });
  });

  it('reports an unreachable server as a transient ApiError, not a raw TypeError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await api.get('/complaints').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isTransient).toBe(true);
  });

  it('serialises a JSON body and sets the content type', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await api.patch('/complaints/1/status', { status: 'Resolved' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('PATCH');
    expect(init.body).toBe('{"status":"Resolved"}');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('lets the browser set the boundary for FormData instead of forcing JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    const form = new FormData();
    form.append('avatar', new Blob(['x']));

    await api.put('/auth/profile/avatar', form);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers?.['Content-Type']).toBeUndefined();
  });
});

describe('401 handling', () => {
  it('refreshes once, replays the request with the new token, and returns the payload', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, 401))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { ok: true } }));

    apiClient.setRefreshCallback(async () => {
      sessionStore.setToken('fresh');
      return true;
    });

    await expect(api.get('/complaints')).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, retryInit] = fetchMock.mock.calls[1];
    expect((retryInit.headers as Record<string, string>).Authorization).toBe('Bearer fresh');
  });

  it('does not retry a second time when the replayed request is also a 401', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({}, 401)));
    apiClient.setRefreshCallback(async () => {
      sessionStore.setToken('fresh');
      return true;
    });

    await expect(api.get('/complaints')).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never tries to refresh a skipAuth call — a 401 there is bad credentials', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Invalid credentials' }, 401));
    const refresh = jest.fn();
    apiClient.setRefreshCallback(refresh);

    await expect(
      api.post('/auth/admin-login', { email: 'a' }, { skipAuth: true }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(refresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes only once for concurrent 401s', async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      const auth = (init.headers as Record<string, string>)?.Authorization;
      return Promise.resolve(
        auth === 'Bearer fresh' ? jsonResponse({ ok: true }) : jsonResponse({}, 401),
      );
    });

    const refresh = jest.fn(async () => {
      sessionStore.setToken('fresh');
      return true;
    });
    apiClient.setRefreshCallback(refresh);

    await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('signs the user out when the refresh fails', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({}, 401)));
    apiClient.setRefreshCallback(async () => false);

    await expect(api.get('/complaints')).rejects.toBeTruthy();
  });

  it('notifies error listeners so a global banner can react', async () => {
    const listener = jest.fn();
    const off = apiClient.onError(listener);
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: 'NOT_FOUND' } }, 404));

    await api.get('/nope').catch(() => undefined);

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ code: 'NOT_FOUND' }));
    off();
  });
});
