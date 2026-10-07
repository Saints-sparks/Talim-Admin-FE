'use client';

import React from 'react';
import { getErrorMessage } from '@/lib/apiError';
import { card, cardTitle, eyebrow, focusRing, pill, pillTone } from '@/components/tl/styles';
import type { RecipientPreviewState } from '@/hooks/useRecipientPreview';
import type { BroadcastRole } from '@/types/broadcasts';
import { ROLE_LABELS, formatCount } from './broadcast-model';

/** How many schools the breakdown lists before "and N more". */
const TOP_SCHOOLS = 5;

/**
 * The live recipient count beside the composer: the total, by role and the
 * largest schools. The total sits in a polite live region, so a screen
 * reader hears it change as the audience does.
 *
 * @param props - The preview state and whether the audience is complete.
 * @param props.preview - From `useRecipientPreview`.
 * @param props.audienceProblem - Why there is nothing to count yet, if anything.
 * @returns The card.
 */
export function RecipientPreview({ preview, audienceProblem }: { preview: RecipientPreviewState; audienceProblem: string | null }) {
  const { data, isCounting, error, retry } = preview;
  const roles = data ? (Object.entries(data.byRole) as [BroadcastRole, number][]).filter(([, n]) => n > 0) : [];
  const schools = data ? [...data.bySchool].sort((a, b) => b.count - a.count) : [];

  let total: React.ReactNode;
  if (audienceProblem) total = <span className="text-base font-bold text-tl-muted">Choose who should receive it.</span>;
  else if (error) total = <span className="text-base font-bold text-tl-danger">Could not count recipients.</span>;
  else if (!data) total = <span className="text-base font-bold text-tl-muted">Counting…</span>;
  else total = <span>{formatCount(data.recipients)}</span>;

  return (
    <section className={`${card} flex flex-col gap-3`} aria-labelledby="preview-title">
      <h2 id="preview-title" className={cardTitle}>
        Recipients
      </h2>
      <div aria-live="polite" aria-atomic="true" data-testid="recipient-count">
        <p className={`${eyebrow} m-0`}>Will receive it</p>
        <p className={`m-0 mt-1 text-[34px] font-extrabold tracking-[-0.6px] text-tl-ink transition-opacity ${isCounting ? 'opacity-50' : ''}`}>
          {total}
        </p>
        {isCounting && data ? <p className="m-0 text-xs font-semibold text-tl-muted">Updating…</p> : null}
      </div>
      {error && !audienceProblem ? (
        <div className="text-sm text-tl-muted">
          {getErrorMessage(error)}{' '}
          <button type="button" className={`font-bold text-tl-link underline ${focusRing}`} onClick={retry}>
            Try again
          </button>
        </div>
      ) : null}
      {data && !audienceProblem ? (
        <>
          {roles.length ? (
            <div>
              <p className={`${eyebrow} m-0 mb-1.5`}>By role</p>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {roles.map(([role, n]) => (
                  <li key={role} className={`${pill} ${pillTone.info}`}>
                    {ROLE_LABELS[role] ?? role}: {formatCount(n)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {schools.length ? (
            <div>
              <p className={`${eyebrow} m-0 mb-1.5`}>By school</p>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
                {schools.slice(0, TOP_SCHOOLS).map((s) => (
                  <li key={s.schoolId ?? 'none'} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate font-semibold text-tl-ink">{s.schoolId ? s.name || 'School' : 'No school on their account'}</span>
                    <span className="shrink-0 font-bold text-tl-body">{formatCount(s.count)}</span>
                  </li>
                ))}
              </ul>
              {schools.length > TOP_SCHOOLS ? (
                <p className="m-0 mt-1 text-xs font-semibold text-tl-muted">and {schools.length - TOP_SCHOOLS} more schools</p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
