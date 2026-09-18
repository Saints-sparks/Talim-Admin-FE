'use client';

import { Bell, Eye, Send } from 'lucide-react';
import type { NotificationResponse } from '@/app/services/notification.service';
import { cn } from '@/lib/utils';
import { EmptyState, LoadingState } from '@/components/StateComponents';
import { SOURCE_STYLES, STATUS_STYLES } from './constants';
import {
  formatDateTime,
  getAudienceLabel,
  getDisplayStatus,
  getRoleLabel,
  getSourceLabel,
} from './helpers';

const GRID = 'lg:grid-cols-[minmax(240px,1.5fr)_160px_180px_130px_160px_80px]';

/**
 * The notification list.
 *
 * @param props - The rows and their handlers.
 * @param props.notifications - The rows to show.
 * @param props.isLoading - True while the first page is loading.
 * @param props.onView - Opens a notification's detail view.
 * @returns The table element.
 */
export function NotificationTable({
  notifications,
  isLoading,
  onView,
}: {
  notifications: NotificationResponse[];
  isLoading: boolean;
  onView: (notification: NotificationResponse) => void;
}) {
  if (isLoading) {
    return (
      <div className="min-h-[360px]">
        <LoadingState message="Loading notifications…" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<Bell className="h-10 w-10 text-[#94A3B8]" />}
          title="No notifications found"
          message="Talim and school notification records will appear here."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className={cn(
          'hidden gap-4 border-b border-[#E8EDF5] px-4 py-3 text-xs font-semibold uppercase text-[#667085] lg:grid',
          GRID,
        )}
      >
        <span>Title</span>
        <span>Audience</span>
        <span>Sent By</span>
        <span>Status</span>
        <span>Sent / Scheduled</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-[#EEF2F7]">
        {notifications.map((notification) => {
          const source = notification.source ?? 'system';
          const status = getDisplayStatus(notification);
          const roles = notification.recipientRoles ?? [];
          const senderEmail = notification.senderId?.email ?? notification.senderEmail;

          return (
            <div
              key={notification._id}
              className={cn('grid gap-4 px-4 py-4 transition hover:bg-[#F8FBFF]', GRID)}
            >
              <button
                type="button"
                onClick={() => onView(notification)}
                className="flex min-w-0 gap-3 text-left"
              >
                <span
                  className={cn(
                    'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    SOURCE_STYLES[source],
                  )}
                >
                  <Send className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#101828]">
                    {notification.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-xs text-[#667085]">
                    {notification.message}
                  </span>
                  <span
                    className={cn(
                      'mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
                      SOURCE_STYLES[source],
                    )}
                  >
                    {getSourceLabel(source)} Notification
                  </span>
                </span>
              </button>

              <div className="text-sm">
                <p className="font-medium text-[#344054]">{getAudienceLabel(notification)}</p>
                <p className="text-xs text-[#667085]">
                  {roles.length ? roles.map(getRoleLabel).join(', ') : 'All Users'}
                </p>
              </div>

              <div className="min-w-0 text-sm">
                <p className="truncate font-medium text-[#344054]">
                  {notification.senderName ?? 'Talim Admin'}
                </p>
                {/* No placeholder address: an unpopulated sender shows nothing. */}
                {senderEmail && <p className="truncate text-xs text-[#667085]">{senderEmail}</p>}
              </div>

              <div>
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1',
                    STATUS_STYLES[status],
                  )}
                >
                  {status === 'sent' ? 'Delivered' : status}
                </span>
              </div>

              <div className="text-sm text-[#344054]">
                {formatDateTime(notification.scheduledFor ?? notification.createdAt)}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={`View ${notification.title}`}
                  onClick={() => onView(notification)}
                  className="rounded-lg border border-[#DCE5F2] p-2 text-[#667085] transition hover:bg-white"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
