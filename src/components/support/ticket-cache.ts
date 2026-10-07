import type { QueryClient } from '@tanstack/react-query';
import { listPrefix, queryKeys } from '@/lib/queryKeys';

/**
 * Invalidates everything a new message or a ticket change can move: the
 * ticket itself, every page of the queue and the tab counts.
 *
 * @param queryClient - The app's query client.
 * @param ticketId - The ticket that changed.
 * @returns Resolves once the invalidations are queued.
 */
export function invalidateTicket(queryClient: QueryClient, ticketId: string): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) }),
    queryClient.invalidateQueries({ queryKey: listPrefix(queryKeys.tickets.list()) }),
    queryClient.invalidateQueries({ queryKey: listPrefix(queryKeys.tickets.counts()) }),
  ]);
}
