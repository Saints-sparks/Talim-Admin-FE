/**
 * A value a query-string parameter may take; empty ones are dropped, and a
 * list (e.g. the tickets' `status`) goes comma-separated.
 */
export type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[];

/**
 * Serialises the defined, non-empty params of a filter object into a query
 * string, in insertion order. A list is sent as one comma-separated
 * parameter (`status=open,in_progress`).
 *
 * @param params - The filter values; `undefined`, `null`, `''` and empty lists are skipped.
 * @returns The query string including `?`, or an empty string when nothing is set.
 */
export function toQueryString(params: object = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, QueryValue][]) {
    const text = Array.isArray(value) ? value.join(',') : value === undefined || value === null ? '' : String(value);
    if (text === '') continue;
    search.set(key, text);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
