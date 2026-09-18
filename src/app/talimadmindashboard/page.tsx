'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { School as SchoolIcon, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { schoolService } from '@/app/services/school.service';
import { useDebounce } from '@/hooks/use-debounce';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateComponents';
import DashboardHeader from '@/components/talimdashboard/DashboardHeader';
import Stats from '@/components/talimdashboard/Stats';
import SchoolCard from '@/components/talimdashboard/SchoolCard';

/** Schools per page. */
const PAGE_SIZE = 6;

/**
 * The platform overview: every registered school, searchable and paged.
 *
 * @returns The dashboard page.
 */
export default function Page() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // A new search starts at page one, or page 3 of "all schools" would be asked
  // for with the search term applied and come back empty.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const params = { page: currentPage, limit: PAGE_SIZE, query: debouncedSearch || undefined };

  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery({
    queryKey: queryKeys.schools.list(params),
    queryFn: () => schoolService.getAllSchools(currentPage, PAGE_SIZE, debouncedSearch),
    staleTime: staleTimes.list,
    placeholderData: (previous) => previous,
  });

  const schools = data?.data ?? [];
  const totalPages = data?.meta?.lastPage ?? 1;
  const totalSchools = data?.meta?.total ?? 0;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <DashboardHeader />

      <main className="p-6">
        <div className="grid gap-5">
          <Stats
            totalSchools={totalSchools}
            activeOnPage={schools.filter((school) => school.active).length}
            loadedCount={schools.length}
            isLoading={isLoading}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Badge className="w-fit border-0 bg-[#EAF2FB] px-2.5 text-xs font-medium text-[#003366]">
              {isLoading ? 'Loading…' : `${totalSchools.toLocaleString()} schools`}
            </Badge>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#878787]" />
              <Input
                placeholder="Search schools…"
                aria-label="Search schools"
                className="w-full border-[#F1F1F1] bg-white pl-9 text-sm focus:border-[#003366] focus:ring-[#003366] sm:w-[280px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : isLoading ? (
            <LoadingState message="Loading schools…" />
          ) : schools.length === 0 ? (
            <EmptyState
              icon={<SchoolIcon className="h-12 w-12 text-[#878787]" />}
              title="No schools found"
              message={
                searchTerm
                  ? 'No school matches your search.'
                  : 'Get started by adding your first school to the platform.'
              }
              actionText={searchTerm ? undefined : 'Add a school'}
              onAction={searchTerm ? undefined : () => router.push('/talimregister')}
            />
          ) : (
            <>
              <div
                className={`grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2 lg:grid-cols-3 ${
                  isPlaceholderData ? 'opacity-60' : ''
                }`}
              >
                {schools.map((school) => (
                  <SchoolCard
                    key={school._id}
                    school={school}
                    onClick={(id) => router.push(`/SchoolProfile/view/${id}`)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-2 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-[#F1F1F1] text-xs text-[#030E18] hover:border-[#D7E6F6] disabled:opacity-40"
                  >
                    Previous
                  </Button>
                  <span className="rounded-lg border border-[#F1F1F1] bg-white px-3 py-1.5 text-xs font-medium text-[#6F6F6F]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="border-[#F1F1F1] text-xs text-[#030E18] hover:border-[#D7E6F6] disabled:opacity-40"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
