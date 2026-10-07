/**
 * The v1.5 broadcast types this console reads (Talim Admin notifications), as
 * aliases of the generated contract (`./api.d.ts`, from `talimBE-V2` "v1.5 as
 * built"). Nothing here is written by hand: refresh the contract with
 * `npm run types:api` and `tsc` reports every screen a change touches.
 *
 * Request bodies live in `./apiPayloads.ts`.
 */
import type { RequestQuery, ResponseBody, Schema } from './apiContract';

/**
 * Who a broadcast goes to: the union of (schools × roles) and `userIds`;
 * `all` is every active user. Roles without schools are those roles in every
 * school; schools without roles are everyone there.
 */
export type BroadcastAudience = Schema<'BroadcastAudienceDto'>;

/** A role an audience can pick. */
export type BroadcastRole = NonNullable<BroadcastAudience['roles']>[number];

/** `POST /admin/broadcasts/preview`: the count, by school and by role. */
export type BroadcastPreview = Schema<'BroadcastPreviewDto'>;

/** Where a broadcast's button leads, as sent. */
export type BroadcastTargetInput = Schema<'BroadcastTargetInputDto'>;

/** Where a notification's button leads, as answered. */
export type NotificationTarget = Schema<'NotificationTargetDto'>;

/** `POST /admin/broadcasts`: its id, status and audience size. */
export type CreateBroadcastResult = Schema<'BroadcastCreatedDto'>;

/** One broadcast, in the history and on its page (`BroadcastDto`). */
export type Broadcast = Schema<'BroadcastDto'>;

/** A broadcast's lifecycle. */
export type BroadcastStatus = Broadcast['status'];

/** A broadcast's delivery figures. */
export type BroadcastStats = Broadcast['stats'];

/** Query of `GET /admin/broadcasts`. */
export type BroadcastListQuery = RequestQuery<'/admin/broadcasts'>;

/** One page of broadcasts, newest first. */
export type BroadcastPage = ResponseBody<'/admin/broadcasts'>;

/** One person found by `GET /admin/users/search`. */
export type AdminUserSearchItem = Schema<'AdminUserSearchItemDto'>;

/** Query of `GET /admin/users/search`. */
export type AdminUserSearchQuery = RequestQuery<'/admin/users/search'>;
