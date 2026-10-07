'use client';

import React, { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { eyebrow, focusRing } from './styles';

/** Props for {@link Sheet}. */
export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Small uppercase line above the title. */
  eyebrowText?: ReactNode;
  title: ReactNode;
  /** One or two lines under the title; also the dialog's accessible description. */
  subtitle?: ReactNode;
  children?: ReactNode;
  /** Buttons along the bottom. */
  footer?: ReactNode;
}

/**
 * The platform sheet (ported from the portals): a centred dialog (max 560px)
 * on wider screens and a bottom sheet on phones. Radix supplies the focus
 * trap, Escape to close, focus return to the trigger and `aria-modal`.
 *
 * @param props - See {@link SheetProps}.
 * @param props.open - Whether it is open.
 * @param props.onOpenChange - Called with `false` on Escape, the close button or the overlay.
 * @param props.eyebrowText - Small line above the title.
 * @param props.title - The heading.
 * @param props.subtitle - The accessible description.
 * @param props.children - The body.
 * @param props.footer - The buttons.
 * @returns The dialog.
 */
export function Sheet({ open, onOpenChange, eyebrowText, title, subtitle, children, footer }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-[rgba(15,27,46,0.45)]" />
        <Dialog.Content
          {...(subtitle ? {} : { 'aria-describedby': undefined })}
          className="fixed inset-x-0 bottom-0 z-[81] max-h-[88vh] overflow-y-auto rounded-t-[24px] bg-tl-surface p-[clamp(22px,3vw,30px)] pb-[max(22px,env(safe-area-inset-bottom))] text-tl-ink shadow-[0_30px_70px_-30px_rgba(15,27,46,0.45)] focus:outline-none sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100%-40px)] sm:max-w-[560px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {eyebrowText ? <div className={eyebrow}>{eyebrowText}</div> : null}
              <Dialog.Title className="mt-1.5 text-[21px] font-extrabold leading-tight tracking-[-0.4px] text-tl-ink">
                {title}
              </Dialog.Title>
              {subtitle ? (
                <Dialog.Description className="mt-1 text-[13px] leading-[1.55] text-tl-muted">{subtitle}</Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close
              aria-label="Close"
              className={`-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-tl-faint hover:bg-tl-bg hover:text-tl-ink ${focusRing}`}
            >
              <X className="h-5 w-5" aria-hidden />
            </Dialog.Close>
          </div>
          {children ? <div className="mt-[18px] flex flex-col gap-[18px]">{children}</div> : null}
          {footer ? <div className="mt-[22px] flex gap-2.5">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
