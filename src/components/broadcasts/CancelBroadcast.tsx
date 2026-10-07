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
import type { Broadcast } from '@/types/v15';
import { formatCount } from './broadcast-model';

/**
 * "Cancel" on a scheduled broadcast, with a confirm sheet. A 409 means it
 * has already started sending; the admin is told and the data reloads.
 *
 * @param props - The broadcast.
 * @param props.broadcast - A scheduled broadcast.
 * @returns The button and its sheet.
 */
export function CancelBroadcastButton({ broadcast }: { broadcast: Pick<Broadcast, 'id' | 'title' | 'sendAt' | 'stats'> }) {
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
      const tooLate = err instanceof ApiError && err.status === 409;
      toast.error(tooLate ? 'Too late to cancel' : 'The notification could not be cancelled', {
        description: tooLate ? 'It has already started sending.' : getErrorMessage(err),
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
            {broadcast.stats.recipients ? <> to its {formatCount(broadcast.stats.recipients)} recipients</> : null}. This cannot be undone.
          </>
        }
      />
    </>
  );
}
