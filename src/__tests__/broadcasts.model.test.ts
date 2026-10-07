import {
  EMPTY_BROADCAST_FORM,
  audienceLabel,
  buildAudience,
  buildBroadcastPayload,
  channelsLabel,
  percentOf,
  toSendAtIso,
  validateAudience,
  validateBroadcastForm,
  type BroadcastForm,
} from '@/components/broadcasts/broadcast-model';
import { broadcast } from '@/test-utils/v15Fixtures';

const NOW = Date.parse('2026-10-06T12:00:00.000Z');

/**
 * A form that passes validation.
 *
 * @param overrides - Fields to change.
 * @returns The form.
 */
function form(overrides: Partial<BroadcastForm> = {}): BroadcastForm {
  return { ...EMPTY_BROADCAST_FORM, title: 'Term dates', body: 'Second term starts on 5 January.', roles: ['teacher'], ...overrides };
}

describe('audience builder rules', () => {
  it('sends everyone as { all: true } and nothing else', () => {
    expect(buildAudience(form({ audienceMode: 'everyone', schoolScope: 'selected', schoolIds: ['s1'] }))).toEqual({ all: true });
    expect(validateAudience(form({ audienceMode: 'everyone', roles: [] }))).toBeNull();
  });

  it('crosses roles with every school, or with the chosen schools', () => {
    expect(buildAudience(form({ roles: ['teacher', 'parent'] }))).toEqual({ roles: ['teacher', 'parent'] });
    expect(buildAudience(form({ schoolScope: 'selected', schoolIds: ['s1', 's2'] }))).toEqual({ schoolIds: ['s1', 's2'], roles: ['teacher'] });
    // Schools chosen but scope switched back to all: the ids are not sent.
    expect(buildAudience(form({ schoolScope: 'all', schoolIds: ['s1'] }))).toEqual({ roles: ['teacher'] });
    expect(buildAudience(form({ roles: [], userIds: ['u1'] }))).toEqual({ userIds: ['u1'] });
  });

  it('needs a role, and a school when "Selected schools"', () => {
    expect(validateAudience(form({ roles: [] }))).toBe('Choose at least one role, or send to everyone.');
    expect(validateAudience(form({ schoolScope: 'selected', schoolIds: [] }))).toBe(
      'Choose at least one school, or switch to All schools.',
    );
    expect(validateAudience(form({ schoolScope: 'selected', schoolIds: ['s1'], roles: [], userIds: ['u1'] }))).toBe(
      'Choose at least one role for the selected schools.',
    );
    expect(validateAudience(form({ roles: [], userIds: ['u1'] }))).toBeNull();
    expect(validateAudience(form())).toBeNull();
  });
});

describe('form validation', () => {
  it('accepts a complete form', () => {
    expect(validateBroadcastForm(form(), NOW)).toEqual({});
  });

  it('requires a title and a body within their limits', () => {
    expect(validateBroadcastForm(form({ title: '  ', body: '' }), NOW)).toEqual({
      title: 'Give the notification a title.',
      body: 'Write the message.',
    });
    expect(validateBroadcastForm(form({ title: 'x'.repeat(121), body: 'y'.repeat(2001) }), NOW)).toEqual({
      title: 'Keep the title to 120 characters.',
      body: 'Keep the message to 2,000 characters.',
    });
  });

  it('refuses a schedule in the past, or one without a date and time', () => {
    const past = new Date(NOW - 60_000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}`;
    const time = `${pad(past.getHours())}:${pad(past.getMinutes())}`;
    expect(validateBroadcastForm(form({ when: 'later', date, time }), NOW).schedule).toBe(
      'That time has passed. Pick a time in the future.',
    );
    expect(validateBroadcastForm(form({ when: 'later', date: '', time: '09:00' }), NOW).schedule).toBe(
      'Pick the date and time to send it.',
    );
    expect(validateBroadcastForm(form({ when: 'later', date: '2027-01-05', time: '08:30' }), NOW)).toEqual({});
    expect(validateBroadcastForm(form({ when: 'now', date: '2000-01-01', time: '00:00' }), NOW)).toEqual({});
  });
});

describe('payload', () => {
  it('builds the POST /admin/broadcasts body', () => {
    const files = [{ url: 'https://cdn.test/a.pdf', name: 'a.pdf', mimeType: 'application/pdf', size: 10 }];
    expect(buildBroadcastPayload(form({ title: ' Hi ', body: ' Body ', target: 'payments', push: true, email: true }), files)).toEqual({
      title: 'Hi',
      body: 'Body',
      attachments: files,
      target: { page: 'payments' },
      audience: { roles: ['teacher'] },
      channels: { push: true, email: true },
    });
  });

  it('sends the browser-local date and time as ISO only when scheduling', () => {
    const payload = buildBroadcastPayload(form({ when: 'later', date: '2027-01-05', time: '08:30', push: false }), []);
    expect(payload.sendAt).toBe(new Date('2027-01-05T08:30').toISOString());
    expect(payload.channels).toEqual({ push: false, email: false });
    expect(payload).not.toHaveProperty('attachments');
    expect(payload).not.toHaveProperty('target');
    expect(toSendAtIso('2027-01-05', '')).toBeNull();
  });
});

describe('labels', () => {
  it('words audiences and channels', () => {
    expect(audienceLabel(broadcast())).toBe('Teachers, Parents · 2 schools');
    expect(audienceLabel(broadcast({ audience: { all: true } }))).toBe('Everyone');
    expect(audienceLabel(broadcast({ audience: { roles: ['student'] }, schools: [] }))).toBe('Students · all schools');
    expect(audienceLabel(broadcast({ audience: { roles: ['teacher'], schoolIds: ['s1'] } }))).toBe('Teachers · Greenfield Academy');
    expect(channelsLabel({ push: false, email: false })).toBe('In-app');
    expect(channelsLabel({ push: true, email: true })).toBe('In-app, push and email');
    expect(percentOf(640, 1200)).toBe('53%');
    expect(percentOf(1, 0)).toBeUndefined();
  });
});
