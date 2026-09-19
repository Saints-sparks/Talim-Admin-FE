'use client';

import { Bell, ChevronLeft, ChevronRight, Clock3, Send, Users, X } from 'lucide-react';
import type { NotificationResponse } from '@/app/services/notification.service';
import { cn } from '@/lib/utils';
import { STATUS_STYLES } from './constants';
import { formatDateTime, getAudienceLabel, getDisplayStatus } from './helpers';
import { DetailRow } from './primitives';
import {
  channelEntries,
  roleSlices,
  senderLabel,
  targetedLabel,
  timelineSteps,
  userTypesLabel,
} from './detailModel';
import {
  ActionsCard,
  AttachmentList,
  ChannelBreakdownCard,
  DeliverySummaryCard,
  RoleBreakdownCard,
  TimelineCard,
} from './DetailPanels';

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
  const roleData = roleSlices(notification);
  const channelData = channelEntries(notification);
  const timeline = timelineSteps(notification);

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
            <span className="font-semibold text-[#344054]">{senderLabel(notification)}</span>
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-xl border border-[#E5EAF2] bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <DetailRow icon={Users} label="Audience" value={getAudienceLabel(notification)} />
                <DetailRow icon={Bell} label="Targeted" value={targetedLabel(notification)} />
                <DetailRow icon={Users} label="User Types" value={userTypesLabel(notification)} />
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

              <AttachmentList attachments={notification.attachments} />
            </div>
          </div>

          <div className="space-y-4">
            <DeliverySummaryCard stats={notification.deliveryStats} />
            {roleData.length > 0 && <RoleBreakdownCard slices={roleData} />}
            {channelData.length > 0 && <ChannelBreakdownCard entries={channelData} />}
            {timeline.length > 0 && <TimelineCard steps={timeline} />}
            <ActionsCard
              isResending={isResending}
              isDuplicating={isDuplicating}
              onResend={onResend}
              onDuplicate={onDuplicate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
