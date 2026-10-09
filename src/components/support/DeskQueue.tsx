'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useAuthContext } from '@/app/context/AuthContext';
import { supportService } from '@/app/services/support.service';
import { useUrlSearchTerm } from '@/hooks/useUrlSearchTerm';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { SchoolPicker } from '@/components/schools/SchoolPicker';
import { Banner, EmptyBlock, ErrorCard, SkeletonRows } from '@/components/tl/States';
import {
  cardFrame,
  chip,
  fieldControl,
  fieldLabel,
  focusRing,
  ghostButton,
  pagePad,
  pageSubtitle,
  pageTitle,
  pill,
  pillTone,
  segment,
  segmentTrack,
  tableCell,
  tableHead,
} from '@/components/tl/styles';
import type { TicketSummary } from '@/types/tickets';
import {
  AREA_LABELS,
  DEFAULT_DESK_FILTERS,
  DESK_TABS,
  PRIORITY_META,
  STATUS_META,
  TICKET_AREAS,
  TICKET_PRIORITIES,
  deskFiltersToSearch,
  isReadOnlyTicket,
  parseDeskFilters,
  relativeTime,
  requesterName,
  schoolName,
  tabCount,
  toDeskQuery,
  unreadLabel,
  type DeskFilters,
  type DeskTab,
} from './desk-model';
import { userHref } from '@/components/users/user-model';

/** Quiet period before a search term reaches the URL and the API. */
export const SEARCH_DEBOUNCE_MS = 400;

const PANEL_ID = 'desk-panel';

/**
 * The tab's DOM id, for `aria-labelledby` on the panel.
 *
 * @param tab - The tab.
 * @returns The id.
 */
const tabDomId = (tab: DeskTab) => `desk-tab-${tab}`;

/**
 * The label of a status tab.
 *
 * @param tab - The tab.
 * @returns The label.
 */
const tabLabel = (tab: DeskTab) => (tab === 'all' ? 'All' : STATUS_META[tab].label);

/**
 * One row of the queue: subject (the link to the ticket), reference,
 * requester (the link to their user page), school,
 * area, priority, status, assignee and last activity. A ticket with
 * requester messages the desk has not read shows them as "N new" and a bold
 * subject. School-desk tickets in the "All schools" view carry a read-only
 * chip.
 *
 * @param props - The ticket and the clock.
 * @param props.ticket - The ticket summary.
 * @param props.now - Current time, for "3 h ago".
 * @returns The table row.
 */
function QueueRow({ ticket, now }: { ticket: TicketSummary; now: number }) {
  const status = STATUS_META[ticket.status];
  const priority = PRIORITY_META[ticket.priority];
  const unread = unreadLabel(ticket);
  return (
    <tr className="border-t border-tl-line-soft hover:bg-tl-subtle" data-testid="desk-row">
      <th scope="row" className={`${tableCell} max-w-[360px] text-left font-normal`}>
        <Link
          href={`/talimsupport/${encodeURIComponent(ticket.id)}`}
          className={`flex min-h-[44px] items-center gap-2 rounded-md py-0.5 ${focusRing}`}
        >
          <span className={`block truncate text-[15px] text-tl-ink hover:underline ${unread ? 'font-extrabold' : 'font-bold'}`}>{ticket.subject}</span>
          {unread ? (
            <span className={`${pill} ${pillTone.info} shrink-0`} data-testid="unread-badge">
              {unread}
              <span className="sr-only"> {ticket.unread === 1 ? 'message' : 'messages'} from the requester</span>
            </span>
          ) : null}
        </Link>
        <span className="flex flex-wrap items-center gap-1.5 text-xs text-tl-muted">
          <span className="font-semibold">{ticket.reference}</span>
          <span aria-hidden>·</span>
          <Link
            href={userHref(ticket.requester.id)}
            className={`inline-flex min-h-[24px] items-center rounded-md hover:text-tl-ink hover:underline ${focusRing}`}
            data-testid="requester-link"
          >
            {requesterName(ticket)}
          </Link>
        </span>
        {isReadOnlyTicket(ticket) ? <span className={`${pill} ${pillTone.muted} mt-1`}>School desk · read-only</span> : null}
        {ticket.escalatedFrom === 'school' ? <span className={`${pill} ${pillTone.accent} mt-1`}>Escalated</span> : null}
      </th>
      <td className={`${tableCell} max-w-[200px] truncate`}>{schoolName(ticket)}</td>
      <td className={tableCell}>{AREA_LABELS[ticket.area]}</td>
      <td className={tableCell}>
        <span className={`${pill} ${pillTone[priority.tone]}`}>{priority.label}</span>
      </td>
      <td className={tableCell}>
        <span className={`${pill} ${pillTone[status.tone]}`}>{status.label}</span>
      </td>
      <td className={`${tableCell} max-w-[160px] truncate text-tl-body`}>
        {ticket.assignee ? ticket.assignee.name || 'Assigned' : <span className="text-tl-faint">Unassigned</span>}
      </td>
      <td className={`${tableCell} whitespace-nowrap text-tl-muted`}>
        <time dateTime={ticket.lastActivityAt}>{relativeTime(ticket.lastActivityAt, now)}</time>
      </td>
    </tr>
  );
}

