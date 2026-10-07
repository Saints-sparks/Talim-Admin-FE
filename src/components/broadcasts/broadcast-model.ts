import type { PillTone } from '@/components/tl/styles';
import type { CreateBroadcastPayload } from '@/types/apiPayloads';
import type {
  AdminUserSearchItem,
  Broadcast,
  BroadcastAudience,
  BroadcastRole,
  BroadcastStatus,
  BroadcastTargetInput,
} from '@/types/broadcasts';
import type { TicketAttachmentInput } from '@/types/tickets';

/** The notifications history page. */
export const HISTORY_ROUTE = '/talimadmindashboard/talimannouncement';

/** Longest title the API accepts (§2 `title (1..120)`). */
export const TITLE_MAX = 120;

/** Longest body the API accepts (§2 `body (1..2000)`). */
export const BODY_MAX = 2000;

/** Quiet period before an audience change is recounted. */
export const PREVIEW_DEBOUNCE_MS = 400;

/** The page a broadcast's button can open (`BroadcastTargetInputDto.page`). */
export type TargetPage = BroadcastTargetInput['page'];

/** One person chosen for an audience's "specific people", as the search found them. */
export type AudiencePerson = Pick<AdminUserSearchItem, 'id' | 'name' | 'role' | 'email' | 'school'>;

/** Audience roles, with the words the composer shows. */
export const ROLE_OPTIONS: readonly { value: BroadcastRole; label: string }[] = [
  { value: 'school_admin', label: 'School admins' },
  { value: 'school_sub_admin', label: 'School sub-admins' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'student', label: 'Students' },
  { value: 'parent', label: 'Parents' },
];

/** The label of a role, plural. */
export const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((o) => [o.value, o.label])) as Record<BroadcastRole, string>;

/** Every deep-link page, labelled; `satisfies` keeps it in step with the generated contract. */
export const TARGET_LABELS = {
  announcements: 'Announcements',
  attendance: 'Attendance',
  children: 'Children (parents)',
  grading: 'Grading',
  leave: 'Leave',
  messages: 'Messages',
  payments: 'Payments',
  resources: 'Resources',
  results: 'Results',
  settings: 'Settings',
  subjects: 'Subjects',
  support: 'Support',
  timetable: 'Timetable',
} as const satisfies Record<TargetPage, string>;

/** The deep-link pages, in the order the select lists them. */
export const TARGET_PAGES = Object.keys(TARGET_LABELS) as TargetPage[];

