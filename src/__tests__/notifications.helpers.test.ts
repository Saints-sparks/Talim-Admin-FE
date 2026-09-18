import type { NotificationResponse } from '@/app/services/notification.service';
import {
  buildCreatePayload,
  formatDateTime,
  getAudienceLabel,
  getDisplayStatus,
  getRoleLabel,
  matchesNotificationSearch,
  toScheduledIso,
  validateNotificationForm,
} from '@/app/talimadmindashboard/talimannouncement/_components/helpers';
import { EMPTY_FORM } from '@/app/talimadmindashboard/talimannouncement/_components/constants';
import { buildPageSequence } from '@/app/talimadmindashboard/talimannouncement/_components/PaginationBar';
import type { NotificationFormState } from '@/app/talimadmindashboard/talimannouncement/_components/types';

const NOW = new Date('2026-06-01T12:00:00.000Z').getTime();

/** A notification with the fields the list and detail views read. */
function notification(overrides: Partial<NotificationResponse> = {}): NotificationResponse {
  return {
    _id: 'n1',
    title: 'Scheduled maintenance',
    message: 'Talim will be unavailable on Saturday.',
    attachments: [],
    recipientRoles: ['teacher'],
    targetSchools: [],
    status: 'pending',
    priority: 'medium',
    readBy: [],
    createdAt: '2026-05-30T09:00:00.000Z',
    updatedAt: '2026-05-30T09:00:00.000Z',
    ...overrides,
  };
}

/** A valid form, so each test only varies the field it is about. */
function form(overrides: Partial<NotificationFormState> = {}): NotificationFormState {
  return {
    ...EMPTY_FORM,
    title: 'Maintenance',
    message: 'We will be down on Saturday.',
    selectedSchools: ['65f0000000000000000000aa'],
    ...overrides,
  };
}

describe('getDisplayStatus', () => {
  it('shows a future scheduled notification as scheduled', () => {
    const n = notification({ scheduledFor: '2026-06-02T09:00:00.000Z' });
    expect(getDisplayStatus(n, NOW)).toBe('scheduled');
  });

  it('stops calling it scheduled once it has actually been sent', () => {
    const n = notification({ scheduledFor: '2026-05-31T09:00:00.000Z', status: 'sent' });
    expect(getDisplayStatus(n, NOW)).toBe('sent');
  });

  it('stops calling it scheduled once its time has passed', () => {
    const n = notification({ scheduledFor: '2026-05-31T09:00:00.000Z' });
    expect(getDisplayStatus(n, NOW)).toBe('pending');
  });

  it('reports sent, failed and pending from the record', () => {
    expect(getDisplayStatus(notification({ status: 'sent' }), NOW)).toBe('sent');
    expect(getDisplayStatus(notification({ status: 'failed' }), NOW)).toBe('failed');
    expect(getDisplayStatus(notification({ status: 'pending' }), NOW)).toBe('pending');
  });

  it('ignores an unparseable scheduledFor rather than showing "scheduled" forever', () => {
    expect(getDisplayStatus(notification({ scheduledFor: 'soon' }), NOW)).toBe('pending');
  });
});

describe('getAudienceLabel', () => {
  it('names the single targeted school', () => {
    const n = notification({ targetSchools: [{ _id: 's1', name: 'Bright Star' }] });
    expect(getAudienceLabel(n)).toBe('Bright Star');
  });

  it('counts multiple schools', () => {
    const n = notification({
      targetSchools: [
        { _id: 's1', name: 'A' },
        { _id: 's2', name: 'B' },
      ],
    });
    expect(getAudienceLabel(n)).toBe('2 Schools');
  });

  it('falls back to a role count, then to Global', () => {
    expect(getAudienceLabel(notification({ recipientRoles: ['teacher', 'parent'] }))).toBe(
      '2 User Types',
    );
    expect(getAudienceLabel(notification({ recipientRoles: [], targetSchools: [] }))).toBe('Global');
  });
});

describe('getRoleLabel', () => {
  it('uses the option label for a known role', () => {
    expect(getRoleLabel('school_admin')).toBe('School Admins');
    expect(getRoleLabel('teacher')).toBe('Teachers');
  });

  it('humanises an unfamiliar role rather than rendering nothing', () => {
    expect(getRoleLabel('school_sub_admin')).toBe('School Sub Admin');
  });
});

