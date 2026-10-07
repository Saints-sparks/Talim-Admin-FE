import { ApiError } from '@/lib/apiError';
import type { PillTone } from '@/components/tl/styles';
import type {
  Ticket,
  TicketArea,
  TicketDeskCounts,
  TicketDeskQuery,
  TicketPriority,
  TicketRole,
  TicketStatus,
  TicketSummary,
} from '@/types/v15';

/** Every status, in workflow order. */
export const TICKET_STATUSES: readonly TicketStatus[] = ['open', 'in_progress', 'waiting_on_user', 'resolved', 'closed'];

/** Every priority, lowest first. */
export const TICKET_PRIORITIES: readonly TicketPriority[] = ['low', 'normal', 'high', 'urgent'];

/** Every area, in the order the filter lists them. */
export const TICKET_AREAS: readonly TicketArea[] = [
  'signing_in',
  'payments',
  'fees',
  'grading',
  'results',
  'attendance',
  'timetable',
  'messages',
  'transport',
  'behaviour',
  'other',
];

/** Label and pill tone per status. */
export const STATUS_META: Record<TicketStatus, { label: string; tone: PillTone }> = {
  open: { label: 'Open', tone: 'info' },
  in_progress: { label: 'In progress', tone: 'accent' },
  waiting_on_user: { label: 'Waiting on user', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'muted' },
};

/** Label and pill tone per priority. */
export const PRIORITY_META: Record<TicketPriority, { label: string; tone: PillTone }> = {
  low: { label: 'Low', tone: 'muted' },
  normal: { label: 'Normal', tone: 'info' },
  high: { label: 'High', tone: 'warning' },
  urgent: { label: 'Urgent', tone: 'danger' },
};

/** Label per area. */
export const AREA_LABELS: Record<TicketArea, string> = {
  grading: 'Grading',
  attendance: 'Attendance',
  timetable: 'Timetable',
  messages: 'Messages',
  signing_in: 'Signing in',
  payments: 'Payments',
  fees: 'Fees',
  results: 'Results',
  transport: 'Transport',
  behaviour: 'Behaviour',
  other: 'Other',
};

/** Label per role. */
export const ROLE_LABELS: Record<TicketRole, string> = {
  student: 'Student',
  parent: 'Parent',
  teacher: 'Teacher',
  school_admin: 'School admin',
  school_sub_admin: 'School sub-admin',
  admin: 'Talim staff',
};

/** How long after `resolvedAt` a ticket can still be reopened (§1). */
export const REOPEN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Longest message body the API accepts (§1 `body (1..5000)`). */
export const MESSAGE_MAX_LENGTH = 5000;

/** A status tab: one status, or every ticket. */
export type DeskTab = TicketStatus | 'all';

/** The status tabs, in order; `all` last. */
export const DESK_TABS: readonly DeskTab[] = [...TICKET_STATUSES, 'all'];

/** Assignee filter choices: anyone, the signed-in admin, or nobody. */
export type AssigneeFilter = '' | 'me' | 'unassigned';

/** Every desk filter, as the URL carries it. */
export interface DeskFilters {
  /** `talim` is the Talim desk; `all` adds school-desk tickets read-only (`?scope=all`). */
  scope: 'talim' | 'all';
  status: DeskTab;
  area: TicketArea | '';
  priority: TicketPriority | '';
  assignee: AssigneeFilter;
  schoolId: string;
  q: string;
  page: number;
}

/** The filters a bare `/talimsupport` opens on. */
export const DEFAULT_DESK_FILTERS: DeskFilters = {
  scope: 'talim',
  status: 'open',
  area: '',
  priority: '',
  assignee: '',
  schoolId: '',
  q: '',
  page: 1,
};

/**
 * Narrows a raw value to one of a list of allowed values.
 *
 * @param value - The raw value.
 * @param allowed - The allowed values.
 * @param fallback - Returned when the value is not allowed.
 * @returns The value or the fallback.
 */
function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/**
 * Reads the desk filters from the URL, ignoring unknown or malformed values.
 *
 * @param params - The page's search params.
 * @returns The filters.
 */
