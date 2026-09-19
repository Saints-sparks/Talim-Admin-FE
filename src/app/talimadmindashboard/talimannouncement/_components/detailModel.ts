import type {
  NotificationDeliveryChannel,
  NotificationResponse,
} from '@/app/services/notification.service';
import { DELIVERY_OPTIONS, ROLE_COLORS } from './constants';
import { getRoleLabel } from './helpers';

/** The channels the backend reports counts for; other channels are not listed. */
export const REPORTED_CHANNELS = ['inApp', 'email', 'push'] as const;

/** A channel the delivery statistics cover. */
export type ReportedChannel = (typeof REPORTED_CHANNELS)[number];

/**
 * Formats a count, or an em dash when the backend has not reported one.
 *
 * @param value - The count, if present.
 * @returns The formatted value.
 */
export function count(value: number | undefined): string {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

/**
 * Formats a count alongside its share of the total.
 *
 * @param value - The count, if present.
 * @param total - The denominator, if present.
 * @returns The formatted value.
 */
export function countWithRate(value: number | undefined, total: number | undefined): string {
  if (typeof value !== 'number') return '—';
  if (!total) return value.toLocaleString();
  return `${value.toLocaleString()} · ${Math.min(100, Math.round((value / total) * 100))}%`;
}

/** One slice of the by-user-type donut. */
export interface RoleSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * The by-user-type slices: only roles the notification was sent to and the
 * backend reported a positive count for.
 *
 * @param notification - The record.
 * @returns The slices, in the order of `recipientRoles`.
 */
export function roleSlices(notification: NotificationResponse): RoleSlice[] {
  const stats = notification.deliveryStats;
  return (notification.recipientRoles ?? [])
    .map((role) => ({
      label: getRoleLabel(role),
      value: stats?.byRole?.[role] ?? 0,
      color: ROLE_COLORS[role] ?? '#94A3B8',
    }))
    .filter((slice) => slice.value > 0);
}

/** One row of the by-channel list. */
export interface ChannelEntry {
  channel: NotificationDeliveryChannel;
  label: string;
  /** The reported count, or `undefined` when the backend did not report one. */
  value: number | undefined;
}

/**
 * The by-channel rows: only channels the notification used and the backend
 * reports counts for.
 *
 * @param notification - The record.
 * @returns One entry per channel, labelled for display.
 */
export function channelEntries(notification: NotificationResponse): ChannelEntry[] {
  const stats = notification.deliveryStats;
  return (notification.deliveryChannels ?? [])
    .filter((channel): channel is ReportedChannel => (REPORTED_CHANNELS as readonly string[]).includes(channel))
    .map((channel) => ({
      channel,
      label: DELIVERY_OPTIONS.find((option) => option.value === channel)?.label ?? channel,
      value: stats?.byChannel?.[channel],
    }));
}

/** One stage of the delivery timeline. */
export interface TimelineStep {
  stage: string;
  ts: string;
}

/**
 * The delivery timeline: only stages the record actually carries a timestamp for.
 *
 * @param notification - The record.
 * @returns Created, Scheduled, Sent and Delivered, minus the ones without a time.
 */
export function timelineSteps(notification: NotificationResponse): TimelineStep[] {
  const stats = notification.deliveryStats;
  const stages: Array<{ stage: string; ts: string | null | undefined }> = [
    { stage: 'Created', ts: notification.createdAt },
    { stage: 'Scheduled', ts: notification.scheduledFor ?? stats?.scheduledAt ?? null },
    { stage: 'Sent', ts: stats?.sentAt ?? null },
    { stage: 'Delivered', ts: stats?.deliveredAt ?? null },
  ];
  return stages.filter((step): step is TimelineStep => Boolean(step.ts));
}

/**
 * Who the notification was aimed at, by school.
 *
 * @param notification - The record.
 * @returns The school names, or "All Schools" when none were targeted.
 */
export function targetedLabel(notification: NotificationResponse): string {
  return notification.targetSchools?.length
    ? notification.targetSchools.map((school) => school.name).join(', ')
    : 'All Schools';
}

/**
 * Who the notification was aimed at, by role.
 *
 * @param notification - The record.
 * @returns The role labels, or "All Users" when no roles were chosen.
 */
export function userTypesLabel(notification: NotificationResponse): string {
  const roles = notification.recipientRoles ?? [];
  return roles.length ? roles.map(getRoleLabel).join(', ') : 'All Users';
}

/**
 * The line under the title: who sent it, with their email when known.
 *
 * @param notification - The record.
 * @returns e.g. "Ada (ada@talim.test)"; "Talim Admin" when the sender is unknown.
 */
export function senderLabel(notification: NotificationResponse): string {
  const email = notification.senderId?.email ?? notification.senderEmail;
  return `${notification.senderName ?? 'Talim Admin'}${email ? ` (${email})` : ''}`;
}
