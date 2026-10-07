/** A value a query-string parameter may take; empty ones are dropped. */
export type QueryValue = string | number | boolean | null | undefined;

/**
 * Serialises the defined, non-empty params of a filter object into a query
 * string, in insertion order.
 *
 * @param params - The filter values; `undefined`, `null` and `''` are skipped.
 * @returns The query string including `?`, or an empty string when nothing is set.
 */
export function toQueryString(params: object = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, QueryValue][]) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