export function parseDeskFilters(params: Pick<URLSearchParams, 'get'>): DeskFilters {
  const page = Number.parseInt(params.get('page') ?? '', 10);
  return {
    scope: params.get('scope') === 'all' ? 'all' : 'talim',
    status: oneOf<DeskTab>(params.get('status'), DESK_TABS, DEFAULT_DESK_FILTERS.status),
    area: oneOf<TicketArea | ''>(params.get('area'), TICKET_AREAS, ''),
    priority: oneOf<TicketPriority | ''>(params.get('priority'), TICKET_PRIORITIES, ''),
    assignee: oneOf<AssigneeFilter>(params.get('assignee'), ['me', 'unassigned'], ''),
    schoolId: params.get('school') ?? '',
    q: params.get('q') ?? '',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/**
 * Writes the desk filters back to a query string, leaving out defaults so a
 * plain desk link stays `/talimsupport`.
 *
 * @param filters - The filters.
 * @returns The query string including `?`, or an empty string.
 */
export function deskFiltersToSearch(filters: DeskFilters): string {
  const params = new URLSearchParams();
  if (filters.scope === 'all') params.set('scope', 'all');
  if (filters.status !== DEFAULT_DESK_FILTERS.status) params.set('status', filters.status);
  if (filters.area) params.set('area', filters.area);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assignee) params.set('assignee', filters.assignee);
  if (filters.schoolId) params.set('school', filters.schoolId);
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.page > 1) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * Turns the URL filters into the `GET /tickets/desk/talim` query.
 *
 * @param filters - The filters.
 * @param myUserId - The signed-in admin, for "Assigned to me".
 * @returns The query.
 */
export function toDeskQuery(filters: DeskFilters, myUserId: string | undefined): TicketDeskQuery {
  let assigneeId: string | undefined;
  if (filters.assignee === 'me') assigneeId = myUserId;
  else if (filters.assignee === 'unassigned') assigneeId = 'unassigned';
  return {
    ...(filters.status !== 'all' ? { status: filters.status } : {}),
    ...(filters.area ? { area: filters.area } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(assigneeId ? { assigneeId } : {}),
    ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    page: filters.page,
    ...(filters.scope === 'all' ? { scope: 'all' as const } : {}),
  };
}

/**
 * The count a status tab shows. The contract counts every status but
 * `closed`, and has no total, so those two tabs show none.
 *
 * @param counts - The desk counts, once loaded.
 * @param tab - The tab.
 * @returns The count, or `undefined` when there is none to show.
 */
export function tabCount(counts: TicketDeskCounts | undefined, tab: DeskTab): number | undefined {
  if (!counts || tab === 'all' || tab === 'closed') return undefined;
  return counts[tab];
}

/**
 * True when Talim may only read the ticket: a school-desk ticket that was not
 * escalated (escalation moves it to the Talim desk).
 *
 * @param ticket - The ticket.
 * @returns True when replies and changes are off.
 */
export function isReadOnlyTicket(ticket: Pick<TicketSummary, 'desk'>): boolean {
  return ticket.desk === 'school';
}

/**
 * The last moment a resolved ticket can be reopened, or `null` when it is
 * not resolved or has no `resolvedAt`.
 *
 * @param ticket - The ticket.
 * @returns The deadline.
 */
export function reopenDeadline(ticket: Pick<TicketSummary, 'status' | 'resolvedAt'>): Date | null {
  if (ticket.status !== 'resolved' || !ticket.resolvedAt) return null;
  const resolved = new Date(ticket.resolvedAt).getTime();
  return Number.isNaN(resolved) ? null : new Date(resolved + REOPEN_WINDOW_MS);
}

/** What the admin was doing when the API answered 409. */
export type ConflictAction = { kind: 'reply' } | { kind: 'status'; next: TicketStatus } | { kind: 'update' };

/**
 * The words for a failed reply or change. A 409 is explained from the ticket
 * as last loaded (closed, or past the 7-day reopen window); anything else
 * uses the server's message.
 *
 * @param error - What was thrown.
 * @param ticket - The ticket as last loaded.
 * @param action - What was being attempted.
 * @returns The message to show.
 */
export function ticketErrorMessage(
  error: unknown,
  ticket: Pick<Ticket, 'status' | 'resolvedAt'>,
  action: ConflictAction,
): string {
  if (!(error instanceof ApiError) || error.status !== 409) {
    return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
  }
  if (action.kind === 'reply') {
    return ticket.status === 'closed'
      ? 'This ticket is closed, so it can no longer take replies.'
      : 'This ticket can no longer take replies. It may have been closed, or reached its 500-message limit.';
  }
  const reopening =
    action.kind === 'status' &&
    (ticket.status === 'resolved' || ticket.status === 'closed') &&
    action.next !== 'resolved' &&
    action.next !== 'closed';
  if (reopening) {
    return ticket.status === 'closed'
      ? 'A closed ticket cannot be reopened. Ask the requester to raise a new one.'
      : 'This ticket can no longer be reopened: its 7-day reopen window has passed.';
  }
  return 'This change conflicts with the ticket’s current state. It has been reloaded; check it and try again.';
}

/**
 * The requester's display name, falling back to their role.
 *
 * @param ticket - The ticket.
 * @returns A display name.
 */
export function requesterName(ticket: Pick<TicketSummary, 'requester'>): string {
  return ticket.requester.name?.trim() || ROLE_LABELS[ticket.requester.role] || 'Unknown requester';
}

/**
 * The school's display name, or a placeholder when the API sent only an id.
 *
 * @param ticket - The ticket.
 * @returns A display name.
 */
export function schoolName(ticket: Pick<TicketSummary, 'school' | 'schoolId'>): string {
  if (ticket.school?.name) return ticket.school.name;
  return ticket.schoolId ? 'School' : 'No school';
}

/**
 * A short timestamp ("6 Oct 2026, 09:05").
 *
 * @param iso - An ISO timestamp.
 * @returns The formatted value, or an em dash when the value is missing or unusable.
 */
export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * "3 min ago", "5 h ago", "2 d ago", falling back to the date after a week.
 *
 * @param iso - An ISO timestamp.
 * @param now - Current time, injectable for tests.
 * @returns The relative time.
 */
export function relativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const minutes = Math.max(0, Math.round((now - then) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days <= 7) return `${days} d ago`;
  return new Date(then).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
