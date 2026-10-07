'use client';

import React, { useId } from 'react';
import { Info } from 'lucide-react';
import { SchoolPicker } from '@/components/schools/SchoolPicker';
import { chip, fieldLabel } from '@/components/tl/styles';
import type { BroadcastRole } from '@/types/v15';
import { ROLE_OPTIONS, type BroadcastForm } from './broadcast-model';

/** The audience part of the form. */
type AudienceFields = Pick<BroadcastForm, 'audienceMode' | 'schoolScope' | 'schoolIds' | 'roles' | 'userIds'>;

/** Props for {@link AudienceBuilder}. */
export interface AudienceBuilderProps {
  value: AudienceFields;
  onChange: (patch: Partial<AudienceFields>) => void;
  /** The audience's problem, shown under it. */
  error?: string;
  disabled?: boolean;
}

/**
 * One option card of a radio group: a native radio inside a 44px+ label.
 *
 * @param props - The radio and its copy.
 * @param props.name - The group name.
 * @param props.checked - Whether it is chosen.
 * @param props.onSelect - Chooses it.
 * @param props.title - The bold line.
 * @param props.description - The line under it.
 * @param props.disabled - Turns it off.
 * @returns The card.
 */
function RadioCard({
  name,
  checked,
  onSelect,
  title,
  description,
  disabled,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label
      className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tl-link ${
        checked ? 'border-tl-control bg-tl-select' : 'border-tl-line bg-tl-surface hover:bg-tl-subtle'
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        disabled={disabled}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        className="mt-1 h-4 w-4 accent-[rgb(var(--tl-brand-fill))]"
      />
      <span>
        <span id={`${id}-title`} className="block text-[15px] font-extrabold text-tl-ink">
          {title}
        </span>
        <span id={`${id}-desc`} className="block text-[13px] text-tl-muted">
          {description}
        </span>
      </span>
    </label>
  );
}

/**
 * Who a broadcast goes to (v1.5 §2 `audience`): everyone, or the chosen
 * roles in every school or in chosen schools, plus specific people.
 *
 * Specific people are shown but off: finding a user by email needs an
 * admin-wide user search, and the API has none (`GET /users/search`
 * searches only the caller's own school, and a platform admin has none).
 *
 * @param props - See {@link AudienceBuilderProps}.
 * @param props.value - The audience fields.
 * @param props.onChange - Called with the fields that changed.
 * @param props.error - The audience's problem.
 * @param props.disabled - Turns the builder off.
 * @returns The builder.
 */
export function AudienceBuilder({ value, onChange, error, disabled = false }: AudienceBuilderProps) {
  const toggleRole = (role: BroadcastRole) =>
    onChange({ roles: value.roles.includes(role) ? value.roles.filter((r) => r !== role) : [...value.roles, role] });

  return (
    <fieldset className="m-0 flex flex-col gap-4 border-0 p-0" aria-describedby={error ? 'audience-error' : undefined}>
      <legend className="sr-only">Audience</legend>
      <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Send to">
        <RadioCard
          name="audience-mode"
          checked={value.audienceMode === 'everyone'}
          onSelect={() => onChange({ audienceMode: 'everyone' })}
          title="Everyone"
          description="Every active user on Talim, in every school."
          disabled={disabled}
        />
        <RadioCard
          name="audience-mode"
          checked={value.audienceMode === 'custom'}
          onSelect={() => onChange({ audienceMode: 'custom' })}
          title="Choose an audience"
          description="Roles in all or some schools, plus specific people."
          disabled={disabled}
        />
      </div>

      {value.audienceMode === 'custom' ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-tl-line-soft bg-tl-subtle p-4">
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className={`${fieldLabel} mb-2`}>Schools</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <RadioCard
                name="school-scope"
                checked={value.schoolScope === 'all'}
                onSelect={() => onChange({ schoolScope: 'all' })}
                title="All schools"
                description="The roles below, in every school."
                disabled={disabled}
              />
              <RadioCard
                name="school-scope"
                checked={value.schoolScope === 'selected'}
                onSelect={() => onChange({ schoolScope: 'selected' })}
                title="Selected schools"
                description="Only the schools you pick."
                disabled={disabled}
              />
            </div>
            {value.schoolScope === 'selected' ? (
              <SchoolPicker
                label="Which schools"
                multiple
                selectedIds={value.schoolIds}
                onChange={(schoolIds) => onChange({ schoolIds })}
                disabled={disabled}
              />
            ) : null}
          </fieldset>

          <fieldset className="m-0 border-0 p-0">
            <legend className={`${fieldLabel} mb-2`}>Roles</legend>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const on = value.roles.includes(role.value);
                return (
                  <label key={role.value} className={`${chip(on)} cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tl-link`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={disabled}
                      onChange={() => toggleRole(role.value)}
                      className="h-4 w-4 accent-[rgb(var(--tl-brand-fill))]"
                    />
                    {role.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <span className={fieldLabel} id="people-label">
              Specific people
            </span>
            <input
              type="search"
              aria-labelledby="people-label"
              aria-describedby="people-unavailable"
              placeholder="Search by email"
              disabled
              className="min-h-[46px] w-full cursor-not-allowed rounded-[13px] border border-dashed border-tl-control bg-tl-surface px-3.5 text-[15px] text-tl-muted"
            />
            <p id="people-unavailable" className="m-0 flex items-start gap-1.5 text-xs font-semibold text-tl-muted">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              Not available yet: finding people by email needs an admin-wide user search, which the API does not have. Send to roles and schools for now.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p id="audience-error" role="alert" className="m-0 text-sm font-bold text-tl-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
