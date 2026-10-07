'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/app/context/AuthContext';
import { supportService } from '@/app/services/support.service';
import { ApiError } from '@/lib/apiError';
import { logger } from '@/lib/logger';
import { queryKeys } from '@/lib/queryKeys';
import { card, cardTitle, fieldControl, fieldHint, fieldLabel, rowButton } from '@/components/tl/styles';
import type { Ticket, TicketPriority, TicketStatus, UpdateTicketPayload } from '@/types/v15';
import {
  PRIORITY_META,
  STATUS_META,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  formatWhen,
  reopenDeadline,
  ticketErrorMessage,
  type ConflictAction,
} from './desk-model';
import { invalidateTicket } from './ticket-cache';

/**
 * What a successful change says, e.g. "Status changed to In progress".
 *
 * @param patch - The change that was saved.
 * @param myUserId - The signed-in admin.
 * @returns The toast text.
 */
export function changeToast(patch: UpdateTicketPayload, myUserId: string | undefined): string {
  if (patch.status) return `Status changed to ${STATUS_META[patch.status].label}`;
  if (patch.priority) return `Priority set to ${PRIORITY_META[patch.priority].label}`;
  if (patch.assigneeId === null) return 'Ticket unassigned';
  if (patch.assigneeId && patch.assigneeId === myUserId) return 'Assigned to you';
  return 'Ticket updated';
}

/**
 * The 409-aware description of what a change was.
 *
 * @param patch - The attempted change.
 * @returns The action, for {@link ticketErrorMessage}.
 */
function actionOf(patch: UpdateTicketPayload): ConflictAction {
  return patch.status ? { kind: 'status', next: patch.status } : { kind: 'update' };
}

/**
 * The "Manage" card beside a ticket: status, priority and assignee, each
 * saved as soon as it changes (`PATCH /tickets/:id` with that field only).
 *
 * The change shows at once and is rolled back if the API refuses it. A 409
 * (for instance reopening after the 7-day window) is explained in words and
 * the ticket is reloaded. On a school-desk ticket every control is off.
 *
 * Assignee choices are you, nobody and whoever holds it now: the contract
 * has no route listing Talim desk staff.
 *
 * @param props - The ticket and whether it may be changed.
 * @param props.ticket - The ticket.
 * @param props.readOnly - True for a school-desk ticket.
 * @returns The card.
 */
export function TicketControls({ ticket, readOnly }: { ticket: Ticket; readOnly: boolean }) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const myUserId = user?.userId;
  const myName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Me';
  const detailKey = queryKeys.tickets.detail(ticket.id);

  const update = useMutation({
    mutationFn: (patch: UpdateTicketPayload) => supportService.updateTicket(ticket.id, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<Ticket>(detailKey);
      if (previous) {
        const assignee =
          patch.assigneeId === undefined
            ? previous.assignee
            : patch.assigneeId === null
              ? null
              : patch.assigneeId === myUserId
                ? { id: patch.assigneeId, name: myName }
                : previous.assignee;
        queryClient.setQueryData<Ticket>(detailKey, { ...previous, ...patch, assignee });
      }
      return { previous };
    },
    onSuccess: (_result, patch) => {
      toast.success(changeToast(patch, myUserId));
    },
    onError: (err, patch, context) => {
      logger.error('support', 'Ticket update failed', err);
      if (context?.previous) queryClient.setQueryData(detailKey, context.previous);
      const before = context?.previous ?? ticket;
      toast.error(err instanceof ApiError && err.status === 409 ? 'Not changed' : 'The ticket could not be changed', {
        description: ticketErrorMessage(err, before, actionOf(patch)),
      });
    },
    onSettled: () => invalidateTicket(queryClient, ticket.id),
  });

  const disabled = readOnly || update.isPending;
  const deadline = reopenDeadline(ticket);
  const otherAssignee = ticket.assigneeId && ticket.assigneeId !== myUserId ? ticket.assigneeId : null;

  return (
    <section className={card} aria-labelledby="manage-title">
      <h2 id="manage-title" className={cardTitle}>
        Manage
      </h2>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-status" className={fieldLabel}>
            Status
          </label>
          <select
            id="ticket-status"
            className={fieldControl}
            value={ticket.status}
            disabled={disabled}
            aria-describedby="ticket-status-hint"
            onChange={(e) => update.mutate({ status: e.target.value as TicketStatus })}
          >
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
          <span id="ticket-status-hint" className={fieldHint}>
            {ticket.status === 'resolved' && deadline
              ? `The requester can reopen it until ${formatWhen(deadline.toISOString())}.`
              : ticket.status === 'closed'
                ? 'Closed tickets take no replies and cannot be reopened.'
                : 'The requester is notified of every status change.'}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-priority" className={fieldLabel}>
            Priority
          </label>
          <select
            id="ticket-priority"
            className={fieldControl}
            value={ticket.priority}
            disabled={disabled}
            onChange={(e) => update.mutate({ priority: e.target.value as TicketPriority })}
          >
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_META[priority].label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-assignee" className={fieldLabel}>
            Assignee
          </label>
          <select
            id="ticket-assignee"
            className={fieldControl}
            value={ticket.assigneeId ?? ''}
            disabled={disabled || !myUserId}
            onChange={(e) => update.mutate({ assigneeId: e.target.value || null })}
          >
            <option value="">Unassigned</option>
            {myUserId ? <option value={myUserId}>Me ({myName})</option> : null}
            {otherAssignee ? <option value={otherAssignee}>{ticket.assignee?.name ?? 'Another staff member'}</option> : null}
          </select>
          {!readOnly && myUserId && ticket.assigneeId !== myUserId ? (
            <button type="button" className={`${rowButton} self-start`} disabled={disabled} onClick={() => update.mutate({ assigneeId: myUserId })}>
              Assign to me
            </button>
          ) : null}
        </div>

        <p className="m-0 text-xs font-semibold text-tl-muted" aria-live="polite">
          {update.isPending ? 'Saving…' : ''}
        </p>
      </div>
    </section>
  );
}
