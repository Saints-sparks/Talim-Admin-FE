import type { Complaint, ComplaintStatus } from '@/app/services/support.service';

/** Badge classes per status, so the table and the detail view never diverge. */
export const STATUS_STYLES: Record<ComplaintStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  'In Progress': 'bg-[#EAF2FB] text-[#003366]',
  Resolved: 'bg-emerald-50 text-emerald-700',
};

/**
 * The school a ticket belongs to. The API populates `schoolId` on most tickets
 * but returns a bare id on some, and omits it for tickets filed by users with
 * no school.
 *
 * @param complaint - The ticket.
 * @returns A display name.
 */
export function getSchoolName(complaint: Complaint): string {
  if (!complaint.schoolId) return 'No school';
  return typeof complaint.schoolId === 'string' ? complaint.schoolId : complaint.schoolId.name;
}

/**
 * The school's email, or an em dash when the reference is not populated.
 *
 * @param complaint - The ticket.
 * @returns A display email.
 */
export function getSchoolEmail(complaint: Complaint): string {
  if (!complaint.schoolId || typeof complaint.schoolId === 'string') return '—';
  return complaint.schoolId.email;
}

/**
 * The person who filed the ticket, falling back to their email when the API
 * did not populate a name.
 *
 * @param complaint - The ticket.
 * @returns A display name.
 */
export function getUserName(complaint: Complaint): string {
  if (!complaint.userId) return 'Unknown';
  const { firstName, lastName, email } = complaint.userId;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  return firstName ?? email ?? 'Unknown';
}

/**
 * Up to two initials for an avatar fallback.
 *
 * @param name - The display name.
 * @returns The initials, upper-cased.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * True when a ticket matches a free-text search over its school, subject and
 * ticket number.
 *
 * @param complaint - The ticket.
 * @param query - The search term, already lower-cased by the caller.
 * @returns True on a match.
 */
export function matchesSearch(complaint: Complaint, query: string): boolean {
  if (!query) return true;
  return (
    getSchoolName(complaint).toLowerCase().includes(query) ||
    getSchoolEmail(complaint).toLowerCase().includes(query) ||
    complaint.subject.toLowerCase().includes(query) ||
    complaint.ticket.toLowerCase().includes(query)
  );
}

/**
 * Formats a timestamp for the ticket table and detail view.
 *
 * @param iso - An ISO timestamp.
 * @param style - `short` for the table, `long` for the detail view.
 * @returns The formatted date, or an em dash when the value is unusable.
 */
export function formatTicketDate(iso: string, style: 'short' | 'long' = 'short'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  });
}
