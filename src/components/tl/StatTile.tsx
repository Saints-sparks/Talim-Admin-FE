import React, { type ReactNode } from 'react';

/** Props for {@link StatTile}. */
export interface StatTileProps {
  /** The uppercase label. */
  label: string;
  /** The number or text. */
  value: ReactNode;
  /** Colour and size classes for the value. */
  valueClass?: string;
  /** A line under the value ("62% of recipients"). */
  hint?: ReactNode;
  /** The tinted variant used inside cards. */
  subtle?: boolean;
}

/**
 * A stat tile: small uppercase label over a large value (the portals'
 * `StatTile`). Rendered as a `<div>` with the label first, so a screen reader
 * reads "Delivered 1,204".
 *
 * @param props - See {@link StatTileProps}.
 * @param props.label - The uppercase label.
 * @param props.value - The number or text.
 * @param props.valueClass - Colour and size classes for the value.
 * @param props.hint - A line under the value.
 * @param props.subtle - The tinted variant.
 * @returns The tile.
 */
export function StatTile({ label, value, valueClass = 'text-2xl text-tl-ink', hint, subtle = false }: StatTileProps) {
  return (
    <div
      className={`${subtle ? 'rounded-2xl border border-tl-line-soft bg-tl-subtle' : 'rounded-[18px] border border-tl-line bg-tl-surface'} px-4 py-3.5`}
    >
      <div className="text-xs font-extrabold uppercase tracking-[0.05em] text-tl-faint">{label}</div>
      <div className={`mt-1.5 font-extrabold tracking-[-0.3px] ${valueClass}`}>{value}</div>
      {hint ? <div className="mt-0.5 text-xs font-semibold text-tl-muted">{hint}</div> : null}
    </div>
  );
}
