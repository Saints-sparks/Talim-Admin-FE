'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { adminUserService, USER_SEARCH_LIMIT } from '@/app/services/admin-user.service';
import { useUrlSearchTerm } from '@/hooks/useUrlSearchTerm';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { SchoolPicker } from '@/components/schools/SchoolPicker';
import { Avatar } from '@/components/tl/Avatar';
import { Banner, EmptyBlock, ErrorCard, SkeletonRows } from '@/components/tl/States';
import {
  cardFrame,
  fieldControl,
  fieldLabel,
  focusRing,
  ghostButton,
  pagePad,
  pageSubtitle,
  pageTitle,
  pill,
  pillTone,
  tableCell,
  tableHead,
} from '@/components/tl/styles';
import type { AdminUserSearchHit } from '@/types/adminUsers';
import {
  DEFAULT_USER_FILTERS,
  USER_ROLES,
  USER_STATUS_FILTERS,
  USER_STATUS_FILTER_LABELS,
  USER_STATUS_META,
  parseUserFilters,
  roleLabel,
  toUserQuery,
  userFiltersToSearch,
  userHref,
  type UserFilters,
} from './user-model';

/** Quiet period before a search term reaches the URL and the API. */
export const USER_SEARCH_DEBOUNCE_MS = 400;

/**
 * One row of the directory: the name (the link to the detail page) and
 * email, role, school and status.
 *
 * @param props - The user found.
 * @param props.user - The search hit.
 * @returns The table row.
 */
function UserRow({ user }: { user: AdminUserSearchHit }) {
  const status = user.status ? USER_STATUS_META[user.status] : null;
  const name = user.name || user.email || 'Unnamed user';
  return (
    <tr className="border-t border-tl-line-soft hover:bg-tl-subtle" data-testid="user-row">
      <th scope="row" className={`${tableCell} max-w-[360px] text-left font-normal`}>
        <Link href={userHref(user.id)} className={`flex min-h-[44px] items-center gap-3 rounded-md py-0.5 ${focusRing}`}>
          <Avatar id={user.id} name={name} size={36} />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-tl-ink hover:underline">{name}</span>
            {user.email ? <span className="block truncate text-xs text-tl-muted">{user.email}</span> : null}
          </span>
        </Link>
      </th>
      <td className={tableCell}>{roleLabel(user.role)}</td>
      <td className={`${tableCell} max-w-[220px] truncate`}>{user.school?.name ?? <span className="text-tl-faint">No school</span>}</td>
      <td className={tableCell}>{status ? <span className={`${pill} ${pillTone[status.tone]}`}>{status.label}</span> : null}</td>
    </tr>
  );
}

/**
 * The Talim Admin user directory (v1.5 addendum): search anyone on Talim by
 * name or email, narrowed by role, school and account status, each result
 * linking to the user's page. Every filter lives in the URL, so a search can
 * be shared and the back button restores it.
 *
 * Data: one `GET /admin/users/search` per settled search (at most
 * {@link USER_SEARCH_LIMIT} users, by name); never a request per row.
 *
 * @returns The directory page.
 */
export function UserDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseUserFilters(searchParams), [searchParams]);

  const apply = (patch: Partial<UserFilters>) => {
    router.replace(`${pathname}${userFiltersToSearch({ ...filters, ...patch })}`, { scroll: false });
  };
  const [term, setTerm] = useUrlSearchTerm(filters.q, (q) => apply({ q }), USER_SEARCH_DEBOUNCE_MS);

  const query = toUserQuery(filters, USER_SEARCH_LIMIT);
  const results = useQuery({
    queryKey: queryKeys.users.search({ ...query }),
    queryFn: () => adminUserService.search(query),
    staleTime: staleTimes.list,
    placeholderData: (previous) => previous,
  });

  const filtered = filters.q !== '' || filters.role !== '' || filters.schoolId !== '' || filters.status !== DEFAULT_USER_FILTERS.status;
  const rows = results.data ?? [];

  let content: React.ReactNode;
  if (results.isPending) {
    content = <SkeletonRows label="Loading users" rows={6} />;
  } else if (results.isError && !results.data) {
    content = (
      <div className="p-2">
        <ErrorCard title="We couldn't load users" error={results.error} onRetry={() => void results.refetch()} />
      </div>
    );
  } else if (rows.length === 0) {
    content = (
      <EmptyBlock title="Nobody matches this search">
        {filtered ? (
          <button type="button" className={`${ghostButton} mt-3`} onClick={() => apply(DEFAULT_USER_FILTERS)}>
            Clear filters
          </button>
        ) : (
          'Search by name or email.'
        )}
      </EmptyBlock>
    );
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <caption className="sr-only">Users found, by name</caption>
          <thead>
            <tr>
              <th scope="col" className={tableHead}>Name</th>
              <th scope="col" className={tableHead}>Role</th>
              <th scope="col" className={tableHead}>School</th>
              <th scope="col" className={tableHead}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tl-bg">
      <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
        <header>
          <h1 className={pageTitle}>Users</h1>
          <p className={pageSubtitle}>Find anyone on Talim: parents, students, teachers, school admins and Talim staff.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.6fr)_repeat(3,minmax(160px,1fr))]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-search" className={fieldLabel}>
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tl-faint" aria-hidden />
              <input
                id="user-search"
                type="search"
                value={term}
                placeholder="Name or email"
                onChange={(e) => setTerm(e.target.value)}
                className={`${fieldControl} pl-10`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-role" className={fieldLabel}>
              Role
            </label>
            <select id="user-role" className={fieldControl} value={filters.role} onChange={(e) => apply({ role: e.target.value as UserFilters['role'] })}>
              <option value="">Any role</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </div>
          <SchoolPicker label="School" selectedIds={filters.schoolId ? [filters.schoolId] : []} onChange={(ids) => apply({ schoolId: ids[0] ?? '' })} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-status" className={fieldLabel}>
              Status
            </label>
            <select
              id="user-status"
              className={fieldControl}
              value={filters.status}
              onChange={(e) => apply({ status: e.target.value as UserFilters['status'] })}
            >
              {USER_STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {USER_STATUS_FILTER_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {results.isError && results.data ? (
          <Banner tone="danger" action={<button type="button" className={ghostButton} onClick={() => void results.refetch()}>Try again</button>}>
            We couldn&apos;t refresh the results. Showing what loaded earlier.
          </Banner>
        ) : null}

        <section aria-label="Users found" aria-busy={results.isFetching} className={cardFrame}>
          {content}
        </section>

        {rows.length > 0 ? (
          <p className="m-0 text-sm font-semibold text-tl-muted" aria-live="polite">
            {rows.length >= USER_SEARCH_LIMIT
              ? `Showing the first ${USER_SEARCH_LIMIT} by name. Add words or filters to narrow it down.`
              : `${rows.length} ${rows.length === 1 ? 'user' : 'users'} found.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
