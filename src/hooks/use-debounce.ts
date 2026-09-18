import { useEffect, useState } from 'react';

/**
 * A value that only updates once it has stopped changing, so a search box does
 * not fire a request per keystroke.
 *
 * @typeParam T - The value type.
 * @param value - The value to debounce.
 * @param delay - Quiet period in milliseconds before the value updates.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
