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
  - a queue with status tabs and counts, filters by area, priority, assignee
    and school, and search; filters live in the URL;
  - an "All schools" view (`?scope=all`) that adds every school-desk ticket,
    read-only until the school escalates it;
  - a ticket page (`/talimsupport/:id`) with the thread, internal notes set
    apart, replies with attachments and an internal-note switch, status,
    priority and assignee controls, and the requester and school;
  - clear messages when the API refuses a change (409): a closed ticket, a
    reopen after the 7-day window, the 500-message cap.
- **Send notification** (`/talimadmindashboard/talimannouncement/new`): one
  composer for broadcasts with title and body counters, an optional
  deep-link target, attachments, an audience builder (everyone, or roles in
  all or selected schools), a live recipient count, push and email (in-app
  always on), send now or schedule, and a confirm step stating the count.
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

### Known gaps

- Adding specific people to a notification's audience is shown but off: the
  API has no admin-wide user search.
- The ticket and broadcast types are hand-written from the contract until the
  backend's generated types carry the new routes.
