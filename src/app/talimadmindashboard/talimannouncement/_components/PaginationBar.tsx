'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The page numbers to render, with ellipses standing in for the runs that are
 * hidden. Always includes the first, last and current pages.
 *
 * @param currentPage - The page being shown.
 * @param totalPages - How many pages there are.
 * @returns The sequence to render.
 */
export function buildPageSequence(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];
  if (currentPage > 3) pages.push('ellipsis');
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

/**
 * Server-side pagination control for the notification list.
 *
 * @param props - The current page, page count and change handler.
 * @param props.currentPage - The page being shown.
 * @param props.totalPages - How many pages there are.
 * @param props.onChange - Called with the page to move to.
 * @returns The control, or nothing when there is only one page.
 */
export function PaginationBar({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Notification pages" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5F2] disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {buildPageSequence(currentPage, totalPages).map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-[#667085]">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-current={currentPage === page ? 'page' : undefined}
            onClick={() => onChange(page)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium',
              currentPage === page
                ? 'bg-[#003366] text-white'
                : 'border border-[#DCE5F2] text-[#344054] hover:bg-[#F8FBFF]',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5F2] disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
