import { Bell, Copy, Download, FileText, Loader2, Mail, RefreshCw, Send } from 'lucide-react';
import type { NotificationDeliveryChannel, NotificationDeliveryStats } from '@/app/services/notification.service';
import { cn } from '@/lib/utils';
import { formatDateTime } from './helpers';
import { DonutChart } from './DonutChart';
import { StatPill } from './primitives';
import {
  count,
  countWithRate,
  type ChannelEntry,
  type RoleSlice,
  type TimelineStep,
} from './detailModel';

const CARD = 'rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm';

/** Icons for the channels the backend reports counts for. */
const CHANNEL_ICONS: Partial<Record<NotificationDeliveryChannel, React.ElementType>> = {
  inApp: Bell,
  email: Mail,
  push: Send,
};

/** The attachments column: file rows with a link, or a "No attachments" note. */
export function AttachmentList({ attachments }: { attachments?: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#101828]">Attachments ({attachments?.length ?? 0})</p>
      {attachments?.length ? (
        <div className="space-y-2">
          {attachments.map((attachment) => (
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
  );
}

/** Recipients, delivered, failed and pending, or a note that nothing was reported. */
export function DeliverySummaryCard({ stats }: { stats?: NotificationDeliveryStats }) {
  const total = stats?.totalRecipients;
  return (
    <div className={CARD}>
      <h2 className="mb-4 font-semibold text-[#101828]">Delivery Summary</h2>
      {stats ? (
        <div className="grid grid-cols-2 gap-3">
          <StatPill label="Total Recipients" value={count(total)} />
          <StatPill label="Delivered" value={countWithRate(stats.deliveredCount, total)} accent="emerald" />
          <StatPill label="Failed" value={countWithRate(stats.failedCount, total)} accent="red" />
          <StatPill label="Pending" value={count(stats.pendingCount)} />
        </div>
      ) : (
        <p className="text-sm text-[#667085]">
          Delivery statistics have not been reported for this notification yet.
        </p>
      )}
    </div>
  );
}

/** The donut and legend of recipients per user type. */
export function RoleBreakdownCard({ slices }: { slices: RoleSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  return (
    <div className={CARD}>
      <h2 className="mb-4 font-semibold text-[#101828]">By User Type</h2>
      <div className="flex items-center gap-4">
        <DonutChart data={slices} total={total} />
        <div className="min-w-0 flex-1 space-y-2">
          {slices.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
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
                  ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Reported counts per delivery channel. */
export function ChannelBreakdownCard({ entries }: { entries: ChannelEntry[] }) {
  return (
    <div className={CARD}>
      <h2 className="mb-4 font-semibold text-[#101828]">By Channel</h2>
      <div className="space-y-3">
        {entries.map(({ channel, label, value }) => {
          const Icon = CHANNEL_ICONS[channel] ?? Bell;
          return (
            <div key={channel} className="flex items-center gap-3 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0B63CE]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-[#344054]">{label}</span>
              <span className="font-semibold text-[#101828]">{count(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The stages the record carries a timestamp for, joined by a line. */
export function TimelineCard({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className={CARD}>
      <h2 className="mb-4 font-semibold text-[#101828]">Delivery Timeline</h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'mt-0.5 h-3 w-3 rounded-full',
                  index === steps.length - 1 ? 'bg-emerald-500' : 'bg-[#0B63CE]',
                )}
              />
              {index < steps.length - 1 && <span className="mt-1 h-6 w-px bg-[#E8EDF5]" />}
            </div>
            <div className="pb-2">
              <p className="text-sm font-semibold text-[#101828]">{step.stage}</p>
              <p className="text-xs text-[#667085]">{formatDateTime(step.ts)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ACTION_BUTTON =
  'flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#DCE5F2] text-sm font-semibold text-[#344054] transition hover:bg-[#F8FBFF] disabled:opacity-60';

/** Resend and Duplicate; both are disabled while either is in flight. */
export function ActionsCard({
  isResending,
  isDuplicating,
  onResend,
  onDuplicate,
}: {
  isResending: boolean;
  isDuplicating: boolean;
  onResend: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className={CARD}>
      <h2 className="mb-4 font-semibold text-[#101828]">Actions</h2>
      <div className="space-y-2">
        <button
          type="button"
          onClick={onResend}
          disabled={isResending || isDuplicating}
          className={ACTION_BUTTON}
        >
          {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Resend Notification
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          disabled={isResending || isDuplicating}
          className={ACTION_BUTTON}
        >
          {isDuplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
          Duplicate
        </button>
      </div>
    </div>
  );
}
