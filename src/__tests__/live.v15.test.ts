/**
 * Live contract check of the v1.5 support desk and broadcasts through this
 * app's own services, against a running API with the e2e seed
 * (`talimBE-V2/e2e`). Skipped unless `LIVE_API=1`:
 *
 *   LIVE_API=1 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5085 npx jest live.v15
 *
 * It raises two tickets as the seeded parent and teacher (raw requests: this
 * console never raises tickets), then works them as the platform admin with
 * `supportService`, and sends, schedules and cancels broadcasts with
 * `broadcastService`. It writes to that API's database; point it at a
 * throwaway stack only.
 */
import { authService } from '@/app/services/auth.service';
import { broadcastService } from '@/app/services/broadcast.service';
import { supportService } from '@/app/services/support.service';
import { ApiError } from '@/lib/apiError';
import { sessionStore } from '@/lib/session';

const LIVE = process.env.LIVE_API === '1';
const API = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');
const PASSWORD = process.env.LIVE_PASSWORD ?? 'Demo#Pass2026';
const DOMAIN = process.env.LIVE_DOMAIN ?? 'e2e.talim.test';
const RUN = Date.now().toString(36);

/** The raw answer of a request made outside this app's services. */
interface Raw<T> {
  status: number;
  body: T;
}

/**
 * A request as another app would make it (the parent's and teacher's apps).
 *
 * @param method - The HTTP method.
 * @param path - The path under the API.
 * @param token - The bearer token, if any.
 * @param body - The JSON body, if any.
 * @returns The status and the parsed body, unwrapped from `{ success, data }`.
 */
async function raw<T = Record<string, unknown>>(method: string, path: string, token?: string, body?: unknown): Promise<Raw<T>> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const parsed = await res.json().catch(() => null);
  const unwrapped = parsed && typeof parsed === 'object' && 'success' in parsed && 'data' in parsed ? parsed.data : parsed;
  return { status: res.status, body: unwrapped as T };
}

/**
 * Signs a seeded school user in.
 *
 * @param local - The part of the email before the `@`.
 * @returns The access token.
 */
async function signIn(local: string): Promise<string> {
  const res = await raw<{ access_token: string }>('POST', '/auth/login', undefined, { email: `${local}@${DOMAIN}`, password: PASSWORD });
  if (res.status >= 300) throw new Error(`${local} could not sign in: ${res.status}`);
  return res.body.access_token;
}

/**
 * Waits until `check` returns a value.
 *
 * @param check - Resolves to the value, or undefined to keep waiting.
 * @param timeoutMs - How long to wait.
 * @returns The value.
 */
