# Changelog

All notable changes to the Talim Admin console (the platform admin dashboard).
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project uses [Semantic Versioning](https://semver.org/).

## [1.5.0] - 2026-10-06

Platform sync release (`talimBE-V2/docs/v1.5-platform-sync.md`): one support
system, admin notifications to any audience, the shared design language and
version 1.5.0 across the platform.

### Added

- **Support desk** (`/talimsupport`), the Talim desk of the one ticket system:
  - a queue with status tabs and counts (each status and the total), filters
    by area, priority, assignee (you, unassigned or any desk member) and
    school, and search by reference or subject; filters live in the URL;
  - each row shows the requester's messages the desk has not read ("2 new");
    opening a ticket marks it read;
  - an "All schools" view (`?scope=all`) that adds every school-desk ticket,
    read-only until the school escalates it;
  - a ticket page (`/talimsupport/:id`) with the thread, internal notes set
    apart, replies with attachments (up to 5) and an internal-note switch,
    status, priority and assignee controls (the desk's staff from
    `GET /tickets/desk/talim/staff`), the requester, school and child, and
    where the requester was when they raised it;
  - clear messages when the API refuses a change (409), from its reason
    codes: `TICKET_CLOSED`, `REOPEN_WINDOW_PASSED`, `MESSAGE_CAP`,
    `INVALID_TRANSITION` (and `TICKET_NOT_ESCALATED`, `TICKET_CHANGED`).
- **Send notification** (`/talimadmindashboard/talimannouncement/new`): one
  composer for broadcasts with title and body counters, an optional
  deep-link target, attachments, an audience builder (everyone, or roles in
  all or selected schools, plus specific people found by name or email
  anywhere on Talim with `GET /admin/users/search`), a live recipient count,
  push and email (in-app always on), send now or schedule, and a confirm step
  stating the count.
- **Notification history** with status, the six delivery stats (recipients,
  delivered, read, push sent, email sent, failed), a detail page and Cancel
  while scheduled.
- The footer shows the version, read from `package.json` ("Version 1.5.0").
- Attachments upload through the existing upload client, now with
  `POST /upload/file` beside `POST /upload/image`.

### Changed

- The support and notification pages use the platform's shared design
  language (the portals' `tl` tokens, cards, stat tiles, sheets, tables, tabs,
  chips and states), with 44px targets, labelled controls and focus kept in
  dialogs.
- The version is 1.5.0.

### Removed

- The complaints list, its detail dialog and the attachments tab, replaced by
  the support desk (the backend keeps `/complaints/*` as deprecated wrappers).
- The old notification composer modal and list over `POST`/`GET
  /notifications`, replaced by broadcasts (`/admin/broadcasts`).

- The ticket, broadcast and user-search types are aliases of the backend's
  generated contract (`src/types/tickets.ts`, `src/types/broadcasts.ts`,
  `src/types/apiPayloads.ts`); the hand-written `src/types/v15.ts` is gone.
- `ApiError.reasonCode` carries a route's own reason (the top-level `code`
  of an error body, e.g. `TICKET_CLOSED`) beside the generic `code`.
- A live contract check of the desk and broadcasts through the app's own
  services (`src/__tests__/live.v15.test.ts`, run with `LIVE_API=1` against a
  throwaway API).
