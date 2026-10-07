import { supportService } from '@/app/services/support.service';
import { validateAttachmentFile } from '@/app/services/upload.service';
import { toQueryString } from '@/lib/queryString';
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

describe('supportService (v1.5 Talim desk)', () => {
  it('lists the desk with one request carrying every filter', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { data: [], meta: { total: 0, page: 2, lastPage: 1, limit: 20 } } }));
    const page = await supportService.listDesk({ status: 'open', area: 'fees', assigneeId: 'unassigned', q: 'late fee', page: 2, scope: 'all' });
    expect(page.meta.page).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(call().url).toBe(
      'http://api.test/tickets/desk/talim?limit=20&status=open&area=fees&assigneeId=unassigned&q=late+fee&page=2&scope=all',
    );
  });

  it('asks for counts, with the scope when it is "all"', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ open: 1 }));
    await supportService.getDeskCounts();
    await supportService.getDeskCounts('all');
    expect(call(0).url).toBe('http://api.test/tickets/desk/talim/counts');
    expect(call(1).url).toBe('http://api.test/tickets/desk/talim/counts?scope=all');
  });

  it('posts a reply or note and patches only the changed fields', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}));
    await supportService.postMessage('t1', { body: 'Hello', internal: true });
    await supportService.updateTicket('t1', { assigneeId: null });
    expect(call(0)).toEqual({ method: 'POST', url: 'http://api.test/tickets/t1/messages', body: { body: 'Hello', internal: true } });
    expect(call(1)).toEqual({ method: 'PATCH', url: 'http://api.test/tickets/t1', body: { assigneeId: null } });
  });

  it('surfaces a 409 as an ApiError with its status', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: false, error: { code: 'CONFLICT', message: 'Ticket is closed' } }, 409),
    );
    await expect(supportService.postMessage('t1', { body: 'Hi' })).rejects.toMatchObject({ status: 409, code: 'CONFLICT' });
  });
});

describe('helpers', () => {
  it('drops empty query params', () => {
    expect(toQueryString({ a: 1, b: '', c: undefined, d: null, e: false })).toBe('?a=1&e=false');
    expect(toQueryString({})).toBe('');
  });

  it('checks attachments against the server rules', () => {
    expect(validateAttachmentFile(new File(['x'], 'notes.pdf', { type: 'application/pdf' }))).toBeNull();
    expect(validateAttachmentFile(new File(['x'], 'run.exe'))).toMatch(/not supported/);
    expect(validateAttachmentFile(null)).toBe('No file selected.');
  });
});