async function until<T>(check: () => Promise<T | undefined>, timeoutMs = 20_000): Promise<T> {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const value = await check();
    if (value !== undefined) return value;
    if (Date.now() > end) throw new Error('timed out');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * The 409 reason a call fails with.
 *
 * @param call - The call expected to fail.
 * @returns The status and `reasonCode`.
 */
async function refusal(call: () => Promise<unknown>): Promise<{ status: number; reasonCode?: string }> {
  try {
    await call();
  } catch (error) {
    if (error instanceof ApiError) return { status: error.status, reasonCode: error.reasonCode };
    throw error;
  }
  throw new Error('expected the API to refuse');
}

(LIVE ? describe : describe.skip)('v1.5 against the live API', () => {
  jest.setTimeout(120_000);
  let parentToken = '';
  let teacherToken = '';
  let parentTicket = '';
  let teacherTicket = '';
  let adminId = '';

  beforeAll(async () => {
    parentToken = await signIn('parent');
    teacherToken = await signIn('teacher');
    const { accessToken, user } = await authService.login({
      email: `platform@${DOMAIN}`,
      password: PASSWORD,
      deviceToken: `live-${RUN}`,
      platform: 'admin-web',
    });
    sessionStore.set(user, accessToken);
    adminId = user.userId;

    const fromParent = await raw<{ id: string }>('POST', '/tickets', parentToken, {
      desk: 'talim',
      area: 'payments',
      subject: `Card charged twice (${RUN})`,
      body: 'The fee was charged twice on my card.',
      attachments: [{ url: 'https://res.cloudinary.com/demo/raw/upload/receipt.pdf', name: 'receipt.pdf', mimeType: 'application/pdf', size: 1024 }],
      context: { path: '/payments', appVersion: '1.5.0', userAgent: 'live-check' },
    });
    expect(fromParent.status).toBe(201);
    parentTicket = fromParent.body.id;
    const fromTeacher = await raw<{ id: string }>('POST', '/tickets', teacherToken, {
      desk: 'talim',
      area: 'grading',
      subject: `Cannot publish scores (${RUN})`,
      body: 'Publishing CA 1 scores fails.',
    });
    expect(fromTeacher.status).toBe(201);
    teacherTicket = fromTeacher.body.id;
  });

  afterAll(() => sessionStore.clear());

  describe('support desk', () => {
    it('lists, counts and names the staff', async () => {
      const counts = await supportService.getDeskCounts();
      expect(counts.open).toBeGreaterThanOrEqual(2);
      expect(counts.total).toBeGreaterThanOrEqual(counts.open);
      expect(counts.unassigned).toBeGreaterThanOrEqual(2);

      const page = await supportService.listDesk({ status: 'open', q: RUN });
      const ids = page.data.map((t) => t.id);
      expect(ids).toEqual(expect.arrayContaining([parentTicket, teacherTicket]));
      const row = page.data.find((t) => t.id === parentTicket)!;
      expect(row).toMatchObject({ desk: 'talim', access: 'desk', unread: 1, childId: null, requester: { role: 'parent' } });
      expect(row.requester.name).toBeTruthy();
      expect(row.createdAt).toBeTruthy();
      expect(page.meta.total).toBeGreaterThanOrEqual(2);

      const staff = await supportService.listStaff();
      expect(staff.map((s) => s.id)).toContain(adminId);
    });

    it('opens a thread (read for the desk), replies, adds a note, sets status and assigns', async () => {
      const opened = await supportService.getTicket(parentTicket);
      expect(opened.unread).toBe(0);
      expect(opened.context).toMatchObject({ path: '/payments', appVersion: '1.5.0' });
      expect(opened.messages[0].attachments[0]).toMatchObject({ name: 'receipt.pdf', size: 1024 });
      const row = (await supportService.listDesk({ q: RUN })).data.find((t) => t.id === parentTicket)!;
      expect(row.unread).toBe(0);

      const replied = await supportService.postMessage(parentTicket, { body: 'We are checking with the provider.' });
      expect(replied.status).toBe('in_progress');
      expect(replied.firstResponseAt).toBeTruthy();
      const noted = await supportService.postMessage(parentTicket, { body: 'Paystack shows one reversal.', internal: true });
      expect(noted.messages.at(-1)).toMatchObject({ internal: true });

      const mine = await raw<{ data: { id: string; unread: number }[] }>('GET', '/tickets/mine', parentToken);
      expect(mine.body.data.find((t) => t.id === parentTicket)?.unread).toBe(1);
      const parentView = await raw<{ messages: { internal: boolean }[]; context: unknown }>('GET', `/tickets/${parentTicket}`, parentToken);
      expect(parentView.body.messages.some((m) => m.internal)).toBe(false);
      expect(parentView.body.context).toBeNull();

      const assigned = await supportService.updateTicket(parentTicket, { assigneeId: adminId });
      expect(assigned.assignee?.id).toBe(adminId);
      const urgent = await supportService.updateTicket(parentTicket, { priority: 'urgent' });
      expect(urgent.priority).toBe('urgent');
      const resolved = await supportService.updateTicket(parentTicket, { status: 'resolved' });
      expect(resolved.status).toBe('resolved');
      expect(resolved.reopenableUntil).toBeTruthy();
      const mineFilter = await supportService.listDesk({ assigneeId: 'me', q: RUN, status: 'resolved' });
      expect(mineFilter.data.map((t) => t.id)).toContain(parentTicket);

      // The parent's reply reopens it (assigned: back to in progress); the desk sees it unread.
      const reply = await raw<{ status: string }>('POST', `/tickets/${parentTicket}/messages`, parentToken, { body: 'Still charged twice.' });
      expect(reply.body.status).toBe('in_progress');
      const back = (await supportService.listDesk({ q: RUN })).data.find((t) => t.id === parentTicket)!;
      expect(back.unread).toBe(1);
    });

    it('answers the 409 reason codes the console explains', async () => {
      expect(await refusal(() => supportService.updateTicket(parentTicket, { status: 'resolved' }).then(() =>
        supportService.updateTicket(parentTicket, { status: 'waiting_on_user' })))).toEqual({
        status: 409,
        reasonCode: 'INVALID_TRANSITION',
      });
      await supportService.updateTicket(teacherTicket, { status: 'closed' });
      expect(await refusal(() => supportService.postMessage(teacherTicket, { body: 'Hello?' }))).toEqual({
        status: 409,
        reasonCode: 'TICKET_CLOSED',
      });
      expect(await refusal(() => supportService.updateTicket(teacherTicket, { status: 'open' }))).toEqual({
        status: 409,
        reasonCode: 'TICKET_CLOSED',
      });
    });
  });

  describe('broadcasts', () => {
    it('previews, finds people and counts them', async () => {
      const teachers = await broadcastService.preview({ roles: ['teacher'] });
      expect(teachers.recipients).toBeGreaterThanOrEqual(3);
      expect(teachers.byRole.teacher).toBe(teachers.recipients);

      const people = await broadcastService.searchPeople({ q: 'paul parent' });
      expect(people).toEqual([expect.objectContaining({ role: 'parent', email: `parent@${DOMAIN}` })]);
      const one = await broadcastService.preview({ userIds: [people[0].id] });
      expect(one.recipients).toBe(1);
    });

    it('sends now, and the history shows its stats', async () => {
      const [parent] = await broadcastService.searchPeople({ q: 'paul parent' });
      const created = await broadcastService.create({
        title: `Live now ${RUN}`,
        body: 'A live check of Talim broadcasts.',
        attachments: ['https://res.cloudinary.com/demo/raw/upload/plan.pdf'],
        target: { page: 'support' },
        audience: { roles: ['teacher'], userIds: [parent.id] },
        channels: { push: false, email: false },
      });
      expect(created.status).toBe('sending');
      const sent = await until(async () => {
        const b = await broadcastService.get(created.id);
        return b.status === 'sent' ? b : undefined;
      });
      expect(sent.stats.recipients).toBe(created.recipientsEstimate);
      expect(sent.audience.users?.map((u) => u.id)).toEqual([parent.id]);
      expect(sent.attachments).toEqual(['https://res.cloudinary.com/demo/raw/upload/plan.pdf']);
      expect(sent.target).toMatchObject({ page: 'support' });
      expect(sent.channels).toEqual({ inApp: true, push: false, email: false });

      const history = await broadcastService.list({ status: 'sent' });
      expect(history.data.find((b) => b.id === created.id)?.stats.recipients).toBe(created.recipientsEstimate);
    });

    it('schedules, cancels, and refuses a second cancel', async () => {
      const created = await broadcastService.create({
        title: `Live later ${RUN}`,
        body: 'Scheduled and then cancelled.',
        audience: { all: true },
        channels: { push: true, email: false },
        sendAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });
      expect(created.status).toBe('scheduled');
      const scheduled = await broadcastService.list({ status: 'scheduled' });
      expect(scheduled.data.map((b) => b.id)).toContain(created.id);
      const cancelled = await broadcastService.cancel(created.id);
      expect(cancelled.status).toBe('cancelled');
      expect(await refusal(() => broadcastService.cancel(created.id))).toEqual({ status: 409, reasonCode: 'BROADCAST_NOT_SCHEDULED' });
    });

    it('sends a scheduled broadcast when the minute cron claims it', async () => {
      const created = await broadcastService.create({
        title: `Live soon ${RUN}`,
        body: 'Sent by the scheduler.',
        audience: { roles: ['school_admin'] },
        channels: { push: false, email: false },
        sendAt: new Date(Date.now() + 3_000).toISOString(),
      });
      expect(created.status).toBe('scheduled');
      const sent = await until(async () => {
        const b = await broadcastService.get(created.id);
        return b.status === 'sent' ? b : undefined;
      }, 100_000);
      expect(sent.stats.recipients).toBe(created.recipientsEstimate);
    });
  });
});
