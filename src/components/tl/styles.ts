/**
 * Shared class strings of the platform design language (the portals' `tl`
 * set, ported from Talim-Teachers `src/components/tl/styles.ts`). Kept under
 * src/components so Tailwind's content scan sees them. Colours come from the
 * `tl-*` tokens in globals.css.
 *
 * Every interactive class here gives a target of at least 44px and a visible
 * keyboard focus ring.
 */

/** Keyboard focus ring for every interactive element. */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tl-link focus-visible:ring-offset-2 focus-visible:ring-offset-tl-surface';

/** The navy primary button. */
export const primaryButton = `inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-[14px] bg-tl-brand-fill px-[18px] py-3 text-sm font-bold text-tl-on-brand transition-colors hover:bg-tl-brand-fill-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

/** The outlined secondary button. */
export const ghostButton = `inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-[14px] border border-tl-control bg-tl-surface px-[18px] py-3 text-sm font-bold text-tl-brand transition-colors hover:bg-tl-bg disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

/** The small outlined action on list rows and in side cards. */
export const rowButton = `inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-tl-control px-[13px] py-2 text-[13px] font-bold text-tl-brand transition-colors hover:bg-tl-bg disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

/** A text link ("Back to the desk"). */
export const textLink = `inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-md text-sm font-bold text-tl-link hover:underline ${focusRing}`;

/** The white card (radius 22, soft shadow). */
export const card =
  'rounded-[22px] border border-tl-line bg-tl-surface p-[clamp(18px,2.4vw,24px)] shadow-[0_1px_2px_rgba(15,27,46,0.04),0_14px_30px_-22px_rgba(15,27,46,0.18)]';

/** The white card's frame without padding, for cards whose rows run edge to edge (tables). */
export const cardFrame =
  'rounded-[22px] border border-tl-line bg-tl-surface shadow-[0_1px_2px_rgba(15,27,46,0.04),0_14px_30px_-22px_rgba(15,27,46,0.18)]';

/** Page heading (clamp 24-32px, 800). */
export const pageTitle = 'm-0 text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-[-0.6px] text-tl-ink';

/** The line under a page heading. */
export const pageSubtitle = 'm-0 mt-[5px] text-[15px] text-tl-muted';

/** Card heading (19px, 800). */
export const cardTitle = 'text-[19px] font-extrabold tracking-[-0.3px] text-tl-ink';

/** Small uppercase label. */
export const eyebrow = 'text-xs font-extrabold uppercase tracking-[0.07em] text-tl-faint';

/** A rounded pill; add a {@link pillTone}. */
export const pill = 'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[5px] text-xs font-extrabold';

/** Page padding and width inside the shell. */
export const pagePad = 'mx-auto w-full max-w-[1460px] px-[clamp(14px,3vw,26px)] pb-16 pt-[clamp(18px,3vw,28px)]';

/** Header cell of a `tl` table. */
export const tableHead = 'px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.05em] text-tl-faint';

/** Body cell of a `tl` table. */
export const tableCell = 'px-4 py-3 align-middle text-sm text-tl-ink';

/**
 * A selectable chip (status tabs, filter choices).
 *
 * @param on - Whether it is the selected one.
 * @returns The class string.
 */
export function chip(on: boolean): string {
  return `inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border px-[15px] py-2.5 text-sm font-bold transition-colors ${focusRing} ${
    on ? 'border-tl-control bg-tl-select text-tl-brand' : 'border-tl-line bg-tl-surface text-tl-muted hover:text-tl-ink'
  }`;
}

/**
 * One option of a segmented control on the grey track.
 *
 * @param on - Whether it is the selected one.
 * @returns The class string.
 */
export function segment(on: boolean): string {
  return `inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-[10px] px-4 py-2 text-sm font-bold ${focusRing} ${
    on ? 'bg-tl-surface text-tl-brand shadow-[0_1px_2px_rgba(15,27,46,0.1),0_1px_1px_rgba(15,27,46,0.04)]' : 'text-tl-muted hover:text-tl-ink'
  }`;
}

/** The grey track a group of {@link segment}s sits on. */
export const segmentTrack = 'flex max-w-full flex-wrap gap-0.5 rounded-[13px] bg-tl-track p-1';

/** Colour classes for a {@link pill}, by meaning. */
export const pillTone = {
  success: 'bg-tl-success-bg text-tl-success',
  warning: 'bg-tl-warning-bg text-tl-warning',
  muted: 'bg-tl-track text-tl-muted',
  danger: 'bg-tl-danger-bg text-tl-danger',
  accent: 'bg-tl-accent-bg text-tl-accent',
  info: 'bg-tl-select text-tl-brand',
} as const;

/** A tone a {@link pill} can take. */
export type PillTone = keyof typeof pillTone;

/** A labelled form control (select, text input) in a sheet, a form or a toolbar. */
export const fieldControl = `min-h-[46px] w-full rounded-[13px] border border-tl-control bg-tl-surface px-3.5 text-[15px] font-semibold text-tl-ink placeholder:font-medium placeholder:text-tl-faint disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

/** The label above a {@link fieldControl}. */
export const fieldLabel = 'text-[13px] font-bold text-tl-muted';

/** The hint or counter under a {@link fieldControl}. */
export const fieldHint = 'text-xs font-semibold text-tl-faint';

/** The red outlined button. */
export const dangerGhostButton = `inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-tl-danger/30 px-3.5 py-2 text-[13px] font-bold text-tl-danger transition-colors hover:bg-tl-danger-bg disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

/** The red filled button (the confirm in a destructive sheet). */
export const dangerButton = `inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-[14px] bg-tl-danger px-[18px] py-3 text-sm font-bold text-tl-surface transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;
