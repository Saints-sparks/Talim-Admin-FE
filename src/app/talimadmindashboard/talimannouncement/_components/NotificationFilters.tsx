'use client';

import { CheckCircle2, Clock3, Loader2, Search, Send, XCircle } from 'lucide-react';
import type { NotificationStats } from '@/app/services/notification.service';
import type { School as SchoolRecord } from '@/app/services/school.service';
import { cn } from '@/lib/utils';
import { ROLE_OPTIONS, TABS } from './constants';
import type { TabKey } from './types';

const TILES = [
  { key: 'total', label: 'Total', icon: Send, tone: 'blue' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, tone: 'emerald' },
  { key: 'scheduled', label: 'Scheduled', icon: Clock3, tone: 'amber' },
  { key: 'failed', label: 'Failed', icon: XCircle, tone: 'violet' },
] as const;

/**
 * The four platform counters. Every figure comes from
 * `GET /notifications/stats/summary`; an em dash means the API did not report
 * it, never a guess.
 *
 * @param props - The stats and their loading state.
 * @param props.stats - The counters, once loaded.
 * @param props.isLoading - True while they are loading.
 * @returns The KPI row.
 */
export function NotificationKpis({
  stats,
  isLoading,
}: {
  stats?: NotificationStats;
  isLoading: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {TILES.map((tile) => (
        <div
          key={tile.key}
          className="flex items-center gap-4 rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm"
        >
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
              tile.tone === 'blue' && 'bg-blue-50 text-blue-600',
              tile.tone === 'emerald' && 'bg-emerald-50 text-emerald-600',
              tile.tone === 'amber' && 'bg-amber-50 text-amber-600',
              tile.tone === 'violet' && 'bg-violet-50 text-violet-600',
            )}
          >
            <tile.icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#101828]">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#98A2B3]" />
              ) : (
                (stats?.[tile.key]?.toLocaleString() ?? '—')
              )}
            </div>
            <p className="text-xs text-[#667085]">{tile.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Tabs plus the filter bar.
 *
 * The search, school and user-type controls narrow the page that is loaded:
 * `NotificationQueryDto` accepts none of them, so there is nothing to push to
 * the server. The list footer says so rather than implying a global count.
 *
 * @param props - The current filter values and their setters.
 * @param props.activeTab - The selected tab.
 * @param props.onTabChange - Selects a tab.
 * @param props.searchQuery - The current search term.
 * @param props.onSearchChange - Updates the search term.
 * @param props.schoolFilter - The selected school id, or `all`.
 * @param props.onSchoolChange - Selects a school.
 * @param props.roleFilter - The selected role, or `all`.
 * @param props.onRoleChange - Selects a role.
 * @param props.schools - Schools available to filter by.
 * @returns The filter bar.
 */
export function NotificationFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  schoolFilter,
  onSchoolChange,
  roleFilter,
  onRoleChange,
  schools,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  schoolFilter: string;
  onSchoolChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  schools: SchoolRecord[];
}) {
  return (
    <>
      <div className="border-b border-[#E8EDF5] px-4 pt-4">
        <div className="flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition',
                activeTab === tab.key
                  ? 'border-[#0B63CE] text-[#0B63CE]'
                  : 'border-transparent text-[#667085] hover:text-[#101828]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-b border-[#E8EDF5] p-4 lg:grid-cols-[minmax(0,1fr)_170px_170px]">
        <div className="flex h-10 items-center rounded-lg border border-[#DCE5F2] bg-white px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-[#98A2B3]" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search this page…"
            aria-label="Search notifications on this page"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
          />
        </div>

        <select
          value={schoolFilter}
          onChange={(e) => onSchoolChange(e.target.value)}
          aria-label="Filter by school"
          className="h-10 rounded-lg border border-[#DCE5F2] bg-white px-3 text-sm text-[#344054] outline-none"
        >
          <option value="all">All Schools</option>
          {schools.map((school) => (
            <option key={school._id} value={school._id}>
              {school.name}
            </option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          aria-label="Filter by user type"
          className="h-10 rounded-lg border border-[#DCE5F2] bg-white px-3 text-sm text-[#344054] outline-none"
        >
          <option value="all">All User Types</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
