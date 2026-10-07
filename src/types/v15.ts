/**
 * Hand-written types for the v1.5 routes this console calls.
 *
 * Source: `talimBE-V2/docs/v1.5-platform-sync.md` (contract of 2026-10-06),
 * §1 Tickets and §2 Talim Admin notifications (broadcasts). The backend is
 * being built in parallel, so these are NOT yet in `src/types/api.d.ts`.
 *
 * When `talimBE-V2/docs/api-types.d.ts` carries `/tickets/*` and
 * `/admin/broadcasts/*`, run `npm run types:api` and replace each type below
 * with its generated `Schema<…>` / `ResponseBody<…>` / `RequestBody<…>`
 * equivalent (see `src/types/apiContract.ts`), then delete this file.
 *
 * Fields tagged `NOT IN CONTRACT` are ones the screens need that the
 * contract does not define yet; the screens degrade gracefully without them.
 */
import type { Schema } from './apiContract';

// ─── Shared ───────────────────────────────────────────────────────────────────

/**
 * Pagination block of a `{ data, meta }` list, as every paginated route in
 * the API serialises it. The contract writes only `meta`.
 */
export interface PageMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

/** A file on a ticket message or a broadcast (§1 `attachments`). */
export interface Attachment {
  url: string;
  name: string;
  mimeType: string;
  /** Bytes. */
  size: number;
}

// ─── §1 Tickets ───────────────────────────────────────────────────────────────

/** Which desk a ticket sits on. */
export type TicketDesk = 'school' | 'talim';

/** What the ticket is about (§1 `area`). */
export type TicketArea =
  | 'grading'
  | 'attendance'
  | 'timetable'
  | 'messages'
  | 'signing_in'
  | 'payments'
  | 'fees'
  | 'results'
  | 'transport'
  | 'behaviour'
  | 'other';

/** Workflow status (§1 `status`). A resolved ticket can be reopened within 7 days. */
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed';

/** Triage priority (§1 `priority`). */
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

/** The roles that raise tickets or write on them. */
export type TicketRole = 'student' | 'parent' | 'teacher' | 'school_admin' | 'school_sub_admin' | 'admin';

/** Who raised the ticket (§1 `requester`). */
export interface TicketRequester {
  userId: string;
  role: TicketRole;
  /** NOT IN CONTRACT: the requester's display name, for the queue and the detail page. */
  name?: string;
  /** NOT IN CONTRACT: the requester's email, for the detail page (desk staff only). */
  email?: string;
}

/** The author of one message (§1 `messages[].author`). */
export interface TicketAuthor {
  id: string;
  name: string;
  role: TicketRole;
}

/** One message in a ticket's thread (§1 `messages[]`). */
export interface TicketMessage {
  id: string;
  author: TicketAuthor;
  /** 1..5000 characters. */
  body: string;
  attachments: Attachment[];
  /** An internal note: desk staff only, never sent to the requester. */
  internal: boolean;
  createdAt: string;
}

/** An id and a display name. */
export interface IdName {
  id: string;
  name: string;
}

/**
 * One row of a desk list. The contract names `TicketSummary` but does not
 * spell it out; this is the `Ticket` model without `messages`.
 */
export interface TicketSummary {
  /** NOT IN CONTRACT by name: the ticket's id (the model shows only `reference`). */
  id: string;
  /** "TS-XXXXX" on the Talim desk; the school desk keeps its complaint format. */
  reference: string;
  desk: TicketDesk;
  schoolId: string | null;
  /** NOT IN CONTRACT: the school's name, for the "All schools" view and the detail page. */
  school?: IdName | null;
  requester: TicketRequester;
  childId?: string | null;
  area: TicketArea;
  /** 3..140 characters. */
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string | null;
  /** NOT IN CONTRACT: the assignee's name, so the queue need not look staff up per row. */
  assignee?: IdName | null;
  escalatedFrom?: 'school' | null;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  lastActivityAt: string;
  /** NOT IN CONTRACT: when the ticket was raised (Mongo `createdAt`). */
  createdAt?: string;
}

/** A ticket with its thread (`GET /tickets/:id`; desk staff also get internal notes). */
export interface Ticket extends TicketSummary {
  messages: TicketMessage[];
}

/** Query of `GET /tickets/desk/talim`. */
export interface TicketDeskQuery {
  status?: TicketStatus;
  area?: TicketArea;
  priority?: TicketPriority;
  /**
   * A staff user's id. NOT IN CONTRACT: how to ask for unassigned tickets;
   * this console sends `unassigned`.
   */
  assigneeId?: string;
  /** NOT IN CONTRACT: the Talim desk's school filter (the school desk is scoped to its own school). */
  schoolId?: string;
  q?: string;
  page?: number;
  limit?: number;
  /** `all` also lists school-desk tickets, read-only. */
  scope?: 'all';
}

