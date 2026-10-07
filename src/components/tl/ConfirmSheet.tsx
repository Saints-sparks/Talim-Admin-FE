'use client';

import React, { type ReactNode } from 'react';
import { Sheet } from './Sheet';
import { dangerButton, ghostButton, primaryButton } from './styles';

/** Props for {@link ConfirmSheet}. */
export interface ConfirmSheetProps {
  open: boolean;
  /** Closes without confirming (Cancel, Escape, the close button, the overlay). */
  onCancel: () => void;
  onConfirm: () => void;
  eyebrowText?: ReactNode;
  title: ReactNode;
  /** The paragraph that says what will happen. */
  body: ReactNode;
  confirmLabel: string;
  /** Shown on the confirm button while `busy`. */
  busyLabel?: string;
  busy?: boolean;
  /** The red confirm of a destructive action. */
  danger?: boolean;
  /** Extra content under the paragraph. */
  children?: ReactNode;
}

/**
 * A confirmation sheet: one paragraph, Cancel and the action (ported from the
 * portals). While `busy`, neither button nor Escape dismisses it.
 *
 * @param props - See {@link ConfirmSheetProps}.
 * @param props.open - Whether it is open.
 * @param props.onCancel - Closes without confirming.
 * @param props.onConfirm - Runs the action.
 * @param props.eyebrowText - Small line above the title.
 * @param props.title - The heading.
 * @param props.body - What will happen.
 * @param props.confirmLabel - The action's label.
 * @param props.busyLabel - The action's label while it runs.
 * @param props.busy - True while the action runs.
 * @param props.danger - Red confirm button.
 * @param props.children - Extra content.
 * @returns The sheet.
 */
export function ConfirmSheet({
  open,
  onCancel,
  onConfirm,
  eyebrowText,
  title,
  body,
  confirmLabel,
  busyLabel,
  busy = false,
  danger = false,
  children,
}: ConfirmSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && !busy && onCancel()}
      eyebrowText={eyebrowText}
      title={title}
      footer={
        <>
          <button type="button" className={`${ghostButton} min-h-[48px] flex-1`} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`${danger ? dangerButton : primaryButton} min-h-[48px] flex-1`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (busyLabel ?? confirmLabel) : confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm leading-[1.7] text-tl-body">{body}</div>
      {children}
    </Sheet>
  );
}
