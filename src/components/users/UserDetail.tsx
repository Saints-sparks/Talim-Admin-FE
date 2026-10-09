'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail } from 'lucide-react';
import { useAuthContext } from '@/app/context/AuthContext';
import { adminUserService } from '@/app/services/admin-user.service';
import { ApiError } from '@/lib/apiError';
import { formatWhen } from '@/lib/format';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { Avatar } from '@/components/tl/Avatar';
import { Fact } from '@/components/tl/Fact';
import { StatTile } from '@/components/tl/StatTile';
import { Banner, EmptyBlock, ErrorCard, SkeletonRows } from '@/components/tl/States';
import {
  card,
  cardTitle,
  dangerGhostButton,
  eyebrow,
  focusRing,
  pagePad,
  pageTitle,
  pill,
  pillTone,
  rowButton,
  textLink,
} from '@/components/tl/styles';
import { STATUS_META, relativeTime } from '@/components/support/desk-model';
import type { AdminUserDetail } from '@/types/adminUsers';
import { USERS_PATH, USER_STATUS_META, roleLabel, statusLock, userDisplayName, userHref } from './user-model';
import { UserStatusSheet } from './UserStatusSheet';

/**
 * Who the user is: contact details, role, school, class (students), and when
 * they joined and last signed in.
 *
 * @param props - The user.
 * @param props.user - The user.
 * @returns The card.
 */
function ProfileCard({ user }: { user: AdminUserDetail }) {
  return (
    <section className={card} aria-labelledby="profile-title">
      <h2 id="profile-title" className={cardTitle}>
        Profile
      </h2>
      <dl className="m-0 mt-3">
        <Fact label="Email">
          {user.email ? (
            <a href={`mailto:${user.email}`} className={`${textLink} min-h-0 max-w-full whitespace-normal break-all`}>
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              {user.email}
            </a>
          ) : (
            '—'
          )}
        </Fact>
        <Fact label="Phone">{user.phoneNumber || '—'}</Fact>
        <Fact label="Role">{roleLabel(user.role)}</Fact>
        <Fact label="School">
          {user.school ? (
            <Link href={`/SchoolProfile/view/${encodeURIComponent(user.school.id)}`} className={`${textLink} min-h-0 whitespace-normal`}>
              {user.school.name}
            </Link>
          ) : (
            'No school'
          )}
        </Fact>
        {user.role === 'student' ? <Fact label="Class">{user.className || '—'}</Fact> : null}
        <Fact label="Joined">{formatWhen(user.createdAt)}</Fact>
        <Fact label="Last sign-in">{user.lastLoginAt ? formatWhen(user.lastLoginAt) : 'Never'}</Fact>
      </dl>
    </section>
  );
}

/**
 * A parent's children, with class and school, each linking to the child's own
 * page (a child's `id` is their user id).
 *
 * @param props - The parent.
 * @param props.user - The user (a parent).
 * @returns The card.
 */
