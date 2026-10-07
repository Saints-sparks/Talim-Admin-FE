import { ApiError } from '@/lib/apiError';
import type { PillTone } from '@/components/tl/styles';
import type {
  Ticket,
  TicketArea,
  TicketDeskCounts,
  TicketDeskQuery,
  TicketPriority,
  TicketStatus,
  TicketSummary,
} from '@/types/tickets';

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

/** Label per role (the API sends the role as a plain string). */
export const ROLE_LABELS: Readonly<Record<string, string>> = {
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

/** Assignee filter choices: anyone, the signed-in admin, nobody, or one staff member's id. */
export type AssigneeFilter = '' | 'me' | 'unassigned' | (string & {});

/** A user id as the API writes it (24 hex characters). */
const USER_ID = /^[0-9a-f]{24}$/i;

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
 * Reads the assignee filter: `me`, `unassigned` or a staff id; anything
 * else is "anyone".
 *
 * @param value - The raw `assignee` parameter.
 * @returns The filter.
 */
function parseAssignee(value: string | null): AssigneeFilter {
  if (value === 'me' || value === 'unassigned') return value;
  return value && USER_ID.test(value) ? value : '';
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
    assignee: parseAssignee(params.get('assignee')),
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
 * Turns the URL filters into the `GET /tickets/desk/talim` query. The API
 * reads `assigneeId` as `me`, `unassigned` or a staff id, so the filter is
 * sent as it is; `status` is a list, here the tab's one status (none for
 * `all`).
 *
 * @param filters - The filters.
 * @returns The query.
 */
export function toDeskQuery(filters: DeskFilters): TicketDeskQuery {
  return {
    ...(filters.status !== 'all' ? { status: [filters.status] } : {}),
    ...(filters.area ? { area: filters.area } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.assignee ? { assigneeId: filters.assignee } : {}),
    ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    page: filters.page,
    ...(filters.scope === 'all' ? { scope: 'all' as const } : {}),
  };
}

/**
 * The count a status tab shows: each status's own count, and the desk's
 * total on "All".
 *
 * @param counts - The desk counts, once loaded.
 * @param tab - The tab.
 * @returns The count, or `undefined` before the counts load.
 */
export function tabCount(counts: TicketDeskCounts | undefined, tab: DeskTab): number | undefined {
  if (!counts) return undefined;
  return tab === 'all' ? counts.total : counts[tab];
}

/**
 * True when Talim may only read the ticket: the API says the caller observes
 * it (a school-desk ticket the school has not escalated).
 *
 * @param ticket - The ticket.
 * @returns True when replies and changes are off.
 */
export function isReadOnlyTicket(ticket: Pick<TicketSummary, 'access'>): boolean {
  return ticket.access !== 'desk';
}

/**
 * The last moment the requester can reopen a resolved ticket, or `null` when
 * it is not resolved. Uses the detail's `reopenableUntil` when present, else
 * 7 days from `resolvedAt`.
 *
 * @param ticket - The ticket.
 * @returns The deadline.
 */
export function reopenDeadline(
  ticket: Pick<TicketSummary, 'status' | 'resolvedAt'> & { reopenableUntil?: string | null },
): Date | null {
  if (ticket.status !== 'resolved') return null;
  if (ticket.reopenableUntil) {
    const until = new Date(ticket.reopenableUntil);
    if (!Number.isNaN(until.getTime())) return until;
  }
  if (!ticket.resolvedAt) return null;
  const resolved = new Date(ticket.resolvedAt).getTime();
  return Number.isNaN(resolved) ? null : new Date(resolved + REOPEN_WINDOW_MS);
}

/** What the admin was doing when the API refused. */
export type ConflictAction = { kind: 'reply' } | { kind: 'status'; next: TicketStatus } | { kind: 'update' };

/**
 * The words for a failed reply or change. A 409 is explained from the
 * route's own reason (`reasonCode`): `TICKET_CLOSED`,
 * `REOPEN_WINDOW_PASSED`, `MESSAGE_CAP`, `INVALID_TRANSITION`, and the
 * desk's `TICKET_NOT_ESCALATED` and `TICKET_CHANGED`; anything else uses the
 * server's message.
 *
 * @param error - What was thrown.
 * @param ticket - The ticket as last loaded.
 * @param action - What was being attempted.
 * @returns The message to show.
 */
export function ticketErrorMessage(error: unknown, ticket: Pick<Ticket, 'status'>, action: ConflictAction): string {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.';
  if (error.status !== 409) return error.message;
  switch (error.reasonCode) {
    case 'TICKET_CLOSED':
      return action.kind === 'reply'
        ? 'This ticket is closed, so it can no longer take replies or notes.'
        : 'This ticket is closed, so it can no longer be changed. Ask the requester to raise a new one.';
    case 'REOPEN_WINDOW_PASSED':
      return 'This ticket can no longer be reopened: its 7-day reopen window has passed.';
    case 'MESSAGE_CAP':
      return 'This ticket has reached its limit of 500 messages, so it takes no more.';
    case 'INVALID_TRANSITION': {
      const from = STATUS_META[ticket.status]?.label ?? ticket.status;
      const to = action.kind === 'status' ? STATUS_META[action.next]?.label ?? action.next : null;
      return to
        ? `A ticket cannot go from ${from} to ${to}.`
        : `That change is not allowed while the ticket is ${from.toLowerCase()}.`;
    }
    case 'TICKET_NOT_ESCALATED':
      return 'Talim can act on a school ticket only once the school escalates it.';
    case 'TICKET_CHANGED':
      return 'Someone changed this ticket while you were working on it. It has been reloaded; check it and try again.';
    default:
      return error.message;
  }
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
 * The school's display name.
 *
 * @param ticket - The ticket.
 * @returns A display name, or "No school" when the ticket has none.
 */
export function schoolName(ticket: Pick<TicketSummary, 'school'>): string {
  return ticket.school?.name?.trim() || (ticket.school ? 'School' : 'No school');
}

/**
 * The unread badge's text for a desk row ("3 new"), or `null` when the desk
 * has read everything.
 *
 * @param ticket - The ticket.
 * @returns The text, or `null`.
 */
export function unreadLabel(ticket: Pick<TicketSummary, 'unread'>): string | null {
  return ticket.unread > 0 ? `${ticket.unread} new` : null;
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
