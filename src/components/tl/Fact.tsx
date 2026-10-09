import React from 'react';

/**
 * One fact in a side card's `<dl>` ("Raised", "6 Oct 2026, 09:05"), shared by
 * the ticket and user pages.
 *
 * @param props - The label and value.
 * @param props.label - The term.
 * @param props.children - The value.
 * @returns The pair.
 */
export function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 border-t border-tl-line-soft py-2.5 first:border-t-0 first:pt-0">
      <dt className="text-[13px] font-bold text-tl-muted">{label}</dt>
      <dd className="m-0 min-w-0 break-words text-right text-sm font-semibold text-tl-ink">{children}</dd>
    </div>
  );
}
