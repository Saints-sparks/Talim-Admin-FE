'use client';

import React, { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { broadcastService } from '@/app/services/broadcast.service';
import { useDebounce } from '@/hooks/use-debounce';
import { getErrorMessage } from '@/lib/apiError';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { chip, fieldControl, fieldHint, fieldLabel, focusRing } from '@/components/tl/styles';
import { ROLE_LABELS as TICKET_ROLE_LABELS } from '@/components/support/desk-model';
import type { AudiencePerson } from './broadcast-model';

/** Quiet period before a search term reaches the API. */
export const PEOPLE_SEARCH_DEBOUNCE_MS = 300;

/** Shortest term searched; shorter ones would match half of Talim. */
export const PEOPLE_MIN_TERM = 2;

/** Props for {@link PeoplePicker}. */
export interface PeoplePickerProps {
  /** The people chosen so far. */
  value: AudiencePerson[];
  onChange: (people: AudiencePerson[]) => void;
  disabled?: boolean;
}

/**
 * One line about a person: role, school and email.
 *
 * @param person - The person.
 * @returns e.g. "Teacher · Greenfield Academy · ada@school.test".
 */
export function personDetails(person: AudiencePerson): string {
  return [TICKET_ROLE_LABELS[person.role] ?? person.role, person.school?.name, person.email].filter(Boolean).join(' · ');
}

/**
 * "Specific people" for a broadcast's audience: search anyone on Talim by
 * name or email (`GET /admin/users/search`, debounced, one request per
 * settled term, cached), tick people in the results, and see them as chips
 * that can be removed. The chosen people keep their names when the search
 * changes, because the picker holds them whole.
 *
 * @param props - See {@link PeoplePickerProps}.
 * @param props.value - The chosen people.
 * @param props.onChange - Called with the new list.
 * @param props.disabled - Turns the picker off.
 * @returns The picker.
 */
export function PeoplePicker({ value, onChange, disabled = false }: PeoplePickerProps) {
  const uid = useId();
  const [term, setTerm] = useState('');
  const settled = useDebounce(term.trim(), PEOPLE_SEARCH_DEBOUNCE_MS);
  const searching = settled.length >= PEOPLE_MIN_TERM;

  const results = useQuery({
    queryKey: queryKeys.broadcasts.people(settled),
    queryFn: () => broadcastService.searchPeople({ q: settled }),
    enabled: searching && !disabled,
    staleTime: staleTimes.list,
  });

  const chosen = new Set(value.map((person) => person.id));
  const toggle = (person: AudiencePerson) =>
    onChange(chosen.has(person.id) ? value.filter((p) => p.id !== person.id) : [...value, person]);

  let status: React.ReactNode = null;
  if (!searching) status = term.trim() ? `Type at least ${PEOPLE_MIN_TERM} letters.` : null;
  else if (results.isPending) status = 'Searching…';
  else if (results.isError) status = <span className="text-tl-danger">{getErrorMessage(results.error)}</span>;
  else if (!results.data?.length) status = `Nobody matches “${settled}”.`;
  else status = `${results.data.length} ${results.data.length === 1 ? 'person' : 'people'} found.`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`${uid}-search`} className={fieldLabel}>
        Specific people
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tl-faint" aria-hidden />
        <input
          id={`${uid}-search`}
          type="search"
          value={term}
          disabled={disabled}
          placeholder="Search by name or email"
          aria-describedby={`${uid}-status ${uid}-hint`}
          onChange={(e) => setTerm(e.target.value)}
          className={`${fieldControl} pl-10`}
        />
      </div>
      <p id={`${uid}-hint`} className={`${fieldHint} m-0`}>
        They get it on top of the roles above, in any school.
      </p>
      <p id={`${uid}-status`} className={`${fieldHint} m-0`} aria-live="polite">
        {status}
      </p>

      {searching && results.data?.length ? (
        <ul className="m-0 flex max-h-64 list-none flex-col gap-1 overflow-y-auto rounded-2xl border border-tl-line bg-tl-surface p-1.5" aria-label="People found">
          {results.data.map((person) => {
            const on = chosen.has(person.id);
            return (
              <li key={person.id}>
                <label
                  className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-tl-subtle has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tl-link ${on ? 'bg-tl-select' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={disabled}
                    onChange={() => toggle(person)}
                    className="h-4 w-4 shrink-0 accent-[rgb(var(--tl-brand-fill))]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-tl-ink">{person.name || person.email || 'Unnamed user'}</span>
                    <span className="block truncate text-xs text-tl-muted">{personDetails(person)}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}

      {value.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Chosen people">
          {value.map((person) => (
            <li key={person.id} className={`${chip(true)} max-w-full gap-1.5 pr-1.5`}>
              <span className="min-w-0 truncate">{person.name || person.email || 'Unnamed user'}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value.filter((p) => p.id !== person.id))}
                className={`-my-2.5 grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-tl-subtle ${focusRing}`}
                aria-label={`Remove ${person.name || person.email || 'this person'}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
