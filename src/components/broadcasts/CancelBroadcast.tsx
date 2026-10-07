'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { broadcastService } from '@/app/services/broadcast.service';
import { ApiError, getErrorMessage } from '@/lib/apiError';
import { logger } from '@/lib/logger';
import { listPrefix, queryKeys } from '@/lib/queryKeys';
import { ConfirmSheet } from '@/components/tl/ConfirmSheet';
import { dangerGhostButton } from '@/components/tl/styles';
import type { Broadcast } from '@/types/broadcasts';
import { formatCount } from './broadcast-model';

/**
 * "Cancel" on a scheduled broadcast, with a confirm sheet. A 409
 * `BROADCAST_NOT_SCHEDULED` means it has already started sending (or was
 * cancelled meanwhile); the admin is told and the data reloads.
 *
 * @param props - The broadcast.
 * @param props.broadcast - A scheduled broadcast.
 * @returns The button and its sheet.
 */
export function CancelBroadcastButton({ broadcast }: { broadcast: Pick<Broadcast, 'id' | 'title' | 'sendAt' | 'recipientsEstimate'> }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: listPrefix(queryKeys.broadcasts.list()) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.broadcasts.detail(broadcast.id) }),
    ]);

  const cancel = useMutation({
    mutationFn: () => broadcastService.cancel(broadcast.id),
    onSuccess: async () => {
      toast.success('Scheduled notification cancelled');
      setOpen(false);
      await refresh();
    },
    onError: async (err) => {
      logger.error('broadcasts', 'Cancel failed', err);
      setOpen(false);
      const tooLate = err instanceof ApiError && err.status === 409 && err.reasonCode === 'BROADCAST_NOT_SCHEDULED';
      toast.error(tooLate ? 'Too late to cancel' : 'The notification could not be cancelled', {
        description: tooLate ? 'It has already started sending, or was cancelled already.' : getErrorMessage(err),
      });
      if (tooLate) await refresh();
    },
  });

  return (
    <>
      <button type="button" className={dangerGhostButton} onClick={() => setOpen(true)} aria-label={`Cancel “${broadcast.title}”`}>
        Cancel
      </button>
      <ConfirmSheet
        open={open}
        danger
        onCancel={() => setOpen(false)}
        onConfirm={() => cancel.mutate()}
        busy={cancel.isPending}
        busyLabel="Cancelling…"
        eyebrowText="Scheduled notification"
        title="Cancel this notification?"
        confirmLabel="Cancel notification"
        body={
          <>
            “{broadcast.title}” will not be sent
            {broadcast.recipientsEstimate ? <> to its {formatCount(broadcast.recipientsEstimate)} recipients</> : null}. This cannot be undone.
          </>
        }
      />
    </>
  );
}
