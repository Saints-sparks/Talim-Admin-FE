/**
 * The v1.5 ticket types this console reads (Talim support desk), as aliases of
 * the generated contract (`./api.d.ts`, from `talimBE-V2` "v1.5 as built").
 * Nothing here is written by hand: refresh the contract with
 * `npm run types:api` and `tsc` reports every screen a change touches.
 *
 * Request bodies live in `./apiPayloads.ts`.
 */
import type { RequestQuery, ResponseBody, Schema } from './apiContract';

/** A ticket in a desk list (`TicketSummaryDto`). */
export type TicketSummary = Schema<'TicketSummaryDto'>;

/** One ticket with its thread, as `GET /tickets/:id` and every write answer it (`TicketDto`). */
export type Ticket = Schema<'TicketDto'>;

/** One message of a thread; desk staff also get internal notes. */
export type TicketMessage = Schema<'TicketMessageDto'>;

/** A file on a message, as stored (`{ url, name, mimeType, size }`). */
export type TicketAttachment = Schema<'TicketAttachmentDto'>;

/** A file to send with a message (an uploaded https URL and its facts). */
export type TicketAttachmentInput = Schema<'TicketAttachmentInputDto'>;

/** Where the requester was when they raised it; staff only. */
export type TicketContext = Schema<'TicketContextDto'>;

/** Which desk a ticket sits on. */
export type TicketDesk = TicketSummary['desk'];

/** What a ticket is about. */
export type TicketArea = TicketSummary['area'];

/** Workflow status. */
export type TicketStatus = TicketSummary['status'];

/** Triage priority. */
export type TicketPriority = TicketSummary['priority'];

/** How the caller may use a ticket: `desk` acts on it, `observer` only reads it. */
export type TicketAccess = TicketSummary['access'];

/** Query of `GET /tickets/desk/talim`. */
export type TicketDeskQuery = RequestQuery<'/tickets/desk/talim'>;

/** One page of a desk list. */
export type TicketPage = ResponseBody<'/tickets/desk/talim'>;

/** `GET /tickets/desk/talim/counts`: per status, in all, unassigned and mine. */
export type TicketDeskCounts = Schema<'TicketCountsDto'>;

/** Someone the desk can assign (`GET /tickets/desk/talim/staff`). */
export type TicketStaff = Schema<'TicketStaffDto'>;
