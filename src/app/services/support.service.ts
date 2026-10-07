import { api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/app/lib/api/config';
import { toQueryString } from '@/lib/queryString';
import type {
  PostTicketMessagePayload,
  Ticket,
  TicketDeskCounts,
  TicketDeskQuery,
  TicketPage,
  UpdateTicketPayload,
} from '@/types/v15';

/** Rows per page of the desk list. */
export const DESK_PAGE_SIZE = 20;

/**
 * The Talim support desk (v1.5 contract §1, "Talim desk"). Every route is
 * platform-admin only. Each screen makes one list call and one counts call;
 * nothing here is called per row.
 *
 * The legacy `/complaints/*` routes this portal used before v1.5 are now thin
 * deprecated wrappers on the backend; this console no longer calls them.
 */
export const supportService = {
  /**
   * One page of the Talim desk. With `scope: 'all'` it also lists every
   * school-desk ticket, which Talim may read but not change.
   *
   * @param query - Status, area, priority, assignee, school, search, page and scope.
   * @returns The page of ticket summaries and its pagination meta.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async listDesk(query: TicketDeskQuery = {}): Promise<TicketPage> {
    return api.get<TicketPage>(
      `${API_ENDPOINTS.TICKETS_TALIM_DESK}${toQueryString({ limit: DESK_PAGE_SIZE, ...query })}`,
    );
  },

  /**
   * The desk's tab counts (open, in progress, waiting on user, resolved,
   * unassigned and mine), in one call.
   *
   * @param scope - `all` to count school-desk tickets too.
   * @returns The counts.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async getDeskCounts(scope?: 'all'): Promise<TicketDeskCounts> {
    return api.get<TicketDeskCounts>(`${API_ENDPOINTS.TICKETS_TALIM_DESK_COUNTS}${toQueryString({ scope })}`);
  },

  /**
   * One ticket with its whole thread, internal notes included (desk staff see them).
   *
   * @param id - The ticket id.
   * @returns The ticket.
   * @throws ApiError - `NOT_FOUND` when no such ticket exists.
   */
  async getTicket(id: string): Promise<Ticket> {
    return api.get<Ticket>(API_ENDPOINTS.TICKET_BY_ID(id));
  },

  /**
   * Adds a staff reply, or an internal note when `internal` is true. The
   * requester is notified of a reply, never of a note.
   *
   * @param id - The ticket id.
   * @param payload - The body (1..5000), uploaded attachments and the internal flag.
   * @returns The server's answer (the updated ticket or the new message); callers refetch.
   * @throws ApiError - `CONFLICT` (409) when the ticket is closed or holds 500 messages;
   *   `FORBIDDEN` on a school-desk ticket that was never escalated.
   */
  async postMessage(id: string, payload: PostTicketMessagePayload): Promise<unknown> {
    return api.post<unknown>(API_ENDPOINTS.TICKET_MESSAGES(id), payload);
  },

  /**
   * Changes a ticket's status, priority or assignee. Send only what changes.
   *
   * @param id - The ticket id.
   * @param patch - The fields to change; `assigneeId: null` unassigns.
   * @returns The server's answer (the updated ticket); callers refetch.
   * @throws ApiError - `CONFLICT` (409) when the move is not allowed, such as
   *   reopening after the 7-day window; `FORBIDDEN` on a school-desk ticket.
   */
  async updateTicket(id: string, patch: UpdateTicketPayload): Promise<unknown> {
    return api.patch<unknown>(API_ENDPOINTS.TICKET_BY_ID(id), patch);
  },
};
