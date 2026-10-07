'use client';

import React, { type ReactNode } from 'react';
import { getErrorMessage } from '@/lib/apiError';
import { card, cardTitle, primaryButton } from './styles';

/**
 * Grey pulsing rows while a list or card loads (the portals' skeleton blocks).
 *
 * @param props - What is loading and how many rows.
 * @param props.label - Read to screen readers ("Loading tickets").
 * @param props.rows - How many rows to draw.
 * @param props.rowHeight - Height of each row in px.
 * @returns The skeleton.
 */
export function SkeletonRows({ label, rows = 5, rowHeight = 56 }: { label: string; rows?: number; rowHeight?: number }) {
  return (
    <div role="status" aria-label={label} aria-busy="true" className="flex flex-col gap-2 p-2">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} aria-hidden className="animate-pulse rounded-2xl bg-tl-line/70" style={{ height: rowHeight }} />
      ))}
    </div>
  );
}

/**
 * The failure card: what could not load, the server's reason and Try again.
 *
 * @param props - The title, the thrown value and the retry.
 * @param props.title - "We couldn't load the support desk".
 * @param props.error - What was thrown; its user-safe message is shown.
 * @param props.onRetry - Shows Try again when given.
 * @returns The card.
 */
export function ErrorCard({ title, error, onRetry }: { title: string; error: unknown; onRetry?: () => void }) {
  return (
    <div className={card} role="alert">
      <h2 className={cardTitle}>{title}</h2>
      <p className="m-0 mt-1.5 text-sm text-tl-muted">{getErrorMessage(error, 'Check your connection and try again.')}</p>
      {onRetry ? (
        <button type="button" className={`${primaryButton} mt-4`} onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

/**
 * The "nothing here" block inside a card.
 *
 * @param props - Title, explanation and an optional action.
 * @param props.title - The heading.
 * @param props.children - The explanation and any action.
 * @returns The block.
 */
export function EmptyBlock({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
      <p className="m-0 text-base font-extrabold text-tl-ink">{title}</p>
      {children ? <div className="max-w-md text-sm text-tl-muted">{children}</div> : null}
    </div>
  );
}

/**
 * A one-line banner (amber notice or red failure) with an optional action.
 *
 * @param props - Tone, text and action.
 * @param props.tone - `warning` for a notice, `danger` for a failure, `info` for a hint.
 * @param props.children - The text.
 * @param props.action - A button or link at the end.
 * @returns The banner.
 */
export function Banner({
  tone = 'warning',
  children,
  action,
}: {
  tone?: 'warning' | 'danger' | 'info';
  children: ReactNode;
  action?: ReactNode;
}) {
  const tones = {
    warning: 'border-tl-warning/25 bg-tl-warning-bg text-tl-warning',
    danger: 'border-tl-danger/25 bg-tl-danger-bg text-tl-danger',
    info: 'border-tl-control bg-tl-select text-tl-brand',
  } as const;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${tones[tone]}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}
