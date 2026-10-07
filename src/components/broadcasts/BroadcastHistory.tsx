'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { broadcastService } from '@/app/services/broadcast.service';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { Banner, EmptyBlock, ErrorCard, SkeletonRows } from '@/components/tl/States';
import {
  cardFrame,
  chip,
  focusRing,
  ghostButton,
  pagePad,
  pageSubtitle,
  pageTitle,
  pill,
  pillTone,
  primaryButton,
  tableCell,
  tableHead,
} from '@/components/tl/styles';
import type { Broadcast, BroadcastStatus } from '@/types/broadcasts';
import { CancelBroadcastButton } from './CancelBroadcast';
import { BROADCAST_STATUS_META, HISTORY_FILTERS, HISTORY_ROUTE, STAT_COLUMNS, audienceLabel, formatCount, whenOf } from './broadcast-model';
import { formatWhen } from '@/lib/format';

/**
 * The label of a status filter.
 *
 * @param filter - The filter.
 * @returns The label.
 */
const filterLabel = (filter: BroadcastStatus | 'all') => (filter === 'all' ? 'All' : BROADCAST_STATUS_META[filter].label);

/**
 * One row of the history: title (the link), audience, status and time, the
 * six delivery counters and Cancel while scheduled.
 *
 * @param props - The broadcast.
 * @param props.broadcast - The broadcast.
 * @returns The row.
 */
function HistoryRow({ broadcast }: { broadcast: Broadcast }) {
  const status = BROADCAST_STATUS_META[broadcast.status] ?? { label: broadcast.status, tone: 'muted' as const };
  const when = whenOf(broadcast);
  return (
    <tr className="border-t border-tl-line-soft hover:bg-tl-subtle" data-testid="broadcast-row">
      <th scope="row" className={`${tableCell} max-w-[320px] text-left font-normal`}>
        <Link href={`${HISTORY_ROUTE}/${encodeURIComponent(broadcast.id)}`} className={`block min-h-[44px] rounded-md py-0.5 ${focusRing}`}>
          <span className="block truncate text-[15px] font-bold text-tl-ink hover:underline">{broadcast.title}</span>
          <span className="mt-0.5 block truncate text-xs text-tl-muted">{audienceLabel(broadcast)}</span>
        </Link>
      </th>
      <td className={tableCell}>
        <span className={`${pill} ${pillTone[status.tone]}`}>{status.label}</span>
        <time dateTime={when} className="mt-1 block whitespace-nowrap text-xs text-tl-muted">
          {broadcast.status === 'scheduled' ? 'for ' : ''}
          {formatWhen(when)}
        </time>
      </td>
      {STAT_COLUMNS.map(({ key }) => (
        <td key={key} className={`${tableCell} text-right font-bold ${key === 'failed' && broadcast.stats[key] > 0 ? 'text-tl-danger' : ''}`} data-stat={key}>
          {formatCount(broadcast.stats?.[key])}
        </td>
      ))}
      <td className={`${tableCell} text-right`}>{broadcast.status === 'scheduled' ? <CancelBroadcastButton broadcast={broadcast} /> : null}</td>
    </tr>
  );
}

/**
 * Notifications history (v1.5 §2): every broadcast, newest first, with its
 * status and delivery stats (recipients, delivered, read, push sent, email
 * sent, failed), a status filter, paging and Cancel while scheduled. One
 * `GET /admin/broadcasts` per page; the stats come with each row.
 *
 * @returns The page.
 */
export function BroadcastHistory() {
  const [status, setStatus] = useState<BroadcastStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const tabRefs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});
  const query = { ...(status !== 'all' ? { status } : {}), page };

  const list = useQuery({
    queryKey: queryKeys.broadcasts.list(query),
    queryFn: () => broadcastService.list(query),
    staleTime: staleTimes.live,
    placeholderData: (previous) => previous,
  });

  const choose = (next: BroadcastStatus | 'all') => {
    setStatus(next);
    setPage(1);
  };

  const onTabKeyDown = (event: React.KeyboardEvent) => {
    const index = HISTORY_FILTERS.indexOf(status);
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % HISTORY_FILTERS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + HISTORY_FILTERS.length) % HISTORY_FILTERS.length;
    if (next === null) return;
    event.preventDefault();
    choose(HISTORY_FILTERS[next]);
    tabRefs.current[HISTORY_FILTERS[next]]?.focus();
  };

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta;
  const lastPage = Math.max(1, meta?.lastPage ?? 1);

  let content: React.ReactNode;
  if (list.isPending) content = <SkeletonRows label="Loading notifications" rows={6} />;
  else if (list.isError && !list.data) {
    content = (
      <div className="p-2">
        <ErrorCard title="We couldn't load sent notifications" error={list.error} onRetry={() => void list.refetch()} />
      </div>
    );
  } else if (rows.length === 0) {
    content = (
      <EmptyBlock title={status === 'all' ? 'Nothing sent yet' : `No ${filterLabel(status).toLowerCase()} notifications`}>
        {status === 'all' ? (
          <Link href={`${HISTORY_ROUTE}/new`} className={`${primaryButton} mt-3`}>
            Send the first notification
          </Link>
        ) : null}
      </EmptyBlock>
    );
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse">
          <caption className="sr-only">
            {filterLabel(status)} notifications with delivery stats, page {page} of {lastPage}
          </caption>
          <thead>
            <tr>
              <th scope="col" className={tableHead}>Notification</th>
              <th scope="col" className={tableHead}>Status</th>
              {STAT_COLUMNS.map(({ key, label }) => (
                <th key={key} scope="col" className={`${tableHead} text-right`}>
                  {label}
                </th>
              ))}
              <th scope="col" className={tableHead}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((broadcast) => (
              <HistoryRow key={broadcast.id} broadcast={broadcast} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tl-bg">
      <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
        <header className="flex flex-wrap items-end justify-between gap-3.5">
          <div>
            <h1 className={pageTitle}>Notifications</h1>
            <p className={pageSubtitle}>What Talim has sent to schools, staff, students and parents, and how it was received.</p>
          </div>
          <Link href={`${HISTORY_ROUTE}/new`} className={primaryButton}>
            <Plus className="h-4 w-4" aria-hidden />
            Send notification
          </Link>
        </header>

        <div role="tablist" aria-label="Notification status" className="flex flex-wrap gap-2" onKeyDown={onTabKeyDown}>
          {HISTORY_FILTERS.map((filter) => (
            <button
              key={filter}
              ref={(el) => {
                tabRefs.current[filter] = el;
              }}
              type="button"
              role="tab"
              aria-selected={filter === status}
              aria-controls="history-panel"
              id={`history-tab-${filter}`}
              tabIndex={filter === status ? 0 : -1}
              className={chip(filter === status)}
              onClick={() => choose(filter)}
            >
              {filterLabel(filter)}
            </button>
          ))}
        </div>

        {list.isError && list.data ? (
          <Banner tone="danger" action={<button type="button" className={ghostButton} onClick={() => void list.refetch()}>Try again</button>}>
            We couldn&apos;t refresh the list. Showing what loaded earlier.
          </Banner>
        ) : null}

        <section id="history-panel" role="tabpanel" aria-labelledby={`history-tab-${status}`} aria-busy={list.isFetching} className={cardFrame}>
          {content}
        </section>

        {meta && rows.length > 0 ? (
          <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm font-semibold text-tl-muted" aria-live="polite">
              Page {page} of {lastPage} · {meta.total.toLocaleString()} notification{meta.total === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              <button type="button" className={ghostButton} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <button type="button" className={ghostButton} disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
