import { ApiError } from '@/lib/apiError';
import {
  DEFAULT_DESK_FILTERS,
  deskFiltersToSearch,
  isReadOnlyTicket,
  parseDeskFilters,
  relativeTime,
  reopenDeadline,
  tabCount,
  ticketErrorMessage,
  toDeskQuery,
} from '@/components/support/desk-model';
import { DESK_COUNTS, ticket } from '@/test-utils/v15Fixtures';

const conflict = new ApiError('CONFLICT', 'Conflict', 409);

describe('desk filters in the URL', () => {
  it('opens on the Talim desk, Open tab, page 1', () => {
    expect(parseDeskFilters(new URLSearchParams(''))).toEqual(DEFAULT_DESK_FILTERS);
    expect(deskFiltersToSearch(DEFAULT_DESK_FILTERS)).toBe('');
  });

  it('reads every filter and ignores unknown values', () => {
    const filters = parseDeskFilters(
      new URLSearchParams('scope=all&status=resolved&area=fees&priority=urgent&assignee=me&school=s9&q=refund&page=3'),
    );
    expect(filters).toEqual({
      scope: 'all',
      status: 'resolved',
      area: 'fees',
      priority: 'urgent',
      assignee: 'me',
      schoolId: 's9',
      q: 'refund',
      page: 3,
    });
    expect(parseDeskFilters(new URLSearchParams('scope=x&status=bogus&area=nope&priority=9&assignee=x&page=-2'))).toEqual(
      DEFAULT_DESK_FILTERS,
    );
  });

  it('round-trips through the query string, leaving out defaults', () => {
    const filters = { ...DEFAULT_DESK_FILTERS, scope: 'all' as const, status: 'all' as const, q: '  late fee ', page: 2 };
    expect(deskFiltersToSearch(filters)).toBe('?scope=all&status=all&q=late+fee&page=2');
    expect(parseDeskFilters(new URLSearchParams(deskFiltersToSearch(filters)))).toEqual({ ...filters, q: 'late fee' });
  });

  it('maps the filters onto the desk query', () => {
    expect(toDeskQuery(DEFAULT_DESK_FILTERS, 'u-admin')).toEqual({ status: 'open', page: 1 });
    expect(
      toDeskQuery({ ...DEFAULT_DESK_FILTERS, status: 'all', assignee: 'me', schoolId: 's1', scope: 'all', q: ' x ' }, 'u-admin'),
    ).toEqual({ assigneeId: 'u-admin', schoolId: 's1', q: 'x', page: 1, scope: 'all' });
    expect(toDeskQuery({ ...DEFAULT_DESK_FILTERS, assignee: 'unassigned' }, 'u-admin').assigneeId).toBe('unassigned');
  });
});

describe('desk helpers', () => {
  it('counts every tab the contract counts, and no others', () => {
    expect(tabCount(DESK_COUNTS, 'open')).toBe(7);
    expect(tabCount(DESK_COUNTS, 'waiting_on_user')).toBe(2);
    expect(tabCount(DESK_COUNTS, 'closed')).toBeUndefined();
    expect(tabCount(DESK_COUNTS, 'all')).toBeUndefined();
    expect(tabCount(undefined, 'open')).toBeUndefined();
  });

  it('makes school-desk tickets read-only', () => {
    expect(isReadOnlyTicket({ desk: 'school' })).toBe(true);
    expect(isReadOnlyTicket({ desk: 'talim' })).toBe(false);
  });

  it('gives a resolved ticket a 7-day reopen deadline', () => {
    expect(reopenDeadline({ status: 'resolved', resolvedAt: '2026-10-01T00:00:00.000Z' })?.toISOString()).toBe(
      '2026-10-08T00:00:00.000Z',
    );
    expect(reopenDeadline({ status: 'open', resolvedAt: '2026-10-01T00:00:00.000Z' })).toBeNull();
  });

  it('words relative times', () => {
    const now = Date.parse('2026-10-06T12:00:00.000Z');
    expect(relativeTime('2026-10-06T11:59:50.000Z', now)).toBe('just now');
    expect(relativeTime('2026-10-06T11:30:00.000Z', now)).toBe('30 min ago');
    expect(relativeTime('2026-10-06T07:00:00.000Z', now)).toBe('5 h ago');
    expect(relativeTime('2026-10-04T12:00:00.000Z', now)).toBe('2 d ago');
    expect(relativeTime(undefined, now)).toBe('—');
  });
});

describe('409 explanations', () => {
  it('explains a reply refused on a closed ticket', () => {
    expect(ticketErrorMessage(conflict, ticket({ status: 'closed' }), { kind: 'reply' })).toBe(
      'This ticket is closed, so it can no longer take replies.',
    );
    expect(ticketErrorMessage(conflict, ticket(), { kind: 'reply' })).toMatch(/500-message limit/);
  });

  it('explains a reopen refused after the 7-day window', () => {
    const resolved = ticket({ status: 'resolved', resolvedAt: '2026-09-01T00:00:00.000Z' });
    expect(ticketErrorMessage(conflict, resolved, { kind: 'status', next: 'open' })).toBe(
      'This ticket can no longer be reopened: its 7-day reopen window has passed.',
    );
    expect(ticketErrorMessage(conflict, ticket({ status: 'closed' }), { kind: 'status', next: 'in_progress' })).toMatch(
      /closed ticket cannot be reopened/,
    );
    expect(ticketErrorMessage(conflict, ticket(), { kind: 'status', next: 'resolved' })).toMatch(/conflicts/);
  });

  it('passes any other error through', () => {
    expect(ticketErrorMessage(new ApiError('FORBIDDEN', 'Nope', 403), ticket(), { kind: 'reply' })).toBe('Nope');
    expect(ticketErrorMessage(new Error('x'), ticket(), { kind: 'update' })).toBe('Something went wrong. Please try again.');
  });
});
