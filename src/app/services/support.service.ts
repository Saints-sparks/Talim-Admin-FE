import { api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/app/lib/api/config';
import { toQueryString } from '@/lib/queryString';
import type { PostTicketMessagePayload, UpdateTicketPayload } from '@/types/apiPayloads';
import type { Ticket, TicketDeskCounts, TicketDeskQuery, TicketPage, TicketStaff } from '@/types/tickets';

/** Rows per page of the desk list. */
export const DESK_PAGE_SIZE = 20;

/**
 * The Talim support desk (v1.5 §1, "v1.5 as built"). Every route is
 * platform-admin only. Each screen makes one list call and one counts call;
 * nothing here is called per row.
 *
 * The legacy `/complaints/*` routes this portal used before v1.5 are now thin
 * deprecated wrappers on the backend; this console no longer calls them.
 */
export const supportService = {
  /**
   * One page of the Talim desk, each row with the requester's messages the
   * desk has not read (`unread`). With `scope: 'all'` it also lists every
   * school-desk ticket (`access: 'observer'`), which Talim may read but not
   * change.
   *
   * @param query - Status, area, priority, assignee (`me`, `unassigned` or a
   *   staff id), school, search, page and scope.
   * @returns The page of ticket summaries and its pagination meta.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async listDesk(query: TicketDeskQuery = {}): Promise<TicketPage> {
    return api.get<TicketPage>(
      `${API_ENDPOINTS.TICKETS_TALIM_DESK}${toQueryString({ limit: DESK_PAGE_SIZE, ...query })}`,
    );
  },

  /**
   * The desk's counts by status, in all (`total`), unassigned and mine, in
   * one call.
   *
   * @param scope - `all` to count school-desk tickets too.
   * @returns The counts.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async getDeskCounts(scope?: 'all'): Promise<TicketDeskCounts> {
    return api.get<TicketDeskCounts>(`${API_ENDPOINTS.TICKETS_TALIM_DESK_COUNTS}${toQueryString({ scope })}`);
  },

  /**
   * Who the Talim desk can assign: the active platform admins, by name.
   *
   * @returns The staff.
   * @throws ApiError - `FORBIDDEN` when the caller is not a platform admin.
   */
  async listStaff(): Promise<TicketStaff[]> {
    return api.get<TicketStaff[]>(API_ENDPOINTS.TICKETS_TALIM_DESK_STAFF);
  },

  /**
   * One ticket with its whole thread, internal notes and `context` included
   * (desk staff see them). Opening a Talim-desk ticket marks it read for the
   * desk, so its `unread` comes back 0.
   *
   * @param id - The ticket id.
   * @returns The ticket.
   * @throws ApiError - `NOT_FOUND` when no such ticket exists.
   */
  async getTicket(id: string): Promise<Ticket> {
    return api.get<Ticket>(API_ENDPOINTS.TICKET_BY_ID(id));
  },

  /**
   * Adds a staff reply, or an internal note when `internal` is true; a reply
   * may also set `status` in the same write. The requester is notified of a
   * reply, never of a note.
   *
   * @param id - The ticket id.
   * @param payload - The body (1..5000), up to 5 uploaded attachments, the
   *   internal flag and an optional status.
   * @returns The ticket after the message.
   * @throws ApiError - 409 with `reasonCode` `TICKET_CLOSED`, `MESSAGE_CAP`
   *   (500 messages), `INVALID_TRANSITION` or `TICKET_NOT_ESCALATED` (a
   *   school-desk ticket); 400 for a bad body.
   */
  async postMessage(id: string, payload: PostTicketMessagePayload): Promise<Ticket> {
    return api.post<Ticket>(API_ENDPOINTS.TICKET_MESSAGES(id), payload);
  },

  /**
   * Changes a ticket's status, priority or assignee. Send only what changes.
   *
   * @param id - The ticket id.
   * @param patch - The fields to change; `assigneeId: null` unassigns.
   * @returns The ticket after the change.
   * @throws ApiError - 409 with `reasonCode` `TICKET_CLOSED` or
   *   `INVALID_TRANSITION`; 400 when the assignee is not Talim desk staff.
   */
  async updateTicket(id: string, patch: UpdateTicketPayload): Promise<Ticket> {
    return api.patch<Ticket>(API_ENDPOINTS.TICKET_BY_ID(id), patch);
  },
};
