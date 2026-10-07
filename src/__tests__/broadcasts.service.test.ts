import { broadcastService } from '@/app/services/broadcast.service';
import { sessionStore } from '@/lib/session';

const fetchMock = jest.fn();

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
  fetchMock.mockImplementation(
    async () => new Response(JSON.stringify({ success: true, data: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  );
  global.fetch = fetchMock as unknown as typeof fetch;
  sessionStore.clear();
});

describe('broadcastService (v1.5 §2)', () => {
  it('previews an audience', async () => {
    await broadcastService.preview({ schoolIds: ['s1'], roles: ['teacher'] });
    expect(call()).toEqual({
      method: 'POST',
      url: 'http://api.test/admin/broadcasts/preview',
      body: { audience: { schoolIds: ['s1'], roles: ['teacher'] } },
    });
  });

  it('creates, lists, reads and cancels', async () => {
    await broadcastService.create({ title: 'T', body: 'B', audience: { all: true }, channels: { push: true, email: false } });
    await broadcastService.list({ status: 'scheduled', page: 2 });
    await broadcastService.get('b1');
    await broadcastService.cancel('b1');
    expect(call(0)).toMatchObject({ method: 'POST', url: 'http://api.test/admin/broadcasts' });
    expect(call(1)).toMatchObject({ method: 'GET', url: 'http://api.test/admin/broadcasts?limit=20&status=scheduled&page=2' });
    expect(call(2)).toMatchObject({ method: 'GET', url: 'http://api.test/admin/broadcasts/b1' });
    expect(call(3)).toMatchObject({ method: 'POST', url: 'http://api.test/admin/broadcasts/b1/cancel' });
  });

  it('searches people across Talim for an audience', async () => {
    await broadcastService.searchPeople({ q: 'ngozi okafor' });
    await broadcastService.searchPeople({ q: 'ada', role: 'parent', limit: 5 });
    expect(call(0)).toEqual({ method: 'GET', url: 'http://api.test/admin/users/search?limit=20&q=ngozi+okafor', body: undefined });
    expect(call(1)).toMatchObject({ url: 'http://api.test/admin/users/search?limit=5&q=ada&role=parent' });
  });
});
