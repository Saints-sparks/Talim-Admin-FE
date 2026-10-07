/**
 * Fixtures shaped like the v1.5 contract (`talimBE-V2/docs/v1.5-platform-sync.md`
 * §1 and §2), for building and testing the support desk and broadcasts while
 * the backend is still being written.
 */
import type {
  Broadcast,
  BroadcastPreview,
  Ticket,
  TicketDeskCounts,
  TicketPage,
  TicketSummary,
} from '@/types/v15';

/** The signed-in platform admin in tests. */
export const ADMIN_USER = {
  userId: 'u-admin',
  email: 'ops@talim.test',
  role: 'admin',
  firstName: 'Ada',
  lastName: 'Admin',
};

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
    schoolId: 's1',
    school: { id: 's1', name: 'Greenfield Academy' },
    requester: { userId: 'u-parent', role: 'parent', name: 'Bola Ade', email: 'bola@parent.test' },
    area: 'payments',
    subject: 'Card payment failed twice',
    status: 'open',
    priority: 'high',
    assigneeId: null,
    assignee: null,
    lastActivityAt: '2026-10-06T08:00:00.000Z',
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
        author: { id: 'u-admin', name: 'Ada Admin', role: 'admin' },
        body: 'Thanks, we are checking with the provider.',
        attachments: [],
        internal: false,
        createdAt: '2026-10-05T10:00:00.000Z',
      },
      {
        id: 'm3',
        author: { id: 'u-admin', name: 'Ada Admin', role: 'admin' },
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
    audience: { schoolIds: ['s1', 's2'], roles: ['teacher', 'parent'] },
    channels: { push: true, email: false },
    status: 'sent',
    sendAt: null,
    sentAt: '2026-10-04T09:00:00.000Z',
    createdAt: '2026-10-04T08:59:00.000Z',
    schools: [
      { id: 's1', name: 'Greenfield Academy' },
      { id: 's2', name: 'Hillcrest College' },
    ],
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
  byRole: { teacher: 120, parent: 1114 },
};
