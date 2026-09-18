'use client';

import React from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { ApiError } from '@/lib/apiError';
import { getErrorMessage } from '@/lib/apiError';

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  /** The thrown value; its `error.code` picks the title. */
  error?: unknown;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

/** Titles keyed on the API's stable `error.code`, never on message text. */
const TITLE_BY_CODE: Partial<Record<string, string>> = {
  NETWORK_OFFLINE: "You're offline",
  SERVICE_UNAVAILABLE: "We couldn't reach the server",
  REQUEST_TIMEOUT: 'That took too long',
  UNAUTHENTICATED: 'Your session has ended',
  TOKEN_EXPIRED: 'Your session has ended',
  FORBIDDEN: 'You do not have access',
  NOT_FOUND: 'Not found',
  RATE_LIMITED: 'Too many requests',
  VALIDATION_FAILED: 'Some fields need attention',
  INTERNAL_ERROR: 'Something went wrong',
};

/**
 * The centred spinner every page shows while its first request is in flight.
 *
 * @param props - Optional message under the spinner.
 * @param props.message - What is loading.
 * @returns The loading block.
 */
export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
      <p className="text-sm text-[#6F6F6F]">{message}</p>
    </div>
  );
}

/**
 * The failure block. Pass the thrown `error` and the copy is keyed on its
 * `error.code`; `title`/`message` override it when a page has better wording.
 *
 * @param props - The error and optional overrides.
 * @param props.error - The thrown value.
 * @param props.title - Overrides the code-derived heading.
 * @param props.message - Overrides the error's own message.
 * @param props.onRetry - Shows a retry button when given.
 * @param props.retryText - Label for that button.
 * @returns The error block.
 */
export function ErrorState({ error, title, message, onRetry, retryText = 'Retry' }: ErrorStateProps) {
  const code = error instanceof ApiError ? error.code : undefined;
  const heading = title ?? (code ? TITLE_BY_CODE[code] : undefined) ?? 'Something went wrong';
  const body = message ?? getErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-4">
      <AlertTriangle className="h-10 w-10 text-amber-400" />
      <div className="text-center">
        <p className="text-base font-semibold text-[#030E18]">{heading}</p>
        <p className="mt-1 max-w-sm text-sm text-[#6F6F6F]">{body}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#F1F1F1] bg-white px-4 py-2 text-xs font-medium text-[#030E18] transition-colors hover:border-[#D7E6F6]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryText}
        </button>
      )}
    </div>
  );
}

/**
 * The "nothing here yet" block, with an optional primary action.
 *
 * @param props - Icon, copy and optional action.
 * @param props.icon - Rendered above the title.
 * @param props.title - The heading.
 * @param props.message - Supporting copy.
 * @param props.actionText - Label for the action button.
 * @param props.onAction - Called when the action button is pressed.
 * @returns The empty block.
 */
export function EmptyState({ icon, title, message, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#F1F1F1] bg-white py-16 px-4">
      {icon}
      <p className="text-sm font-semibold text-[#030E18]">{title}</p>
      {message && <p className="max-w-sm text-center text-xs text-[#878787]">{message}</p>}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-lg bg-[#003366] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#002244]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
