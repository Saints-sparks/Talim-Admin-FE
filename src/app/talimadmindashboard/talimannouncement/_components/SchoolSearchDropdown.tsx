'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { School as SchoolRecord } from '@/app/services/school.service';

/**
 * A searchable multi-select over the schools a notification can target.
 *
 * @param props - The options and selection.
 * @param props.schools - Every school that can be targeted.
 * @param props.selected - The ids currently chosen.
 * @param props.onToggle - Adds or removes one id.
 * @param props.isLoading - True while the school list is still loading.
 * @returns The dropdown element.
 */
export function SchoolSearchDropdown({
  schools,
  selected,
  onToggle,
  isLoading,
}: {
  schools: SchoolRecord[];
  selected: string[];
  onToggle: (id: string) => void;
  isLoading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? schools.filter((school) => school.name.toLowerCase().includes(q)) : schools;
  }, [schools, query]);

  const selectedSchools = schools.filter((school) => selected.includes(school._id));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={isLoading}
        aria-expanded={isOpen}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-[#DCE5F2] px-3 text-sm text-[#667085] outline-none disabled:opacity-60"
      >
        <span className="truncate">
          {isLoading
            ? 'Loading schools…'
            : selectedSchools.length
              ? `${selectedSchools.length} school${selectedSchools.length > 1 ? 's' : ''} selected`
              : 'Choose schools…'}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#98A2B3]" />
      </button>

      {selectedSchools.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {selectedSchools.map((school) => (
            <span
              key={school._id}
              className="inline-flex items-center gap-1 rounded-full bg-[#EFF5FF] px-2 py-0.5 text-xs font-medium text-[#0B63CE]"
            >
              {school.name}
              <button
                type="button"
                aria-label={`Remove ${school.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(school._id);
                }}
                className="ml-0.5 text-[#667085] hover:text-[#0B63CE]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#DCE5F2] bg-white shadow-lg">
          <div className="p-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search schools…"
              className="h-9 text-sm"
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length ? (
              filtered.map((school) => (
                <button
                  key={school._id}
                  type="button"
                  onClick={() => onToggle(school._id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#344054] hover:bg-[#F8FBFF]"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(school._id)}
                    readOnly
                    tabIndex={-1}
                    className="h-4 w-4 accent-[#003366]"
                  />
                  {school.name}
                </button>
              ))
            ) : (
              <p className="p-3 text-sm text-[#667085]">No schools found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
