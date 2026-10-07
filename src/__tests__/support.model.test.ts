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
import { DESK_COUNTS, OTHER_ADMIN_ID, ticket } from '@/test-utils/v15Fixtures';

/**
 * A 409 as the API sends it: the generic code and the route's reason.
 *
 * @param reasonCode - The top-level `code`.
 * @returns The error.
 */
const conflict = (reasonCode?: string) => new ApiError('CONFLICT', 'The server says no.', 409, [], undefined, reasonCode);

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
    expect(parseDeskFilters(new URLSearchParams(`assignee=${OTHER_ADMIN_ID}`)).assignee).toBe(OTHER_ADMIN_ID);
  });

  it('round-trips through the query string, leaving out defaults', () => {
    const filters = { ...DEFAULT_DESK_FILTERS, scope: 'all' as const, status: 'all' as const, q: '  late fee ', page: 2 };
    expect(deskFiltersToSearch(filters)).toBe('?scope=all&status=all&q=late+fee&page=2');
    expect(parseDeskFilters(new URLSearchParams(deskFiltersToSearch(filters)))).toEqual({ ...filters, q: 'late fee' });
  });

  it('maps the filters onto the desk query (the API reads `me`, `unassigned` or an id)', () => {
    expect(toDeskQuery(DEFAULT_DESK_FILTERS)).toEqual({ status: ['open'], page: 1 });
    expect(toDeskQuery({ ...DEFAULT_DESK_FILTERS, status: 'all', assignee: 'me', schoolId: 's1', scope: 'all', q: ' x ' })).toEqual({
      assigneeId: 'me',
      schoolId: 's1',
      q: 'x',
      page: 1,
      scope: 'all',
    });
    expect(toDeskQuery({ ...DEFAULT_DESK_FILTERS, assignee: 'unassigned' }).assigneeId).toBe('unassigned');
    expect(toDeskQuery({ ...DEFAULT_DESK_FILTERS, assignee: OTHER_ADMIN_ID }).assigneeId).toBe(OTHER_ADMIN_ID);
  });
});

describe('desk helpers', () => {
  it('counts every tab, the total on All', () => {
    expect(tabCount(DESK_COUNTS, 'open')).toBe(7);
    expect(tabCount(DESK_COUNTS, 'waiting_on_user')).toBe(2);
    expect(tabCount(DESK_COUNTS, 'closed')).toBe(40);
    expect(tabCount(DESK_COUNTS, 'all')).toBe(63);
    expect(tabCount(undefined, 'open')).toBeUndefined();
  });

  it('makes what Talim only observes read-only', () => {
    expect(isReadOnlyTicket({ access: 'observer' })).toBe(true);
    expect(isReadOnlyTicket({ access: 'desk' })).toBe(false);
  });

  it('gives a resolved ticket its reopen deadline', () => {
    expect(reopenDeadline({ status: 'resolved', resolvedAt: '2026-10-01T00:00:00.000Z' })?.toISOString()).toBe(
      '2026-10-08T00:00:00.000Z',
    );
    expect(
      reopenDeadline({ status: 'resolved', resolvedAt: '2026-10-01T00:00:00.000Z', reopenableUntil: '2026-10-08T00:00:05.000Z' })?.toISOString(),
    ).toBe('2026-10-08T00:00:05.000Z');
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

describe('409 explanations, from the API\'s reason codes', () => {
  it('explains TICKET_CLOSED for a reply and for a change', () => {
    expect(ticketErrorMessage(conflict('TICKET_CLOSED'), ticket(), { kind: 'reply' })).toBe(
      'This ticket is closed, so it can no longer take replies or notes.',
    );
    expect(ticketErrorMessage(conflict('TICKET_CLOSED'), ticket(), { kind: 'status', next: 'open' })).toMatch(/can no longer be changed/);
  });

  it('explains REOPEN_WINDOW_PASSED, MESSAGE_CAP and INVALID_TRANSITION', () => {
    expect(ticketErrorMessage(conflict('REOPEN_WINDOW_PASSED'), ticket({ status: 'resolved' }), { kind: 'status', next: 'open' })).toBe(
      'This ticket can no longer be reopened: its 7-day reopen window has passed.',
    );
    expect(ticketErrorMessage(conflict('MESSAGE_CAP'), ticket(), { kind: 'reply' })).toMatch(/limit of 500 messages/);
    expect(ticketErrorMessage(conflict('INVALID_TRANSITION'), ticket({ status: 'closed' }), { kind: 'status', next: 'in_progress' })).toBe(
      'A ticket cannot go from Closed to In progress.',
    );
    expect(ticketErrorMessage(conflict('INVALID_TRANSITION'), ticket(), { kind: 'update' })).toMatch(/not allowed while the ticket is open/);
  });

  it('explains the desk codes, and falls back to the server message', () => {
    expect(ticketErrorMessage(conflict('TICKET_NOT_ESCALATED'), ticket(), { kind: 'reply' })).toMatch(/once the school escalates it/);
    expect(ticketErrorMessage(conflict('TICKET_CHANGED'), ticket(), { kind: 'update' })).toMatch(/It has been reloaded/);
    expect(ticketErrorMessage(conflict(), ticket(), { kind: 'reply' })).toBe('The server says no.');
  });

  it('passes any other error through', () => {
    expect(ticketErrorMessage(new ApiError('FORBIDDEN', 'Nope', 403), ticket(), { kind: 'reply' })).toBe('Nope');
    expect(ticketErrorMessage(new Error('x'), ticket(), { kind: 'update' })).toBe('Something went wrong. Please try again.');
  });
});