function ChildrenCard({ user }: { user: AdminUserDetail }) {
  const { children } = user;
  return (
    <section className={card} aria-labelledby="children-title">
      <h2 id="children-title" className={cardTitle}>
        Children
      </h2>
      {children.length ? (
        <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
          {children.map((child) => (
            <li key={child.id}>
              <Link
                href={userHref(child.id)}
                className={`flex items-center gap-3 rounded-2xl border border-tl-line-soft bg-tl-subtle px-3.5 py-2.5 hover:border-tl-line ${focusRing}`}
              >
                <Avatar id={child.id} name={child.name} size={34} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-tl-ink">{child.name}</span>
                  <span className="block truncate text-xs text-tl-muted">
                    {[child.className, child.school?.name].filter(Boolean).join(' · ') || 'No class yet'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 mt-3 text-sm text-tl-muted">No children are linked to this account.</p>
      )}
    </section>
  );
}

/**
 * Their tickets: open and total, and the most recent, each opening on the
 * support desk.
 *
 * @param props - The user and the clock.
 * @param props.user - The user.
 * @param props.now - Current time, for "3 h ago".
 * @returns The card.
 */
function TicketsCard({ user, now }: { user: AdminUserDetail; now: number }) {
  const { open, total, recent } = user.tickets;
  return (
    <section className={card} aria-labelledby="tickets-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="tickets-title" className={cardTitle}>
          Tickets
        </h2>
        <Link href="/talimsupport" className={textLink}>
          Support desk
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <StatTile subtle label="Open" value={open.toLocaleString()} />
        <StatTile subtle label="All time" value={total.toLocaleString()} />
      </div>
      {recent.length ? (
        <ul className="m-0 mt-3 flex list-none flex-col p-0" aria-label="Recent tickets">
          {recent.map((ticket) => {
            const status = STATUS_META[ticket.status];
            return (
              <li key={ticket.id} className="border-t border-tl-line-soft first:border-t-0">
                <Link
                  href={`/talimsupport/${encodeURIComponent(ticket.id)}`}
                  className={`flex min-h-[44px] flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md py-2.5 ${focusRing}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-tl-ink hover:underline">{ticket.subject}</span>
                    <span className="block text-xs text-tl-muted">
                      {ticket.reference} · <time dateTime={ticket.lastActivityAt}>{relativeTime(ticket.lastActivityAt, now)}</time>
                    </span>
                  </span>
                  <span className={`${pill} ${pillTone[status.tone]}`}>{status.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyBlock title="No tickets yet" />
      )}
    </section>
  );
}

/**
 * Whether the account can sign in, and the deactivate or reactivate button
 * (behind a confirm). Deleted accounts, your own and Talim staff accounts
 * show why instead.
 *
 * @param props - The user and the signed-in admin.
 * @param props.user - The user.
 * @param props.myUserId - The signed-in admin's id.
 * @returns The card.
 */
function AccessCard({ user, myUserId }: { user: AdminUserDetail; myUserId: string | null | undefined }) {
  const [confirming, setConfirming] = useState(false);
  const lock = statusLock(user, myUserId);
  let state: string;
  if (user.status === 'deleted') state = 'Deleted. Its personal details have been erased.';
  else if (user.isActive) state = 'Active. They can sign in to their Talim apps.';
  else state = 'Deactivated. They can’t sign in until a Talim admin reactivates them.';

  return (
    <section className={card} aria-labelledby="access-title">
      <h2 id="access-title" className={cardTitle}>
        Account access
      </h2>
      <p className="m-0 mt-2 text-sm leading-[1.6] text-tl-body">{state}</p>
      {lock ? (
        <p className="m-0 mt-3 text-sm font-semibold text-tl-muted">{lock}</p>
      ) : (
        <>
          <button
            type="button"
            className={`${user.isActive ? dangerGhostButton : rowButton} mt-4`}
            onClick={() => setConfirming(true)}
          >
            {user.isActive ? 'Deactivate account' : 'Reactivate account'}
          </button>
          <UserStatusSheet user={user} open={confirming} onClose={() => setConfirming(false)} />
        </>
      )}
    </section>
  );
}

/**
 * One user in Talim Admin (v1.5 addendum 2026-10-09, `GET /admin/users/:id`):
 * identity, role, status, school, children (parents) or class (students),
 * when they joined and last signed in, a pending or completed deletion, their
 * tickets, and deactivate or reactivate behind a confirm with a reason.
 *
 * @param props - The user id from the route.
 * @param props.id - The user id.
 * @returns The page.
 */
export function UserDetail({ id }: { id: string }) {
  const { user: me } = useAuthContext();
  const [now] = useState(() => Date.now());
  const userQuery = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => adminUserService.get(id),
    staleTime: staleTimes.list,
  });

  const back = (
    <Link href={USERS_PATH} className={`${textLink} self-start`}>
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Users
    </Link>
  );

  if (userQuery.isPending) {
    return (
      <div className="min-h-screen bg-tl-bg">
        <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
          {back}
          <SkeletonRows label="Loading the user" rows={4} rowHeight={96} />
        </div>
      </div>
    );
  }

  if (!userQuery.data) {
    const notFound = userQuery.error instanceof ApiError && userQuery.error.status === 404;
    return (
      <div className="min-h-screen bg-tl-bg">
        <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
          {back}
          <ErrorCard
            title={notFound ? 'We couldn’t find that user' : 'We couldn’t load this user'}
            error={userQuery.error}
            onRetry={notFound ? undefined : () => void userQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  const user = userQuery.data;
  const name = userDisplayName(user);
  const status = USER_STATUS_META[user.status];

  return (
    <div className="min-h-screen bg-tl-bg">
      <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
        {back}
        <header className="flex flex-wrap items-center gap-4">
          <Avatar id={user.id} name={name} size={56} />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className={`${eyebrow} m-0`}>
              {roleLabel(user.role)}
              {user.school ? ` · ${user.school.name}` : ''}
            </p>
            <h1 className={`${pageTitle} break-words`}>{name}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`${pill} ${pillTone[status.tone]}`} data-testid="user-status">
                {status.label}
              </span>
            </div>
          </div>
        </header>

        {user.status === 'deletion_scheduled' && user.deletion ? (
          <Banner tone="warning">
            They asked to delete their account on {formatWhen(user.deletion.requestedAt)}. It will be erased on{' '}
            {formatWhen(user.deletion.scheduledFor)} unless they sign in before then, which cancels it.
          </Banner>
        ) : null}
        {user.status === 'deleted' ? (
          <Banner tone="info">
            This account has been deleted. Its personal details were erased; the school keeps grades, attendance and payments, de-identified.
          </Banner>
        ) : null}

        {userQuery.isRefetchError ? (
          <Banner
            tone="danger"
            action={
              <button type="button" className={`rounded-md font-bold underline ${focusRing}`} onClick={() => void userQuery.refetch()}>
                Try again
              </button>
            }
          >
            We couldn&apos;t refresh this user. Showing what loaded earlier.
          </Banner>
        ) : null}

        <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-[18px]">
            <ProfileCard user={user} />
            {user.role === 'parent' ? <ChildrenCard user={user} /> : null}
            <TicketsCard user={user} now={now} />
          </div>
          <div className="flex flex-col gap-[18px]">
            <AccessCard user={user} myUserId={me?.userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
