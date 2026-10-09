'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail } from 'lucide-react';
import { supportService } from '@/app/services/support.service';
import { ApiError } from '@/lib/apiError';
import { formatWhen } from '@/lib/format';
import { listPrefix, queryKeys, staleTimes } from '@/lib/queryKeys';
import { Avatar } from '@/components/tl/Avatar';
import { Fact } from '@/components/tl/Fact';
import { Banner, ErrorCard, SkeletonRows } from '@/components/tl/States';
import { card, cardTitle, eyebrow, focusRing, pagePad, pageTitle, pill, pillTone, textLink } from '@/components/tl/styles';
import type { Ticket } from '@/types/tickets';
import {
  AREA_LABELS,
  PRIORITY_META,
  ROLE_LABELS,
  STATUS_META,
  isReadOnlyTicket,
  reopenDeadline,
  requesterName,
  schoolName,
} from './desk-model';
import { userHref } from '@/components/users/user-model';
import { ReplyComposer } from './ReplyComposer';
import { TicketControls } from './TicketControls';
import { TicketThread } from './TicketThread';

/**
 * The requester, school, timeline and (when the requester's app sent it)
 * context cards.
 *
 * @param props - The ticket.
 * @param props.ticket - The ticket.
 * @returns The cards.
 */
function TicketFacts({ ticket }: { ticket: Ticket }) {
  const name = requesterName(ticket);
  return (
    <>
      <section className={card} aria-labelledby="requester-title">
        <h2 id="requester-title" className={cardTitle}>
          Requester
        </h2>
        <div className="mt-4 flex items-center gap-3">
          <Avatar id={ticket.requester.id} name={name} size={44} />
          <div className="min-w-0">
            <Link
              href={userHref(ticket.requester.id)}
              className={`block truncate rounded-md text-[15px] font-extrabold text-tl-ink hover:underline ${focusRing}`}
              data-testid="requester-link"
            >
              {name}
            </Link>
            <p className="m-0 text-sm text-tl-muted">{ROLE_LABELS[ticket.requester.role] ?? ticket.requester.role}</p>
          </div>
        </div>
        {ticket.requester.email ? (
          <a href={`mailto:${ticket.requester.email}`} className={`${textLink} mt-2 max-w-full`}>
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{ticket.requester.email}</span>
          </a>
        ) : null}
      </section>

      <section className={card} aria-labelledby="school-title">
        <h2 id="school-title" className={cardTitle}>
          School
        </h2>
        <p className="m-0 mt-3 text-[15px] font-extrabold text-tl-ink">{schoolName(ticket)}</p>
        {ticket.child ? (
          <p className="m-0 mt-1 text-sm text-tl-muted">
            About <strong className="text-tl-ink">{ticket.child.name || 'their child'}</strong>
          </p>
        ) : null}
        {ticket.school ? (
          <Link href={`/SchoolProfile/view/${encodeURIComponent(ticket.school.id)}`} className={textLink}>
            Open school profile
          </Link>
        ) : null}
      </section>

      <section className={card} aria-labelledby="timeline-title">
        <h2 id="timeline-title" className={cardTitle}>
          Timeline
        </h2>
        <dl className="m-0 mt-3">
          {ticket.createdAt ? <Fact label="Raised">{formatWhen(ticket.createdAt)}</Fact> : null}
          <Fact label="First response">{ticket.firstResponseAt ? formatWhen(ticket.firstResponseAt) : 'Not yet'}</Fact>
          {ticket.resolvedAt ? <Fact label="Resolved">{formatWhen(ticket.resolvedAt)}</Fact> : null}
          {ticket.closedAt ? <Fact label="Closed">{formatWhen(ticket.closedAt)}</Fact> : null}
          {ticket.escalatedAt ? <Fact label="Escalated">{formatWhen(ticket.escalatedAt)}</Fact> : null}
          <Fact label="Last activity">{formatWhen(ticket.lastActivityAt)}</Fact>
        </dl>
      </section>

      {ticket.context && (ticket.context.path || ticket.context.appVersion || ticket.context.userAgent) ? (
        <section className={card} aria-labelledby="context-title">
          <h2 id="context-title" className={cardTitle}>
            Where they were
          </h2>
          <dl className="m-0 mt-3">
            {ticket.context.path ? <Fact label="Page">{ticket.context.path}</Fact> : null}
            {ticket.context.appVersion ? <Fact label="App version">{ticket.context.appVersion}</Fact> : null}
            {ticket.context.userAgent ? (
              <Fact label="Device">
                <span className="break-all text-xs">{ticket.context.userAgent}</span>
              </Fact>
            ) : null}
          </dl>
        </section>
      ) : null}
    </>
  );
}

