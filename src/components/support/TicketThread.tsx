'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { Avatar } from '@/components/tl/Avatar';
import { pill, pillTone } from '@/components/tl/styles';
import { AttachmentLinks } from '@/components/attachments/AttachmentPicker';
import type { TicketMessage } from '@/types/v15';
import { formatWhen } from '@/lib/format';
import { ROLE_LABELS } from './desk-model';

/**
 * The surface classes of a message: internal notes on a dashed amber card,
 * Talim staff replies on the pale brand tint, the requester's on white.
 *
 * @param message - The message.
 * @returns The class string.
 */
function messageSurface(message: TicketMessage): string {
  if (message.internal) return 'border-dashed border-tl-warning/50 bg-tl-warning-bg';
  if (message.author.role === 'admin') return 'border-tl-control bg-tl-select';
  return 'border-tl-line bg-tl-surface';
}

/**
 * A ticket's conversation, oldest first. Internal notes are set apart three
 * ways so nobody mistakes one for a reply: a dashed amber card, an
 * "Internal note" pill with a lock, and that label read out to screen
 * readers before the author.
 *
 * @param props - The messages.
 * @param props.messages - The thread, as `GET /tickets/:id` returns it.
 * @returns The thread.
 */
export function TicketThread({ messages }: { messages: TicketMessage[] }) {
  if (messages.length === 0) {
    return <p className="m-0 text-sm text-tl-muted">No messages yet.</p>;
  }
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0" aria-label="Conversation">
      {messages.map((message) => (
        <li
          key={message.id}
          data-internal={message.internal ? 'true' : undefined}
          className={`rounded-2xl border px-4 py-3.5 ${messageSurface(message)}`}
        >
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Avatar id={message.author.id} name={message.author.name} size={32} />
            {message.internal ? (
              <span className={`${pill} ${pillTone.warning} border border-tl-warning/30`}>
                <Lock className="h-3 w-3" aria-hidden />
                Internal note
              </span>
            ) : null}
            <span className="text-sm font-extrabold text-tl-ink">{message.author.name}</span>
            <span className="text-xs font-semibold text-tl-muted">{ROLE_LABELS[message.author.role] ?? message.author.role}</span>
            <time dateTime={message.createdAt} className="ml-auto text-xs font-semibold text-tl-muted">
              {formatWhen(message.createdAt)}
            </time>
          </div>
          <p className="m-0 mt-2.5 whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-tl-ink">{message.body}</p>
          <AttachmentLinks files={message.attachments} />
          {message.internal ? (
            <p className="m-0 mt-2 text-xs font-semibold text-tl-warning">Only Talim staff can see this note.</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
