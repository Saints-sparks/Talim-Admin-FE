'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { broadcastService } from '@/app/services/broadcast.service';
import { ApiError } from '@/lib/apiError';
import { formatWhen } from '@/lib/format';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { AttachmentLinks, urlAttachments } from '@/components/attachments/AttachmentPicker';
import { StatTile } from '@/components/tl/StatTile';
import { Banner, ErrorCard, SkeletonRows } from '@/components/tl/States';
import { card, cardTitle, eyebrow, pagePad, pageTitle, pill, pillTone, textLink } from '@/components/tl/styles';
import type { Broadcast } from '@/types/broadcasts';
import { CancelBroadcastButton } from './CancelBroadcast';
import {
  BROADCAST_STATUS_META,
  HISTORY_ROUTE,
  ROLE_LABELS,
  STAT_COLUMNS,
  TARGET_LABELS,
  audienceLabel,
  channelsLabel,
  formatCount,
  percentOf,
} from './broadcast-model';

/** How often a broadcast that is still sending refreshes its stats. */
const SENDING_REFRESH_MS = 10_000;

/**
 * One fact in a card's list.
 *
 * @param props - The term and value.
 * @param props.label - The term.
 * @param props.children - The value.
 * @returns The pair.
 */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 border-t border-tl-line-soft py-2.5 first:border-t-0 first:pt-0">
      <dt className="text-[13px] font-bold text-tl-muted">{label}</dt>
      <dd className="m-0 text-right text-sm font-semibold text-tl-ink">{children}</dd>
    </div>
  );
}

/**
 * The six delivery tiles; delivered and read also show their share of the
 * recipients.
 *
 * @param props - The stats.
 * @param props.stats - The broadcast's stats.
 * @returns The tiles.
 */
export function BroadcastStatTiles({ stats }: { stats: Broadcast['stats'] }) {
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]" role="group" aria-label="Delivery stats">
      {STAT_COLUMNS.map(({ key, label }) => (
        <StatTile
          key={key}
          label={label}
          value={formatCount(stats[key])}
          valueClass={`text-2xl ${key === 'failed' && stats.failed > 0 ? 'text-tl-danger' : 'text-tl-ink'}`}
          hint={key === 'delivered' || key === 'read' ? percentOf(stats[key], stats.recipients) && `${percentOf(stats[key], stats.recipients)} of recipients` : undefined}
        />
      ))}
    </div>
  );
}

/**
 * One broadcast (v1.5 §2 `GET /admin/broadcasts/:id`): its stats, message,
 * audience, channels and timeline, with Cancel while it is scheduled. While
 * it is sending, the stats refresh every 10 seconds.
 *
 * @param props - The broadcast id from the route.
 * @param props.id - The broadcast id.
 * @returns The page.
 */
export function BroadcastDetail({ id }: { id: string }) {
  const query = useQuery({
    queryKey: queryKeys.broadcasts.detail(id),
    queryFn: () => broadcastService.get(id),
    staleTime: staleTimes.live,
    refetchInterval: (q) => (q.state.data?.status === 'sending' ? SENDING_REFRESH_MS : false),
  });

  const back = (
    <Link href={HISTORY_ROUTE} className={`${textLink} self-start`}>
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Notifications
    </Link>
  );

  let content: React.ReactNode;
  if (query.isPending) content = <SkeletonRows label="Loading the notification" rows={3} rowHeight={110} />;
  else if (!query.data) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    content = (
      <ErrorCard
        title={notFound ? 'We couldn’t find that notification' : 'We couldn’t load this notification'}
        error={query.error}
        onRetry={notFound ? undefined : () => void query.refetch()}
      />
    );
  } else {
    const b = query.data;
    const status = BROADCAST_STATUS_META[b.status] ?? { label: b.status, tone: 'muted' as const };
    content = (
      <>
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={`${eyebrow} m-0`}>Notification from Talim</p>
            <h1 className={`${pageTitle} mt-1 break-words`}>{b.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`${pill} ${pillTone[status.tone]}`}>{status.label}</span>
              <span className="text-sm text-tl-muted">{audienceLabel(b)}</span>
            </div>
          </div>
          {b.status === 'scheduled' ? <CancelBroadcastButton broadcast={b} /> : null}
        </header>

        {b.status === 'scheduled' && b.sendAt ? (
          <Banner tone="warning">Scheduled for {formatWhen(b.sendAt)} (your time). You can cancel it until it starts sending.</Banner>
        ) : null}
        {b.status === 'sending' ? <Banner tone="info">Sending now. These numbers refresh every few seconds.</Banner> : null}
        {query.isRefetchError ? <Banner tone="danger">We couldn&apos;t refresh the stats. Showing what loaded earlier.</Banner> : null}

        <BroadcastStatTiles stats={b.stats} />

        <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className={card} aria-labelledby="broadcast-message-title">
            <h2 id="broadcast-message-title" className={cardTitle}>
              Message
            </h2>
            <p className="m-0 mt-3 whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-tl-ink">{b.body}</p>
            <AttachmentLinks files={urlAttachments(b.attachments)} />
            {b.target ? (
              <p className="m-0 mt-3 text-sm text-tl-muted">
                Button opens <strong className="text-tl-ink">{TARGET_LABELS[b.target.page] ?? b.target.page}</strong>.
              </p>
            ) : null}
          </section>

          <section className={card} aria-labelledby="broadcast-delivery-title">
            <h2 id="broadcast-delivery-title" className={cardTitle}>
              Delivery
            </h2>
            <dl className="m-0 mt-3">
              <Fact label="Audience">
                {b.audience.all
                  ? 'Everyone'
                  : b.audience.roles.map((r) => ROLE_LABELS[r] ?? r).join(', ') || (b.audience.schoolIds.length ? 'Everyone in them' : '—')}
              </Fact>
              {!b.audience.all ? (
                <Fact label="Schools">
                  {b.audience.schoolIds.length
                    ? b.audience.schools.map((s) => s.name).join(', ') || `${b.audience.schoolIds.length} schools`
                    : 'All schools'}
                </Fact>
              ) : null}
              {b.audience.userIds.length ? (
                <Fact label="Specific people">
                  {b.audience.users?.length
                    ? b.audience.users.map((u) => u.name).join(', ')
                    : formatCount(b.audience.userIds.length)}
                </Fact>
              ) : null}
              <Fact label="Channels">{channelsLabel(b.channels)}</Fact>
              <Fact label="Audience size when created">{formatCount(b.recipientsEstimate)}</Fact>
              <Fact label="Created">{formatWhen(b.createdAt)}</Fact>
              {b.status === 'scheduled' || b.status === 'cancelled' ? <Fact label="Scheduled for">{formatWhen(b.sendAt)}</Fact> : null}
              {b.sentAt ? <Fact label="Sent">{formatWhen(b.sentAt)}</Fact> : null}
              {b.cancelledAt ? <Fact label="Cancelled">{formatWhen(b.cancelledAt)}</Fact> : null}
              {b.createdBy?.name ? <Fact label="Sent by">{b.createdBy.name}</Fact> : null}
            </dl>
          </section>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-tl-bg">
      <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
        {back}
        {content}
      </div>
    </div>
  );
}
