import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

/**
 * A search box whose term lives in the URL. The box is local while typing;
 * once the term settles, `onSettle` writes it to the URL (and so to the API).
 * When the URL's term changes from outside (the back button, "Clear
 * filters"), the box follows it.
 *
 * @param urlTerm - The term the URL carries now.
 * @param onSettle - Writes a settled term to the URL; the latest one is always called.
 * @param delay - Quiet period in milliseconds before a term settles.
 * @returns The box's value and its setter.
 */
export function useUrlSearchTerm(urlTerm: string, onSettle: (term: string) => void, delay: number): [string, (term: string) => void] {
  const [term, setTerm] = useState(urlTerm);
  const settled = useDebounce(term, delay);
  const lastApplied = useRef(urlTerm);
  const onSettleRef = useRef(onSettle);
  onSettleRef.current = onSettle;

  useEffect(() => {
    if (settled.trim() === lastApplied.current) return;
    lastApplied.current = settled.trim();
    onSettleRef.current(settled);
  }, [settled]);

  useEffect(() => {
    if (urlTerm === lastApplied.current) return;
    lastApplied.current = urlTerm;
    setTerm(urlTerm);
  }, [urlTerm]);

  return [term, setTerm];
}
