import { CheckCircle2, School as SchoolIcon } from 'lucide-react';

interface StatsProps {
  /** Schools registered on the platform, from the search endpoint's `meta.total`. */
  totalSchools: number;
  /** Active schools among the ones currently loaded. */
  activeOnPage: number;
  /** How many schools that count was taken from. */
  loadedCount: number;
  isLoading: boolean;
}

/**
 * The two headline counters above the school grid.
 *
 * Both used to carry a "+40 from last month" / "+20 from last month" line that
 * was hardcoded in the page: the API returns no month-over-month figure, so
 * the growth line is gone rather than invented. The active count is explicitly
 * scoped to the loaded page, because `/schools/search` returns no active total.
 *
 * @param props - The counters and their loading state.
 * @param props.totalSchools - Platform-wide school count.
 * @param props.activeOnPage - Active schools among those loaded.
 * @param props.loadedCount - How many schools are loaded.
 * @param props.isLoading - True while the first page is loading.
 * @returns The stats row.
 */
const Stats = ({ totalSchools, activeOnPage, loadedCount, isLoading }: StatsProps) => {
  const value = (n: number) => (isLoading ? '—' : n.toLocaleString());

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-[#F1F1F1] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-[#6F6F6F]">Total Schools</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF2FB]">
            <SchoolIcon className="h-4 w-4 text-[#003366]" />
          </div>
        </div>
        <div className="text-3xl font-bold text-[#030E18]">{value(totalSchools)}</div>
        <p className="mt-1 text-xs text-[#6F6F6F]">Registered on the platform</p>
      </div>

      <div className="rounded-xl border border-[#F1F1F1] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-[#6F6F6F]">Active Schools</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-[#030E18]">{value(activeOnPage)}</div>
        <p className="mt-1 text-xs text-[#6F6F6F]">
          of {isLoading ? '—' : loadedCount} shown on this page
        </p>
      </div>
    </div>
  );
};

export default Stats;
