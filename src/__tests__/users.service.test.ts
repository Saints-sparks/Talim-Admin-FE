import { adminUserService } from '@/app/services/admin-user.service';
import { broadcastService } from '@/app/services/broadcast.service';
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
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/**
 * The method, URL and parsed body of one mocked call.
 *
 * @param index - Which call.
 * @returns The request.
 */
function call(index = 0): { method: string; url: string; body: unknown } {
  const [url, init] = fetchMock.mock.calls[index] as [string, RequestInit];
  return { method: String(init.method), url, body: init.body ? JSON.parse(String(init.body)) : undefined };
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  sessionStore.clear();
});

describe('adminUserService (v1.5 addendum)', () => {
  it('searches with one request carrying the words, role, school, status and limit', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: [] }));
    await adminUserService.search({ q: 'bola ade', role: 'parent', schoolId: 's1', status: 'deletion_scheduled', limit: 50 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(call()).toEqual({
      method: 'GET',
      url: 'http://api.test/admin/users/search?q=bola+ade&role=parent&schoolId=s1&status=deletion_scheduled&limit=50',
      body: undefined,
    });
  });

  it("is the broadcast composer's people search too (one implementation)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: [] }));
    await broadcastService.searchPeople({ q: 'ngozi' });
    expect(call().url).toBe('http://api.test/admin/users/search?limit=20&q=ngozi');
  });

  it('reads one user', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 'u1', status: 'active' } }));
    expect(await adminUserService.get('u1')).toEqual({ id: 'u1', status: 'active' });
    expect(call()).toEqual({ method: 'GET', url: 'http://api.test/admin/users/u1', body: undefined });
  });

  it('patches the status with the reason', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 'u1', status: 'inactive' } }));
    await adminUserService.setStatus('u1', { isActive: false, reason: 'Left the school' });
    expect(call()).toEqual({
      method: 'PATCH',
      url: 'http://api.test/admin/users/u1/status',
      body: { isActive: false, reason: 'Left the school' },
    });
  });

  it("surfaces a refusal as an ApiError with the route's reason", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: false, error: { code: 'CONFLICT', message: 'You cannot change your own account.' }, code: 'SELF' }, 409),
    );
    await expect(adminUserService.setStatus('u1', { isActive: false })).rejects.toMatchObject({ status: 409, reasonCode: 'SELF' });
  });
});