/** Label and pill tone per status. */
export const BROADCAST_STATUS_META: Record<BroadcastStatus, { label: string; tone: PillTone }> = {
  scheduled: { label: 'Scheduled', tone: 'warning' },
  sending: { label: 'Sending', tone: 'info' },
  sent: { label: 'Sent', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
  failed: { label: 'Failed', tone: 'danger' },
};

/** The stat columns, in the contract's order. */
export const STAT_COLUMNS: readonly { key: keyof Broadcast['stats']; label: string }[] = [
  { key: 'recipients', label: 'Recipients' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'read', label: 'Read' },
  { key: 'pushSent', label: 'Push sent' },
  { key: 'emailSent', label: 'Email sent' },
  { key: 'failed', label: 'Failed' },
];

/** The history's status filters, `all` first. */
export const HISTORY_FILTERS: readonly (BroadcastStatus | 'all')[] = ['all', 'scheduled', 'sending', 'sent', 'cancelled', 'failed'];

/** Prefilled messages the composer offers (kept from the pre-v1.5 composer). */
export const TEMPLATES: readonly { name: string; title: string; body: string }[] = [
  {
    name: 'Maintenance',
    title: 'Scheduled maintenance',
    body: 'Talim will undergo scheduled maintenance on [DATE] from [START] to [END]. The platform may be unavailable during this time. Thank you for your patience.',
  },
  {
    name: 'New feature',
    title: 'Something new on Talim',
    body: 'We have added new improvements to Talim. Open the app to see what has changed.',
  },
  {
    name: 'Policy update',
    title: 'Our policies have been updated',
    body: 'Talim’s policies have been updated. Please review the latest platform guidelines.',
  },
  {
    name: 'Subscription reminder',
    title: 'Subscription renewal reminder',
    body: 'This is a reminder that your school’s Talim subscription renews soon. Contact Talim support if you need help.',
  },
];

/** Every field of the composer except attachments, which the picker owns. */
export interface BroadcastForm {
  title: string;
  body: string;
  target: TargetPage | '';
  /** `everyone` sends `{ all: true }`; `custom` builds schools × roles ∪ people. */
  audienceMode: 'everyone' | 'custom';
  schoolScope: 'all' | 'selected';
  schoolIds: string[];
  roles: BroadcastRole[];
  /** Specific people, found with `GET /admin/users/search`; their ids go in `audience.userIds`. */
  people: AudiencePerson[];
  push: boolean;
  email: boolean;
  when: 'now' | 'later';
  /** `yyyy-mm-dd`, browser-local. */
  date: string;
  /** `HH:mm`, browser-local. */
  time: string;
}

/** A blank composer. */
export const EMPTY_BROADCAST_FORM: BroadcastForm = {
  title: '',
  body: '',
  target: '',
  audienceMode: 'custom',
  schoolScope: 'all',
  schoolIds: [],
  roles: [],
  people: [],
  push: true,
  email: false,
  when: 'now',
  date: '',
  time: '',
};

/** Form fields that can carry an error. */
export type BroadcastField = 'title' | 'body' | 'audience' | 'schedule';

/** Errors by field; a missing key means the field is fine. */
export type BroadcastErrors = Partial<Record<BroadcastField, string>>;

/** The audience part of the form. */
export type AudienceFields = Pick<BroadcastForm, 'audienceMode' | 'schoolScope' | 'schoolIds' | 'roles' | 'people'>;

/**
 * The audience the form describes. Everyone is `{ all: true }`; otherwise
 * the chosen roles (in the chosen schools, or every school when "All
 * schools"; every role in the chosen schools when none is ticked) plus any
 * specific people.
 *
 * @param form - The form.
 * @returns The audience for preview and send.
 */
export function buildAudience(form: AudienceFields): BroadcastAudience {
  if (form.audienceMode === 'everyone') return { all: true };
  return {
    ...(form.schoolScope === 'selected' && form.schoolIds.length ? { schoolIds: [...form.schoolIds] } : {}),
    ...(form.roles.length ? { roles: [...form.roles] } : {}),
    ...(form.people.length ? { userIds: form.people.map((person) => person.id) } : {}),
  };
}

/**
 * Why the audience cannot be sent to, or `null` when it can. "Selected
 * schools" needs at least one school (with no role chosen it is everyone
 * there); "All schools" needs a role or a person, else it would be everyone
 * (which is its own choice).
 *
 * @param form - The form.
 * @returns The problem, or `null`.
 */
export function validateAudience(form: AudienceFields): string | null {
  if (form.audienceMode === 'everyone') return null;
  if (form.schoolScope === 'selected' && form.schoolIds.length === 0) {
    return 'Choose at least one school, or switch to All schools.';
  }
  // Selected schools without roles are everyone there (the API confirms it).
  if (form.roles.length === 0 && form.schoolScope === 'all' && form.people.length === 0) {
    return 'Choose at least one role or person, or send to everyone.';
  }
  return null;
}

/**
 * Combines the browser-local date and time inputs into an ISO timestamp.
 * This console is platform-level, so the browser's time zone is used, not a
 * school's.
 *
 * @param date - A `yyyy-mm-dd` value.
 * @param time - An `HH:mm` value.
 * @returns The ISO timestamp, or `null` when either part is missing or invalid.
 */
export function toSendAtIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Checks the whole form the way the API will, so the admin hears about a
 * problem before the confirm step.
 *
 * @param form - The form.
 * @param now - Current time, injectable for tests.
 * @returns Errors by field; empty when the form can be sent.
 */
export function validateBroadcastForm(form: BroadcastForm, now: number = Date.now()): BroadcastErrors {
  const errors: BroadcastErrors = {};
  const title = form.title.trim();
  const body = form.body.trim();
  if (!title) errors.title = 'Give the notification a title.';
  else if (title.length > TITLE_MAX) errors.title = `Keep the title to ${TITLE_MAX} characters.`;
  if (!body) errors.body = 'Write the message.';
  else if (body.length > BODY_MAX) errors.body = `Keep the message to ${BODY_MAX.toLocaleString()} characters.`;
  const audience = validateAudience(form);
  if (audience) errors.audience = audience;
  if (form.when === 'later') {
    const iso = toSendAtIso(form.date, form.time);
    if (!iso) errors.schedule = 'Pick the date and time to send it.';
    else if (new Date(iso).getTime() <= now) errors.schedule = 'That time has passed. Pick a time in the future.';
  }
  return errors;
}

/**
 * The `POST /admin/broadcasts` body. In-app delivery is implied; `sendAt` is
 * sent only when scheduling; attachments go as their https URLs, as the API
 * stores them.
 *
 * @param form - A validated form.
 * @param attachments - Files already uploaded.
 * @returns The request body.
 */
export function buildBroadcastPayload(form: BroadcastForm, attachments: TicketAttachmentInput[]): CreateBroadcastPayload {
  const sendAt = form.when === 'later' ? toSendAtIso(form.date, form.time) : null;
  return {
    title: form.title.trim(),
    body: form.body.trim(),
    ...(attachments.length ? { attachments: attachments.map((file) => file.url) } : {}),
    ...(form.target ? { target: { page: form.target } } : {}),
    audience: buildAudience(form),
    channels: { push: form.push, email: form.email },
    ...(sendAt ? { sendAt } : {}),
  };
}

/**
 * The channels a broadcast went out on, in words ("In-app, push and email").
 *
 * @param channels - The optional channels.
 * @param channels.push - Push on.
 * @param channels.email - Email on.
 * @returns The phrase.
 */
export function channelsLabel(channels: { push: boolean; email: boolean }): string {
  const parts = ['In-app', ...(channels.push ? ['push'] : []), ...(channels.email ? ['email'] : [])];
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * Who a broadcast went to, in one line ("Teachers, Parents · 2 schools").
 * Schools without roles are everyone there.
 *
 * @param broadcast - The broadcast.
 * @returns The phrase.
 */
export function audienceLabel(broadcast: Pick<Broadcast, 'audience'>): string {
  const { audience } = broadcast;
  if (audience.all) return 'Everyone';
  const parts: string[] = [];
  const schoolCount = audience.schoolIds.length;
  let where = 'all schools';
  if (schoolCount === 1) where = audience.schools[0]?.name || '1 school';
  else if (schoolCount > 1) where = `${schoolCount} schools`;
  if (audience.roles.length) {
    parts.push(`${audience.roles.map((r) => ROLE_LABELS[r] ?? r).join(', ')} · ${where}`);
  } else if (schoolCount) {
    parts.push(`Everyone · ${where}`);
  }
  if (audience.userIds.length) parts.push(`${audience.userIds.length} ${audience.userIds.length === 1 ? 'person' : 'people'}`);
  return parts.join(' + ') || 'No audience';
}

/**
 * A count for a stat ("1,204"), or an em dash when absent.
 *
 * @param value - The count.
 * @returns The formatted count.
 */
export function formatCount(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : '—';
}

/**
 * A share of the recipients ("62%"), or `undefined` without recipients.
 *
 * @param value - The part.
 * @param recipients - The whole.
 * @returns The percentage, rounded, capped at 100.
 */
export function percentOf(value: number, recipients: number): string | undefined {
  if (!recipients || !Number.isFinite(value)) return undefined;
  return `${Math.min(100, Math.round((value / recipients) * 100))}%`;
}

/**
 * The time a broadcast is shown against: when it was sent, else when it is due, else when it was made.
 *
 * @param broadcast - The broadcast.
 * @returns An ISO timestamp.
 */
export function whenOf(broadcast: Pick<Broadcast, 'sentAt' | 'sendAt' | 'createdAt'>): string {
  return broadcast.sentAt ?? broadcast.sendAt ?? broadcast.createdAt;
}

/**
 * Today's date for a `<input type="date" min>`, in the browser's zone.
 *
 * @param now - Current time, injectable for tests.
 * @returns `yyyy-mm-dd`.
 */
export function todayInput(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