/** One page of a desk list. */
export interface TicketPage {
  data: TicketSummary[];
  meta: PageMeta;
}

/** `GET /tickets/desk/talim/counts`. There is no `closed` count in the contract. */
export interface TicketDeskCounts {
  open: number;
  in_progress: number;
  waiting_on_user: number;
  resolved: number;
  unassigned: number;
  mine: number;
}

/** Body of `POST /tickets/:id/messages` from desk staff. */
export interface PostTicketMessagePayload {
  body: string;
  attachments?: Attachment[];
  internal?: boolean;
}

/**
 * Body of `PATCH /tickets/:id`. NOT IN CONTRACT: how to unassign; this
 * console sends `assigneeId: null`.
 */
export interface UpdateTicketPayload {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string | null;
}

// ─── §2 Broadcasts ────────────────────────────────────────────────────────────

/** The roles a broadcast audience can pick (§2 `audience.roles`). */
export type BroadcastRole = 'teacher' | 'student' | 'parent' | 'school_admin' | 'school_sub_admin';

/**
 * Who a broadcast goes to. The parts combine as the union of
 * (schools × roles) and `userIds`; `all` means every active user.
 *
 * NOT IN CONTRACT: whether `roles` without `schoolIds` means those roles in
 * every school. This console relies on it for "Teachers in all schools".
 */
export interface BroadcastAudience {
  all?: boolean;
  schoolIds?: string[];
  roles?: BroadcastRole[];
  userIds?: string[];
}

/** Response of `POST /admin/broadcasts/preview`. */
export interface BroadcastPreview {
  recipients: number;
  bySchool: { schoolId: string; name: string; count: number }[];
  byRole: Partial<Record<BroadcastRole, number>>;
}

/**
 * Where a broadcast's button leads. The contract names `NotificationTarget`;
 * this is the generated `NotificationTargetDto`, already in the contract.
 */
export type NotificationTarget = Schema<'NotificationTargetDto'>;

/** The optional channels; in-app delivery is always on. */
export interface BroadcastChannels {
  push: boolean;
  email: boolean;
}

/** Body of `POST /admin/broadcasts`. */
export interface CreateBroadcastPayload {
  /** 1..120 characters. */
  title: string;
  /** 1..2000 characters. */
  body: string;
  attachments?: Attachment[];
  target?: NotificationTarget;
  audience: BroadcastAudience;
  channels: BroadcastChannels;
  /** ISO timestamp; omitted to send now. */
  sendAt?: string;
}

/** Response of `POST /admin/broadcasts`. */
export interface CreateBroadcastResult {
  id: string;
  status: 'scheduled' | 'sending';
  recipientsEstimate: number;
}

/**
 * A broadcast's lifecycle. The contract names only `scheduled` and `sending`
 * (on create) and "cancel while scheduled"; NOT IN CONTRACT: the rest.
 */
export type BroadcastStatus = 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed';

/** Delivery counters of one broadcast (§2 `stats`). */
export interface BroadcastStats {
  recipients: number;
  delivered: number;
  read: number;
  pushSent: number;
  emailSent: number;
  failed: number;
}

/**
 * One broadcast, as `GET /admin/broadcasts` and `GET /admin/broadcasts/:id`
 * return it. The contract defines only `stats`; NOT IN CONTRACT: every other
 * field, taken from the create body plus the lifecycle timestamps.
 */
export interface Broadcast {
  id: string;
  title: string;
  body: string;
  attachments?: Attachment[];
  target?: NotificationTarget | null;
  audience: BroadcastAudience;
  channels: BroadcastChannels;
  status: BroadcastStatus;
  /** When it is (or was) due; absent for send-now. */
  sendAt?: string | null;
  sentAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  /** NOT IN CONTRACT: the admin who sent it. */
  createdBy?: IdName | null;
  /** NOT IN CONTRACT: the selected schools' names, so the audience reads without a lookup per id. */
  schools?: IdName[];
  stats: BroadcastStats;
}

/** Query of `GET /admin/broadcasts`. */
export interface BroadcastListQuery {
  status?: BroadcastStatus;
  page?: number;
  limit?: number;
}

/** One page of broadcasts, newest first. */
export interface BroadcastPage {
  data: Broadcast[];
  meta: PageMeta;
}
