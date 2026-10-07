/**
 * Fixtures shaped like the v1.5 API as built (`talimBE-V2/docs/v1.5-platform-sync.md`,
 * "v1.5 as built"), typed with the generated contract so a change there
 * fails here first.
 */
import type { AdminUserSearchItem, Broadcast, BroadcastPreview } from '@/types/broadcasts';
import type { Ticket, TicketDeskCounts, TicketPage, TicketStaff, TicketSummary } from '@/types/tickets';

/** The signed-in platform admin in tests (a 24-hex id, as the API sends). */
export const ADMIN_USER = {
  userId: '64a000000000000000000001',
  email: 'ops@talim.test',
  role: 'admin',
  firstName: 'Ada',
  lastName: 'Admin',
};

/** Another Talim desk member. */
export const OTHER_ADMIN_ID = '64a000000000000000000002';

/** The Talim desk's staff, as `GET /tickets/desk/talim/staff` answers. */
export const DESK_STAFF: TicketStaff[] = [
  { id: ADMIN_USER.userId, name: 'Ada Admin', role: 'admin', email: ADMIN_USER.email },
  { id: OTHER_ADMIN_ID, name: 'Tunde Bello', role: 'admin', email: 'tunde@talim.test' },
];

/**
 * A Talim-desk ticket summary.
 *
 * @param overrides - Fields to change.
 * @returns The summary.
 */
export function ticketSummary(overrides: Partial<TicketSummary> = {}): TicketSummary {
  return {
    id: 't1',
    reference: 'TS-10001',
    desk: 'talim',
    area: 'payments',
    subject: 'Card payment failed twice',
    status: 'open',
    priority: 'high',
    requester: { id: 'u-parent', name: 'Bola Ade', role: 'parent', email: 'bola@parent.test' },
    school: { id: 's1', name: 'Greenfield Academy' },
    childId: null,
    child: null,
    assignee: null,
    messageCount: 3,
    unread: 0,
    escalatedFrom: null,
    access: 'desk',
    lastActivityAt: '2026-10-06T08:00:00.000Z',
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    createdAt: '2026-10-05T09:00:00.000Z',
    ...overrides,
  };
}

/**
 * A full ticket with a requester message, a staff reply and an internal note.
 *
 * @param overrides - Fields to change.
 * @returns The ticket.
 */
export function ticket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    ...ticketSummary(),
    firstResponseAt: '2026-10-05T10:00:00.000Z',
    reopenableUntil: null,
    escalatedAt: null,
    context: null,
    messages: [
      {
        id: 'm1',
        author: { id: 'u-parent', name: 'Bola Ade', role: 'parent' },
        body: 'My card was charged but the fee still shows unpaid.',
        attachments: [{ url: 'https://cdn.test/receipt.pdf', name: 'receipt.pdf', mimeType: 'application/pdf', size: 20480 }],
        internal: false,
        createdAt: '2026-10-05T09:00:00.000Z',
      },
      {
        id: 'm2',
        author: { id: ADMIN_USER.userId, name: 'Ada Admin', role: 'admin' },
        body: 'Thanks, we are checking with the provider.',
        attachments: [],
        internal: false,
        createdAt: '2026-10-05T10:00:00.000Z',
      },
      {
        id: 'm3',
        author: { id: ADMIN_USER.userId, name: 'Ada Admin', role: 'admin' },
        body: 'Paystack shows the charge reversed; confirm with finance.',
        attachments: [],
        internal: true,
        createdAt: '2026-10-05T10:05:00.000Z',
      },
    ],
    ...overrides,
  };
}

/** Desk counts. */
export const DESK_COUNTS: TicketDeskCounts = {
  open: 7,
  in_progress: 3,
  waiting_on_user: 2,
  resolved: 11,
  closed: 40,
  total: 63,
  unassigned: 4,
  mine: 2,
};

/**
 * A page of the desk.
 *
 * @param rows - The tickets.
 * @param total - Total matching tickets.
 * @returns The page.
 */
export function ticketPage(rows: TicketSummary[], total = rows.length): TicketPage {
  return { data: rows, meta: { total, page: 1, lastPage: Math.max(1, Math.ceil(total / 20)), limit: 20 } };
}

/**
 * A broadcast as the history and detail screens read it.
 *
 * @param overrides - Fields to change.
 * @returns The broadcast.
 */
export function broadcast(overrides: Partial<Broadcast> = {}): Broadcast {
  return {
    id: 'b1',
    title: 'Scheduled maintenance',
    body: 'Talim will be unavailable on Saturday from 22:00 to 23:00.',
    attachments: [],
    target: null,
    audience: {
      all: false,
      schoolIds: ['s1', 's2'],
      schools: [
        { id: 's1', name: 'Greenfield Academy' },
        { id: 's2', name: 'Hillcrest College' },
      ],
      roles: ['teacher', 'parent'],
      userIds: [],
    },
    channels: { inApp: true, push: true, email: false },
    status: 'sent',
    sendAt: '2026-10-04T09:00:00.000Z',
    sentAt: '2026-10-04T09:00:00.000Z',
    cancelledAt: null,
    recipientsEstimate: 1200,
    createdBy: { id: ADMIN_USER.userId, name: 'Ada Admin' },
    createdAt: '2026-10-04T08:59:00.000Z',
    stats: { recipients: 1200, delivered: 1180, read: 640, pushSent: 900, emailSent: 0, failed: 20 },
    ...overrides,
  };
}

/** A recipient preview. */
export const PREVIEW: BroadcastPreview = {
  recipients: 1234,
  bySchool: [
    { schoolId: 's1', name: 'Greenfield Academy', count: 800 },
    { schoolId: 's2', name: 'Hillcrest College', count: 434 },
  ],
  byRole: { teacher: 120, parent: 1114, student: 0, school_admin: 0, school_sub_admin: 0 },
};

/** People found by `GET /admin/users/search`. */
export const PEOPLE: AdminUserSearchItem[] = [
  {
    id: '64b000000000000000000001',
    name: 'Ngozi Okafor',
    email: 'ngozi@greenfield.test',
    role: 'school_admin',
    school: { id: 's1', name: 'Greenfield Academy' },
  },
  {
    id: '64b000000000000000000002',
    name: 'Ngozi Adeyemi',
    email: 'n.adeyemi@parent.test',
    role: 'parent',
    school: null,
  },
];