/**
 * The Talim support desk queue (v1.5 §1): status tabs with counts, filters
 * by area, priority, assignee and school, a debounced search, and the
 * "All schools" view (`?scope=all`) that adds every school-desk ticket,
 * read-only. Every filter lives in the URL, so a view can be shared and the
 * back button restores it.
 *
 * Data: one `GET /tickets/desk/talim` per page, one counts call and the
 * desk's staff (for the assignee filter, cached for minutes); never a
 * request per row. Each row's `unread` comes with the list.
 *
 * @returns The queue page.
 */
export function DeskQueue() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  const filters = useMemo(() => parseDeskFilters(searchParams), [searchParams]);
  const staff = useQuery({
    queryKey: queryKeys.tickets.staff(),
    queryFn: () => supportService.listStaff(),
    staleTime: staleTimes.reference,
  });
  const otherStaff = (staff.data ?? []).filter((member) => member.id !== user?.userId);
  const [now] = useState(() => Date.now());

  const apply = (patch: Partial<DeskFilters>) => {
    const next = { ...filters, page: 1, ...patch };
    router.replace(`${pathname}${deskFiltersToSearch(next)}`, { scroll: false });
  };

  // The search box is local while typing; the URL (and the API) follow once it settles.
  const [term, setTerm] = useUrlSearchTerm(filters.q, (q) => apply({ q }), SEARCH_DEBOUNCE_MS);

  const clearFilters = () => apply({ ...DEFAULT_DESK_FILTERS, scope: filters.scope, status: filters.status });

  const query = toDeskQuery(filters);
  const list = useQuery({
    queryKey: queryKeys.tickets.list({ ...query }),
    queryFn: () => supportService.listDesk(query),
    staleTime: staleTimes.list,
    placeholderData: (previous) => previous,
  });
  const counts = useQuery({
    queryKey: queryKeys.tickets.counts({ scope: filters.scope }),
    queryFn: () => supportService.getDeskCounts(filters.scope === 'all' ? 'all' : undefined),
    staleTime: staleTimes.live,
  });

  const tabRefs = useRef<Partial<Record<DeskTab, HTMLButtonElement | null>>>({});
  const onTabKeyDown = (event: React.KeyboardEvent) => {
    const index = DESK_TABS.indexOf(filters.status);
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % DESK_TABS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + DESK_TABS.length) % DESK_TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = DESK_TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    const tab = DESK_TABS[next];
    apply({ status: tab });
    tabRefs.current[tab]?.focus();
  };

  const filtered =
    filters.area !== '' || filters.priority !== '' || filters.assignee !== '' || filters.schoolId !== '' || filters.q !== '';

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta;
  const lastPage = Math.max(1, meta?.lastPage ?? 1);

  let content: React.ReactNode;
  if (list.isPending) {
    content = <SkeletonRows label="Loading tickets" rows={6} />;
  } else if (list.isError && !list.data) {
    content = (
      <div className="p-2">
        <ErrorCard title="We couldn't load the support desk" error={list.error} onRetry={() => void list.refetch()} />
      </div>
    );
  } else if (rows.length === 0) {
    content = (
      <EmptyBlock title={filtered ? 'No ticket matches these filters' : `No ${tabLabel(filters.status).toLowerCase()} tickets`}>
        {filtered ? (
          <button type="button" className={`${ghostButton} mt-3`} onClick={clearFilters}>
            Clear filters
          </button>
        ) : (
          'New tickets raised to Talim support appear here.'
        )}
      </EmptyBlock>
    );
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <caption className="sr-only">
            {tabLabel(filters.status)} tickets{filters.scope === 'all' ? ', all schools' : ', Talim desk'}, page {filters.page} of {lastPage}
          </caption>
          <thead>
            <tr>
              <th scope="col" className={tableHead}>Ticket</th>
              <th scope="col" className={tableHead}>School</th>
              <th scope="col" className={tableHead}>Area</th>
              <th scope="col" className={tableHead}>Priority</th>
              <th scope="col" className={tableHead}>Status</th>
              <th scope="col" className={tableHead}>Assignee</th>
              <th scope="col" className={tableHead}>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((ticket) => (
              <QueueRow key={ticket.id} ticket={ticket} now={now} />
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
            <h1 className={pageTitle}>Support desk</h1>
            <p className={pageSubtitle}>Tickets raised to Talim support by school staff, teachers, students and parents.</p>
          </div>
          <div className={segmentTrack} role="group" aria-label="Which tickets">
            <button type="button" aria-pressed={filters.scope === 'talim'} className={segment(filters.scope === 'talim')} onClick={() => apply({ scope: 'talim' })}>
              Talim desk
            </button>
            <button type="button" aria-pressed={filters.scope === 'all'} className={segment(filters.scope === 'all')} onClick={() => apply({ scope: 'all' })}>
              All schools
            </button>
          </div>
        </header>

        {filters.scope === 'all' ? (
          <Banner tone="info">
            Showing every school&apos;s desk as well as Talim&apos;s. School-desk tickets are read-only here until the school escalates them to Talim.
          </Banner>
        ) : null}

        <div role="tablist" aria-label="Ticket status" className="flex flex-wrap gap-2" onKeyDown={onTabKeyDown}>
          {DESK_TABS.map((tab) => {
            const on = tab === filters.status;
            const count = tabCount(counts.data, tab);
            return (
              <button
                key={tab}
                ref={(el) => {
                  tabRefs.current[tab] = el;
                }}
                type="button"
                role="tab"
                id={tabDomId(tab)}
                aria-selected={on}
                aria-controls={PANEL_ID}
                tabIndex={on ? 0 : -1}
                className={chip(on)}
                onClick={() => apply({ status: tab })}
              >
                <span>{tabLabel(tab)}</span>
                {count !== undefined ? (
                  <span className={`text-xs font-extrabold ${on ? 'opacity-80' : ''}`} aria-label={`${count} tickets`}>
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
          {counts.data ? (
            <span className="ml-auto flex items-center gap-2 text-xs font-bold text-tl-muted">
              <span className={`${pill} ${pillTone.warning}`}>{counts.data.unassigned} unassigned</span>
              <span className={`${pill} ${pillTone.info}`}>{counts.data.mine} mine</span>
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(150px,1fr))]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="desk-search" className={fieldLabel}>
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tl-faint" aria-hidden />
              <input
                id="desk-search"
                type="search"
                value={term}
                placeholder="Reference or subject"
                onChange={(e) => setTerm(e.target.value)}
                className={`${fieldControl} pl-10`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="desk-area" className={fieldLabel}>
              Area
            </label>
            <select id="desk-area" className={fieldControl} value={filters.area} onChange={(e) => apply({ area: e.target.value as DeskFilters['area'] })}>
              <option value="">All areas</option>
              {TICKET_AREAS.map((area) => (
                <option key={area} value={area}>
                  {AREA_LABELS[area]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="desk-priority" className={fieldLabel}>
              Priority
            </label>
            <select
              id="desk-priority"
              className={fieldControl}
              value={filters.priority}
              onChange={(e) => apply({ priority: e.target.value as DeskFilters['priority'] })}
            >
              <option value="">Any priority</option>
              {TICKET_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_META[priority].label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="desk-assignee" className={fieldLabel}>
              Assignee
            </label>
            <select
              id="desk-assignee"
              className={fieldControl}
              value={filters.assignee}
              onChange={(e) => apply({ assignee: e.target.value as DeskFilters['assignee'] })}
            >
              <option value="">Anyone</option>
              <option value="me">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
              {otherStaff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email || 'Talim staff'}
                </option>
              ))}
            </select>
          </div>
          <SchoolPicker label="School" selectedIds={filters.schoolId ? [filters.schoolId] : []} onChange={(ids) => apply({ schoolId: ids[0] ?? '' })} />
        </div>

        {list.isError && list.data ? (
          <Banner tone="danger" action={<button type="button" className={ghostButton} onClick={() => void list.refetch()}>Try again</button>}>
            We couldn&apos;t refresh the desk. Showing what loaded earlier.
          </Banner>
        ) : null}

        <section id={PANEL_ID} role="tabpanel" aria-labelledby={tabDomId(filters.status)} aria-busy={list.isFetching} className={cardFrame}>
          {content}
        </section>

        {meta && rows.length > 0 ? (
          <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm font-semibold text-tl-muted" aria-live="polite">
              Page {filters.page} of {lastPage} · {meta.total.toLocaleString()} ticket{meta.total === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              <button type="button" className={ghostButton} disabled={filters.page <= 1} onClick={() => apply({ page: filters.page - 1 })}>
                Previous
              </button>
              <button type="button" className={ghostButton} disabled={filters.page >= lastPage} onClick={() => apply({ page: filters.page + 1 })}>
                Next
              </button>
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
