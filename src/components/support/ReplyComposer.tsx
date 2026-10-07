'use client';

import React, { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Lock, Send } from 'lucide-react';
import { supportService } from '@/app/services/support.service';
import { ApiError } from '@/lib/apiError';
import { logger } from '@/lib/logger';
import { AttachmentPicker } from '@/components/attachments/AttachmentPicker';
import { fieldHint, fieldLabel, focusRing, primaryButton, segment, segmentTrack } from '@/components/tl/styles';
import type { PostTicketMessagePayload } from '@/types/apiPayloads';
import type { Ticket, TicketAttachmentInput } from '@/types/tickets';
import { MESSAGE_MAX_LENGTH, ticketErrorMessage } from './desk-model';
import { invalidateTicket } from './ticket-cache';

/** Reply to the requester, or a note only Talim staff see. */
type ComposerMode = 'reply' | 'internal';

/**
 * The reply box under a ticket's thread: write a reply or switch to an
 * internal note, attach files (uploaded first, then sent as `{ url, name,
 * mimeType, size }`) and send with the button or Ctrl/⌘+Enter.
 *
 * A closed ticket takes no messages (the API answers 409 `TICKET_CLOSED`),
 * so the box is replaced by an explanation; a 409 that arrives anyway
 * (closed meanwhile, `MESSAGE_CAP`) is explained, the draft is kept and the
 * ticket is reloaded. At most 5 files a message, as the API allows.
 *
 * @param props - The ticket.
 * @param props.ticket - The ticket being answered.
 * @returns The composer.
 */
export function ReplyComposer({ ticket }: { ticket: Ticket }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<ComposerMode>('reply');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<TicketAttachmentInput[]>([]);
  const [uploading, setUploading] = useState(false);
  const onBusyChange = useCallback((busy: boolean) => setUploading(busy), []);

  const send = useMutation({
    mutationFn: (payload: PostTicketMessagePayload) => supportService.postMessage(ticket.id, payload),
    onSuccess: async (_result, payload) => {
      toast.success(payload.internal ? 'Internal note added' : 'Reply sent');
      setBody('');
      setAttachments([]);
      await invalidateTicket(queryClient, ticket.id);
    },
    onError: async (err) => {
      logger.error('support', 'Posting a message failed', err);
      toast.error(failureTitle(err), { description: ticketErrorMessage(err, ticket, { kind: 'reply' }) });
      if (err instanceof ApiError && err.status === 409) await invalidateTicket(queryClient, ticket.id);
    },
  });

  if (ticket.status === 'closed') {
    return (
      <p className="m-0 rounded-2xl border border-tl-line bg-tl-subtle px-4 py-3.5 text-sm font-semibold text-tl-muted" role="status">
        This ticket is closed, so it can no longer take replies or notes.
      </p>
    );
  }

  const internal = mode === 'internal';
  const trimmed = body.trim();
  const canSend = trimmed.length > 0 && body.length <= MESSAGE_MAX_LENGTH && !uploading && !send.isPending;

  const submit = () => {
    if (!canSend) return;
    send.mutate({
      body: trimmed,
      ...(attachments.length ? { attachments } : {}),
      internal,
    });
  };

  return (
    <form
      aria-label={internal ? 'Write an internal note' : 'Write a reply'}
      className={`flex flex-col gap-3 rounded-2xl border p-4 ${internal ? 'border-dashed border-tl-warning/50 bg-tl-warning-bg' : 'border-tl-line bg-tl-subtle'}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className={`${segmentTrack} self-start`} role="group" aria-label="Message type">
        <button type="button" aria-pressed={!internal} className={segment(!internal)} onClick={() => setMode('reply')}>
          <Send className="h-4 w-4" aria-hidden />
          Reply
        </button>
        <button type="button" aria-pressed={internal} className={segment(internal)} onClick={() => setMode('internal')}>
          <Lock className="h-4 w-4" aria-hidden />
          Internal note
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reply-body" className={fieldLabel}>
          {internal ? 'Internal note' : 'Reply to the requester'}
        </label>
        <textarea
          id="reply-body"
          value={body}
          rows={5}
          maxLength={MESSAGE_MAX_LENGTH}
          aria-describedby="reply-help reply-count"
          placeholder={internal ? 'Write a note for Talim staff…' : 'Write your reply…'}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          className={`min-h-[120px] w-full resize-y rounded-[13px] border border-tl-control bg-tl-surface px-3.5 py-3 text-[15px] leading-[1.55] text-tl-ink placeholder:text-tl-faint ${focusRing}`}
        />
        <div className="flex flex-wrap justify-between gap-2">
          <span id="reply-help" className={`${fieldHint} ${internal ? 'text-tl-warning' : ''}`}>
            {internal
              ? 'Only Talim staff see internal notes. The requester is not notified.'
              : 'The requester is notified of your reply.'}
          </span>
          <span id="reply-count" className={fieldHint} aria-live="polite">
            {body.length.toLocaleString()} / {MESSAGE_MAX_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      <AttachmentPicker id="reply-attachments" value={attachments} onChange={setAttachments} onBusyChange={onBusyChange} disabled={send.isPending} />

      <div className="flex justify-end">
        <button type="submit" className={primaryButton} disabled={!canSend}>
          {internal ? <Lock className="h-4 w-4" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {send.isPending ? 'Sending…' : internal ? 'Add internal note' : 'Send reply'}
        </button>
      </div>
    </form>
  );
}

/**
 * The toast title for a failed message.
 *
 * @param err - What was thrown.
 * @returns The title.
 */
function failureTitle(err: unknown): string {
  return err instanceof ApiError && err.status === 409 ? 'Not sent' : 'The message could not be sent';
}
