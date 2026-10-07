import { useQuery } from '@tanstack/react-query';
import { broadcastService } from '@/app/services/broadcast.service';
import { useDebounce } from '@/hooks/use-debounce';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import type { BroadcastAudience, BroadcastPreview } from '@/types/v15';

/** What {@link useRecipientPreview} reports. */
export interface RecipientPreviewState {
  /** The latest count for the settled audience; kept while a new one loads. */
  data: BroadcastPreview | undefined;
  /** True while the audience is still changing or its count is loading. */
  isCounting: boolean;
  /** The count for the current audience failed. */
  error: unknown;
  /** True when `data` belongs to the audience on screen (not an earlier one). */
  isCurrent: boolean;
  /** Asks again. */
  retry: () => void;
}

/**
 * The live recipient count for an audience (`POST /admin/broadcasts/preview`).
 *
 * The audience is serialised to a stable key and debounced, so ticking
 * three roles in a row makes one request, and an audience already counted
 * comes from the cache. Nothing is asked while the audience is invalid.
 *
 * @param audience - The audience on screen.
 * @param enabled - False while the audience is invalid.
 * @param delay - The debounce, in milliseconds.
 * @returns The count and its state.
 */
export function useRecipientPreview(audience: BroadcastAudience, enabled: boolean, delay: number): RecipientPreviewState {
  const key = JSON.stringify(audience);
  const settledKey = useDebounce(key, delay);
  const settled = settledKey === key;

  const query = useQuery({
    queryKey: queryKeys.broadcasts.preview(settledKey),
    queryFn: () => broadcastService.preview(JSON.parse(settledKey) as BroadcastAudience),
    enabled: enabled && settled,
    staleTime: staleTimes.list,
    placeholderData: (previous) => previous,
  });

  return {
    data: enabled ? query.data : undefined,
    isCounting: enabled && (!settled || query.isFetching),
    error: enabled && settled && query.isError ? query.error : null,
    isCurrent: enabled && settled && !query.isPlaceholderData && query.isSuccess,
    retry: () => void query.refetch(),
  };
}