describe('matchesNotificationSearch', () => {
  it('matches the title, message and category', () => {
    expect(matchesNotificationSearch(notification(), 'maintenance')).toBe(true);
    expect(matchesNotificationSearch(notification(), 'saturday')).toBe(true);
    expect(matchesNotificationSearch(notification(), 'nothing here')).toBe(false);
  });

  it('survives a record with no sender or category set', () => {
    expect(matchesNotificationSearch(notification({ category: undefined }), 'announcement')).toBe(
      false,
    );
  });
});

describe('toScheduledIso', () => {
  it('combines the date and time inputs', () => {
    expect(toScheduledIso('2026-06-02', '09:30')).toBe(
      new Date('2026-06-02T09:30').toISOString(),
    );
  });

  it('returns null when either half is missing or unparseable', () => {
    expect(toScheduledIso('', '09:30')).toBeNull();
    expect(toScheduledIso('2026-06-02', '')).toBeNull();
    expect(toScheduledIso('not-a-date', '09:30')).toBeNull();
  });
});

describe('validateNotificationForm', () => {
  it('accepts a complete form', () => {
    expect(validateNotificationForm(form())).toBeNull();
  });

  it.each([
    ['a missing title', { title: '   ' }],
    ['a missing message', { message: '' }],
    ['no school when targeting schools', { selectedSchools: [] }],
    ['no user type', { recipientRoles: [] }],
    ['no delivery method', { deliveryMethods: [] }],
  ])('rejects %s', (_label, overrides) => {
    expect(validateNotificationForm(form(overrides as Partial<NotificationFormState>))).not.toBeNull();
  });

  it('does not require a school when targeting every school by role', () => {
    expect(
      validateNotificationForm(form({ audienceMode: 'roles', selectedSchools: [] })),
    ).toBeNull();
  });

  it('requires a future date and time when scheduling', () => {
    expect(validateNotificationForm(form({ scheduleMode: 'later' }))).not.toBeNull();
    expect(
      validateNotificationForm(
        form({ scheduleMode: 'later', scheduledDate: '2020-01-01', scheduledTime: '09:00' }),
      ),
    ).toBe('Pick a time in the future.');
  });
});

describe('buildCreatePayload', () => {
  it('sends only fields CreateNotificationDto declares', () => {
    const payload = buildCreatePayload(form(), 'admin-1');
    expect(Object.keys(payload).sort()).toEqual(
      [
        'category',
        'deliveryChannels',
        'message',
        'priority',
        'recipientRoles',
        'senderId',
        'source',
        'targetSchools',
        'title',
        'type',
      ].sort(),
    );
  });

  it('puts scheduledFor at the top level, not inside metadata', () => {
    const payload = buildCreatePayload(
      form({ scheduleMode: 'later', scheduledDate: '2030-01-02', scheduledTime: '08:00' }),
      'admin-1',
    );
    expect(payload.scheduledFor).toBe(new Date('2030-01-02T08:00').toISOString());
    expect(payload.isScheduled).toBe(true);
    expect(payload.metadata).toBeUndefined();
  });

  it('omits the schedule fields entirely when sending now', () => {
    const payload = buildCreatePayload(form(), 'admin-1');
    expect(payload).not.toHaveProperty('scheduledFor');
    expect(payload).not.toHaveProperty('isScheduled');
  });

  it('sends no target schools when the audience is every school by role', () => {
    const payload = buildCreatePayload(form({ audienceMode: 'roles' }), 'admin-1');
    expect(payload.targetSchools).toEqual([]);
  });

  it('trims the title and message', () => {
    const payload = buildCreatePayload(form({ title: '  Hi  ', message: '  There  ' }), 'a');
    expect(payload.title).toBe('Hi');
    expect(payload.message).toBe('There');
  });
});

describe('formatDateTime', () => {
  it('returns an em dash for missing or unparseable values', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime('whenever')).toBe('—');
  });

  it('formats a real timestamp', () => {
    expect(formatDateTime('2026-05-30T09:00:00.000Z')).not.toBe('—');
  });
});

describe('buildPageSequence', () => {
  it('lists every page when there are few', () => {
    expect(buildPageSequence(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('always includes the first, last and current pages', () => {
    const pages = buildPageSequence(10, 20);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(20);
    expect(pages).toContain(10);
  });

  it('elides only the runs that are hidden', () => {
    expect(buildPageSequence(1, 20)).toEqual([1, 2, 'ellipsis', 20]);
    expect(buildPageSequence(20, 20)).toEqual([1, 'ellipsis', 19, 20]);
  });
});