/**
 * One ticket on the Talim desk (v1.5 §1): the thread with internal notes set
 * apart, the reply box with attachments and the internal-note switch, the
 * status, priority and assignee controls, and the requester and school.
 *
 * A school-desk ticket (reached from the "All schools" view) is read-only
 * until the school escalates it: no reply box, controls off.
 *
 * Opening a ticket marks it read for the desk on the server, so once it has
 * loaded the queue and its counts are refreshed (the row's "new" badge goes).
 *
 * @param props - The ticket id from the route.
 * @param props.id - The ticket id.
 * @returns The page.
 */
export function TicketView({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const ticketQuery = useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => supportService.getTicket(id),
    staleTime: staleTimes.list,
  });
  const loadedAt = ticketQuery.dataUpdatedAt;
  useEffect(() => {
    if (!loadedAt) return;
    void queryClient.invalidateQueries({ queryKey: listPrefix(queryKeys.tickets.list()) });
  }, [loadedAt, queryClient]);

  const back = (
    <Link href="/talimsupport" className={`${textLink} self-start`}>
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Support desk
    </Link>
  );

  if (ticketQuery.isPending) {
    return (
      <div className="min-h-screen bg-tl-bg">
        <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
          {back}
          <SkeletonRows label="Loading the ticket" rows={4} rowHeight={96} />
        </div>
      </div>
    );
  }

  if (!ticketQuery.data) {
    const notFound = ticketQuery.error instanceof ApiError && ticketQuery.error.status === 404;
    return (
      <div className="min-h-screen bg-tl-bg">
        <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
          {back}
          <ErrorCard
            title={notFound ? 'We couldn’t find that ticket' : 'We couldn’t load this ticket'}
            error={ticketQuery.error}
            onRetry={notFound ? undefined : () => void ticketQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  const ticket = ticketQuery.data;
  const readOnly = isReadOnlyTicket(ticket);
  const status = STATUS_META[ticket.status];
  const priority = PRIORITY_META[ticket.priority];
  const deadline = reopenDeadline(ticket);

  return (
    <div className="min-h-screen bg-tl-bg">
      <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
        {back}
        <header className="flex flex-col gap-2">
          <p className={`${eyebrow} m-0`}>
            {ticket.reference} · {ticket.desk === 'talim' ? 'Talim desk' : 'School desk'}
          </p>
          <h1 className={`${pageTitle} break-words`}>{ticket.subject}</h1>
          <div className="flex flex-wrap gap-2">
            <span className={`${pill} ${pillTone[status.tone]}`}>{status.label}</span>
            <span className={`${pill} ${pillTone[priority.tone]}`}>{priority.label} priority</span>
            <span className={`${pill} ${pillTone.muted}`}>{AREA_LABELS[ticket.area]}</span>
            {ticket.escalatedFrom === 'school' ? <span className={`${pill} ${pillTone.accent}`}>Escalated by the school</span> : null}
          </div>
        </header>

        {readOnly ? (
          <Banner tone="info">
            This ticket is on {schoolName(ticket)}&apos;s own desk. Talim can read it; replies and changes open once the school escalates it.
          </Banner>
        ) : ticket.status === 'resolved' && deadline ? (
          <Banner tone="info">Resolved. The requester can reopen it until {formatWhen(deadline.toISOString())}; after that it closes.</Banner>
        ) : null}

        {ticketQuery.isRefetchError ? (
          <Banner
            tone="danger"
            action={
              <button type="button" className={`rounded-md font-bold underline ${focusRing}`} onClick={() => void ticketQuery.refetch()}>
                Try again
              </button>
            }
          >
            We couldn&apos;t refresh this ticket. Showing what loaded earlier.
          </Banner>
        ) : null}

        <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className={`${card} flex flex-col gap-4`} aria-labelledby="conversation-title">
            <h2 id="conversation-title" className={cardTitle}>
              Conversation
            </h2>
            <TicketThread messages={ticket.messages} />
            {readOnly ? null : <ReplyComposer ticket={ticket} />}
          </section>
          <div className="flex flex-col gap-[18px]">
            <TicketControls ticket={ticket} readOnly={readOnly} />
            <TicketFacts ticket={ticket} />
          </div>
        </div>
      </div>
    </div>
  );
}
