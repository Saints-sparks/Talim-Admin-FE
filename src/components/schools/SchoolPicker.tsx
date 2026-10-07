'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, X } from 'lucide-react';
import { schoolService } from '@/app/services/school.service';
import { useDebounce } from '@/hooks/use-debounce';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { fieldControl, focusRing } from '@/components/tl/styles';

/** Schools one search returns. */
const PICKER_LIMIT = 50;

/** Props for {@link SchoolPicker}. */
export interface SchoolPickerProps {
  /** The visible label, also the trigger's accessible name. */
  label: string;
  /** Many schools (checkboxes) or one (radios with "All schools"). */
  multiple?: boolean;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Trigger text when nothing is chosen. */
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Pick one school or several, searched on the server (`GET /schools/search`,
 * debounced, one request per search term, never per school). Names of chosen
 * schools are remembered from the results, so chips keep their labels while
 * the search changes.
 *
 * Keyboard: the trigger opens a panel with a search box and native
 * checkboxes or radios; Escape closes it and returns focus to the trigger.
 *
 * @param props - See {@link SchoolPickerProps}.
 * @param props.label - The visible label.
 * @param props.multiple - Many schools rather than one.
 * @param props.selectedIds - The chosen school ids.
 * @param props.onChange - Called with the new ids.
 * @param props.placeholder - Trigger text when nothing is chosen.
 * @param props.disabled - Turns the picker off.
 * @returns The picker.
 */
export function SchoolPicker({ label, multiple = false, selectedIds, onChange, placeholder, disabled = false }: SchoolPickerProps) {
  const uid = useId();
  const triggerId = `${uid}-trigger`;
  const panelId = `${uid}-panel`;
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const query = useDebounce(term.trim(), 300);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [names, setNames] = useState<Record<string, string>>({});

  const schools = useQuery({
    queryKey: queryKeys.schools.list({ limit: PICKER_LIMIT, query }),
    queryFn: () => schoolService.getAllSchools(1, PICKER_LIMIT, query || undefined),
    staleTime: staleTimes.reference,
  });

  useEffect(() => {
    const rows = schools.data?.data;
    if (!rows?.length) return;
    setNames((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const school of rows) {
        if (next[school._id] !== school.name) {
          next[school._id] = school.name;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [schools.data]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggle = (id: string) => {
    if (!multiple) {
      onChange(id ? [id] : []);
      close();
      return;
    }
    onChange(selectedIds.includes(id) ? selectedIds.filter((s) => s !== id) : [...selectedIds, id]);
  };

  const nameOf = (id: string) => names[id] ?? 'Selected school';
  let summary: string;
  if (selectedIds.length === 0) summary = placeholder ?? (multiple ? 'Choose schools…' : 'All schools');
  else if (!multiple || selectedIds.length === 1) summary = nameOf(selectedIds[0]);
  else summary = `${selectedIds.length} schools selected`;

  const rows = schools.data?.data ?? [];

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col gap-1.5"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <span id={`${uid}-label`} className="text-[13px] font-bold text-tl-muted">
        {label}
      </span>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-labelledby={`${uid}-label ${uid}-summary`}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`${fieldControl} flex items-center justify-between gap-2 text-left`}
      >
        <span id={`${uid}-summary`} className="min-w-0 truncate">
          {summary}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-tl-faint" aria-hidden />
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute left-0 right-0 top-full z-50 mt-1 min-w-[260px] rounded-2xl border border-tl-line bg-tl-surface p-2 shadow-[0_18px_40px_-20px_rgba(15,27,46,0.35)]"
        >
          <input
            type="search"
            aria-label="Search schools"
            placeholder="Search schools…"
            value={term}
            autoFocus
            onChange={(e) => setTerm(e.target.value)}
            className={`${fieldControl} min-h-[44px] text-sm`}
          />
          <fieldset className="m-0 mt-2 max-h-64 overflow-y-auto border-0 p-0">
            <legend className="sr-only">{label}</legend>
            {!multiple ? (
              <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-tl-ink hover:bg-tl-bg">
                <input
                  type="radio"
                  name={`${uid}-school`}
                  checked={selectedIds.length === 0}
                  onChange={() => toggle('')}
                  className="h-4 w-4 accent-[rgb(var(--tl-brand-fill))]"
                />
                All schools
              </label>
            ) : null}
            {schools.isLoading ? (
              <p role="status" className="m-0 px-3 py-3 text-sm text-tl-muted">
                Loading schools…
              </p>
            ) : schools.isError ? (
              <p role="alert" className="m-0 px-3 py-3 text-sm font-semibold text-tl-danger">
                Schools could not be loaded.{' '}
                <button type="button" className={`underline ${focusRing}`} onClick={() => void schools.refetch()}>
                  Try again
                </button>
              </p>
            ) : rows.length === 0 ? (
              <p className="m-0 px-3 py-3 text-sm text-tl-muted">No school matches “{query}”.</p>
            ) : (
              rows.map((school) => (
                <label
                  key={school._id}
                  className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-tl-ink hover:bg-tl-bg"
                >
                  <input
                    type={multiple ? 'checkbox' : 'radio'}
                    name={multiple ? undefined : `${uid}-school`}
                    checked={selectedIds.includes(school._id)}
                    onChange={() => toggle(school._id)}
                    className="h-4 w-4 accent-[rgb(var(--tl-brand-fill))]"
                  />
                  <span className="min-w-0 truncate">{school.name}</span>
                </label>
              ))
            )}
          </fieldset>
          {multiple ? (
            <div className="mt-1 flex justify-end border-t border-tl-line-soft pt-2">
              <button type="button" onClick={close} className={`min-h-[44px] rounded-xl px-4 text-sm font-bold text-tl-brand hover:bg-tl-bg ${focusRing}`}>
                Done
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {multiple && selectedIds.length > 0 ? (
        <ul className="m-0 mt-1 flex list-none flex-wrap gap-1.5 p-0" aria-label={`${label}: chosen`}>
          {selectedIds.map((id) => (
            <li key={id} className="flex min-h-[44px] items-center rounded-xl bg-tl-select pl-3 text-sm font-bold text-tl-brand">
              <span className="max-w-[220px] truncate">{nameOf(id)}</span>
              <button
                type="button"
                aria-label={`Remove ${nameOf(id)}`}
                disabled={disabled}
                onClick={() => onChange(selectedIds.filter((s) => s !== id))}
                className={`flex h-11 w-11 items-center justify-center rounded-xl hover:bg-tl-control/40 ${focusRing}`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
