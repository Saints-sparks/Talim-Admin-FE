'use client';

import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Users,
  X,
} from 'lucide-react';
import type {
  NotificationDeliveryChannel,
  NotificationResponse,
} from '@/app/services/notification.service';
import { cn } from '@/lib/utils';
import { DELIVERY_OPTIONS, ROLE_COLORS, STATUS_STYLES } from './constants';
import { formatDateTime, getAudienceLabel, getDisplayStatus, getRoleLabel } from './helpers';
import { DonutChart } from './DonutChart';
import { DetailRow, StatPill } from './primitives';

/** Icons for the channels the backend reports counts for. */
const CHANNEL_ICONS: Partial<Record<NotificationDeliveryChannel, React.ElementType>> = {
  inApp: Bell,
  email: Mail,
  push: Send,
};

/**
 * Formats a count, or an em dash when the backend has not reported one.
 *
 * @param value - The count, if present.
 * @returns The formatted value.
 */
function count(value: number | undefined): string {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

/**
 * Formats a count alongside its share of the total.
 *
 * @param value - The count, if present.
 * @param total - The denominator, if present.
 * @returns The formatted value.
 */
function countWithRate(value: number | undefined, total: number | undefined): string {
  if (typeof value !== 'number') return '—';
  if (!total) return value.toLocaleString();
  return `${value.toLocaleString()} · ${Math.min(100, Math.round((value / total) * 100))}%`;
}

/**
 * The full record of one notification: what was sent, to whom, and whatever
 * delivery statistics the backend actually reported.
 *
 * Every number here comes from `notification.deliveryStats` or is shown as an
 * em dash. The previous version filled the gaps with invented figures —
 * `totalRecipients ?? max(delivered + 100, 500)`, a failure rate of exactly
 * 1.2%, per-channel counts at fixed 98/87/81% of delivered, an evenly split
 * per-role donut, and a four-step timeline whose middle steps were
 * `createdAt + 5 minutes` and `+ 25 minutes` — none of which the API ever sent.
 *
 * @param props - The notification and its handlers.
 * @param props.notification - The record to show.
 * @param props.hasPrev - Whether a previous notification exists in the list.
 * @param props.hasNext - Whether a next notification exists in the list.
 * @param props.isResending - True while a resend is in flight.
 * @param props.isDuplicating - True while a duplicate is in flight.
 * @param props.onClose - Returns to the list.
 * @param props.onPrev - Moves to the previous notification.
 * @param props.onNext - Moves to the next notification.
 * @param props.onResend - Re-delivers the notification.
 * @param props.onDuplicate - Copies it into a new one.
 * @returns The detail view.
 */
export function NotificationDetail({
  notification,
  hasPrev,
  hasNext,
  isResending,
  isDuplicating,
  onClose,
  onPrev,
  onNext,
  onResend,
  onDuplicate,
}: {
  notification: NotificationResponse;
  hasPrev: boolean;
  hasNext: boolean;
  isResending: boolean;
  isDuplicating: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onResend: () => void;
  onDuplicate: () => void;
}) {
  const status = getDisplayStatus(notification);
  const stats = notification.deliveryStats;
  const hasStats = Boolean(stats);

  const total = stats?.totalRecipients;
  const senderEmail = notification.senderId?.email ?? notification.senderEmail;

  const roles = notification.recipientRoles ?? [];
  const roleData = roles
    .map((role) => ({
      label: getRoleLabel(role),
      value: stats?.byRole?.[role] ?? 0,
      color: ROLE_COLORS[role] ?? '#94A3B8',
    }))
    .filter((slice) => slice.value > 0);
  const roleTotal = roleData.reduce((sum, slice) => sum + slice.value, 0);

  const channels = (notification.deliveryChannels ?? []).filter(
    (channel): channel is NotificationDeliveryChannel => Boolean(CHANNEL_ICONS[channel]),
  );
  const channelData = channels.map((channel) => ({
    channel,
    label: DELIVERY_OPTIONS.find((option) => option.value === channel)?.label ?? channel,
    value: stats?.byChannel?.[channel as 'inApp' | 'email' | 'push'],
    Icon: CHANNEL_ICONS[channel] ?? Bell,
  }));

  // Only stages the record actually carries a timestamp for.
  const timeline = [
    { stage: 'Created', ts: notification.createdAt },
    { stage: 'Scheduled', ts: notification.scheduledFor ?? stats?.scheduledAt ?? null },
    { stage: 'Sent', ts: stats?.sentAt ?? null },
    { stage: 'Delivered', ts: stats?.deliveredAt ?? null },
  ].filter((step) => Boolean(step.ts));

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-[#344054] hover:text-[#101828]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Notifications
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous notification"
              disabled={!hasPrev}
              onClick={onPrev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5F2] text-[#667085] hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next notification"
              disabled={!hasNext}
              onClick={onNext}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5F2] text-[#667085] hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5F2] text-[#667085] hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#101828]">{notification.title}</h1>
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1',
                STATUS_STYLES[status],
              )}
            >
              {status === 'sent' ? 'Delivered' : status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#667085]">
            Created {formatDateTime(notification.createdAt)} · Sent by{' '}
            <span className="font-semibold text-[#344054]">
              {notification.senderName ?? 'Talim Admin'}
              {senderEmail ? ` (${senderEmail})` : ''}
            </span>
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-xl border border-[#E5EAF2] bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <DetailRow icon={Users} label="Audience" value={getAudienceLabel(notification)} />
                <DetailRow
                  icon={Bell}
                  label="Targeted"
                  value={
                    notification.targetSchools?.length
                      ? notification.targetSchools.map((school) => school.name).join(', ')
                      : 'All Schools'
                  }
                />
                <DetailRow
                  icon={Users}
                  label="User Types"
                  value={roles.length ? roles.map(getRoleLabel).join(', ') : 'All Users'}
                />
                <DetailRow
                  icon={Clock3}
                  label={notification.scheduledFor ? 'Scheduled' : 'Created'}
                  value={formatDateTime(notification.scheduledFor ?? notification.createdAt)}
                />
                <DetailRow
                  icon={Send}
                  label="Channels"
                  value={
                    channelData.length
                      ? channelData.map((entry) => entry.label).join(', ')
                      : 'Not recorded'
                  }
                />

                <div className="pt-2">
                  <p className="mb-3 text-sm font-semibold text-[#101828]">Message</p>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#344054]">
                    {notification.message}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#101828]">
                  Attachments ({notification.attachments?.length ?? 0})
                </p>
                {notification.attachments?.length ? (
                  <div className="space-y-2">
                    {notification.attachments.map((attachment) => (
                      <div
                        key={attachment}
                        className="flex items-center gap-3 rounded-lg border border-[#E8EDF5] p-3 text-sm"
                      >
                        <FileText className="h-5 w-5 shrink-0 text-[#0B63CE]" />
                        <span className="min-w-0 flex-1 truncate text-[#344054]">
                          {attachment.split('/').pop() || attachment}
                        </span>
                        <a
                          href={attachment}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Open attachment"
                          className="shrink-0 text-[#667085] hover:text-[#0B63CE]"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#667085]">No attachments</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-[#101828]">Delivery Summary</h2>
              {hasStats ? (
                <div className="grid grid-cols-2 gap-3">
                  <StatPill label="Total Recipients" value={count(total)} />
                  <StatPill
                    label="Delivered"
                    value={countWithRate(stats?.deliveredCount, total)}
                    accent="emerald"
                  />
                  <StatPill
                    label="Failed"
                    value={countWithRate(stats?.failedCount, total)}
                    accent="red"
                  />
                  <StatPill label="Pending" value={count(stats?.pendingCount)} />
                </div>
              ) : (
                <p className="text-sm text-[#667085]">
                  Delivery statistics have not been reported for this notification yet.
                </p>
              )}
            </div>

            {roleData.length > 0 && (
              <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-semibold text-[#101828]">By User Type</h2>
                <div className="flex items-center gap-4">
                  <DonutChart data={roleData} total={roleTotal} />
                  <div className="min-w-0 flex-1 space-y-2">
                    {roleData.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate text-[#344054]">{item.label}</span>
                        </div>
                        <span className="shrink-0 font-medium text-[#101828]">
                          {item.value.toLocaleString()}{' '}
                          <span className="text-[#667085]">
                            ({roleTotal > 0 ? Math.round((item.value / roleTotal) * 100) : 0}%)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {channelData.length > 0 && (
              <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-semibold text-[#101828]">By Channel</h2>
                <div className="space-y-3">
                  {channelData.map(({ channel, label, value, Icon }) => (
                    <div key={channel} className="flex items-center gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0B63CE]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-[#344054]">{label}</span>
                      <span className="font-semibold text-[#101828]">{count(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {timeline.length > 0 && (
              <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-semibold text-[#101828]">Delivery Timeline</h2>
                <div className="space-y-4">
                  {timeline.map((step, index) => (
                    <div key={step.stage} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'mt-0.5 h-3 w-3 rounded-full',
                            index === timeline.length - 1 ? 'bg-emerald-500' : 'bg-[#0B63CE]',
                          )}
                        />
                        {index < timeline.length - 1 && (
                          <span className="mt-1 h-6 w-px bg-[#E8EDF5]" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-semibold text-[#101828]">{step.stage}</p>
                        <p className="text-xs text-[#667085]">{formatDateTime(step.ts)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-[#101828]">Actions</h2>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onResend}
                  disabled={isResending || isDuplicating}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#DCE5F2] text-sm font-semibold text-[#344054] transition hover:bg-[#F8FBFF] disabled:opacity-60"
                >
                  {isResending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Resend Notification
                </button>
                <button
                  type="button"
                  onClick={onDuplicate}
                  disabled={isResending || isDuplicating}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#DCE5F2] text-sm font-semibold text-[#344054] transition hover:bg-[#F8FBFF] disabled:opacity-60"
                >
                  {isDuplicating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
