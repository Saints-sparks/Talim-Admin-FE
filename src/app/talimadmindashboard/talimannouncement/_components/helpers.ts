import type {
  CreateNotificationRequest,
  NotificationResponse,
  NotificationSource,
  RecipientRole,
} from '@/app/services/notification.service';
import { MESSAGE_MAX_LENGTH, ROLE_OPTIONS } from './constants';
import type { DisplayStatus, NotificationFormState } from './types';

/**
 * Formats a timestamp for the list and detail views.
 *
 * @param value - An ISO timestamp, or nothing.
 * @returns The formatted date and time, or an em dash.
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * The status to show for a notification. A future `scheduledFor` outranks the
 * delivery status; once the time has passed the real status takes over, so a
 * scheduled-and-since-delivered notification no longer reads "scheduled".
 *
 * @param notification - The record.
 * @param now - Current time, injectable for tests.
 * @returns The status the UI displays.
 */
export function getDisplayStatus(
  notification: NotificationResponse,
  now: number = Date.now(),
): DisplayStatus {
  const scheduledFor = notification.scheduledFor
    ? new Date(notification.scheduledFor).getTime()
    : null;
  const isPending = notification.status !== 'sent' && notification.status !== 'failed';

  if (scheduledFor && !Number.isNaN(scheduledFor) && scheduledFor > now && isPending) {
    return 'scheduled';
  }
  if (notification.status === 'sent') return 'sent';
  if (notification.status === 'failed') return 'failed';
  return 'pending';
}

/**
 * The human label for a source.
 *
 * @param source - The source, if the API set one.
 * @returns The label.
 */
export function getSourceLabel(source?: NotificationSource): string {
  if (source === 'school') return 'School';
  if (source === 'talim') return 'Talim';
  return 'System';
}

/**
 * A short description of who a notification went to.
 *
 * @param notification - The record.
 * @returns The audience label.
 */
export function getAudienceLabel(notification: NotificationResponse): string {
  const schools = notification.targetSchools?.length ?? 0;
  const roles = notification.recipientRoles?.length ?? 0;
  if (!schools && !roles) return 'Global';
  if (schools > 1) return `${schools} Schools`;
  if (schools === 1) return notification.targetSchools[0]?.name || '1 School';
  return `${roles} User Type${roles > 1 ? 's' : ''}`;
}

/**
 * The display label for an audience role, falling back to the raw value so an
 * unfamiliar role never renders as blank.
 *
 * @param role - The role value.
 * @returns The label.
 */
export function getRoleLabel(role: RecipientRole | string): string {
  return (
    ROLE_OPTIONS.find((option) => option.value === role)?.label ??
    role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * True when a notification matches a free-text search over the fields the
 * list actually shows.
 *
 * @param notification - The record.
 * @param query - The search term, lower-cased by the caller.
 * @returns True on a match.
 */
export function matchesNotificationSearch(
  notification: NotificationResponse,
  query: string,
): boolean {
  if (!query) return true;
  return [
    notification.title,
    notification.message,
    notification.senderName,
    notification.sourceLabel,
    notification.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(query);
}

/**
 * Combines the form's date and time inputs into an ISO timestamp.
 *
 * @param date - A `yyyy-mm-dd` value.
 * @param time - An `HH:mm` value.
 * @returns The ISO timestamp, or `null` when either part is missing or invalid.
 */
export function toScheduledIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Client-side validation that mirrors what the server will reject, so the user
 * hears about a problem before the round trip.
 *
 * @param form - The current form state.
 * @returns The first problem found, or `null` when the form is sendable.
 */
export function validateNotificationForm(form: NotificationFormState): string | null {
  if (!form.title.trim()) return 'Give the notification a title.';
  if (!form.message.trim()) return 'Write a message.';
  if (form.message.length > MESSAGE_MAX_LENGTH) {
    return `The message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
  }
  if (form.audienceMode === 'schools' && form.selectedSchools.length === 0) {
    return 'Select at least one school.';
  }
  if (form.recipientRoles.length === 0) return 'Select at least one user type.';
  if (form.deliveryMethods.length === 0) return 'Select at least one delivery method.';
  if (form.scheduleMode === 'later') {
    const iso = toScheduledIso(form.scheduledDate, form.scheduledTime);
    if (!iso) return 'Pick the date and time to send this.';
    if (new Date(iso).getTime() <= Date.now()) return 'Pick a time in the future.';
  }
  return null;
}

/**
 * Builds the `POST /notifications` body from the form.
 *
 * Only fields `CreateNotificationDto` declares are sent — the API runs
 * `forbidNonWhitelisted`. `scheduledFor` and `isScheduled` are top-level
 * fields on that DTO; putting them in `metadata` (as this page used to) meant
 * the server never saw them and every "schedule for later" went out at once.
 *
 * @param form - The validated form state.
 * @param senderId - The signed-in administrator's id.
 * @returns The request body.
 */
export function buildCreatePayload(
  form: NotificationFormState,
  senderId: string,
): CreateNotificationRequest {
  const scheduledFor =
    form.scheduleMode === 'later' ? toScheduledIso(form.scheduledDate, form.scheduledTime) : null;

  return {
    title: form.title.trim(),
    message: form.message.trim(),
    senderId,
    priority: form.priority,
    recipientRoles: form.recipientRoles,
    targetSchools: form.audienceMode === 'schools' ? form.selectedSchools : [],
    source: 'talim',
    category: form.category,
    type: `talim_${form.category}`,
    deliveryChannels: form.deliveryMethods,
    ...(scheduledFor ? { scheduledFor, isScheduled: true } : {}),
  };
}
