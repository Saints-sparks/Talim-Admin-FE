/**
 * A short timestamp ("6 Oct 2026, 09:05").
 *
 * @param iso - An ISO timestamp.
 * @returns The formatted value, or an em dash when the value is missing or unusable.
 */
export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
