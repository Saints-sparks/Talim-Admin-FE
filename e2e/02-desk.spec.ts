import { test, expect, type Allowed } from "./support/fixtures";
import { ACCOUNTS, authFile } from "./support/creds";
import { apiCall, apiLogin } from "./support/api";
import { settled } from "./support/ui";
import { axeFindings } from "./support/axe";

/**
 * The Talim support desk (v1.5 §1, `/talimsupport`): a teacher's ticket to
 * Talim (raised over the API) is in the queue with its unread badge; the
 * platform admin opens it, adds an internal note (never shown to the teacher),
 * replies (open → in progress), and changes the status. axe on the queue and
 * the ticket. Each run makes its own "E2E <run> ..." ticket.
 */
const RUN = Date.now().toString(36).slice(-5);
const ALLOW: readonly Allowed[] = [];

interface Ticket {
  id: string;
  reference: string;
  status: string;
  messages: { body: string; internal: boolean }[];
}

test.use({ storageState: authFile("platform") });
test.describe.configure({ mode: "serial" });

let ticket: Ticket;
const subject = `E2E ${RUN}: timetable export is blank`;

test("queue → ticket: internal note, reply, status", async ({ page, monitor }) => {
  const teacher = await apiLogin(ACCOUNTS.teacher);
  ticket = await apiCall<Ticket>(teacher, "POST", "/tickets", {
    desk: "talim",
    area: "timetable",
    subject,
    body: "Exporting the timetable to PDF gives an empty page.",
  });

  monitor.clear();
  await page.goto("/talimsupport");
  await expect(page.getByRole("heading", { level: 1, name: "Support desk" })).toBeVisible();
  await settled(page);
  const row = page.getByRole("row").filter({ hasText: subject });
  await expect(row).toBeVisible();
  await expect(row.getByTestId("unread-badge")).toContainText("1");
  await expect(row).toContainText("Greenfield Academy");
  await expect(row).toContainText("Open");

  await row.getByRole("link", { name: new RegExp(subject) }).click();
  await expect(page).toHaveURL(new RegExp(`/talimsupport/${ticket.id}$`));
  await expect(page.getByRole("heading", { level: 1, name: subject })).toBeVisible();

  // Internal note.
  const note = `E2E ${RUN} note: reproduced on Chrome, PDF renderer times out.`;
  await page.getByRole("group", { name: "Message type" }).getByRole("button", { name: "Internal note" }).click();
  await page.getByLabel("Internal note", { exact: true }).fill(note);
  await page.getByRole("button", { name: "Add internal note" }).click();
  await expect(page.getByText("Internal note added", { exact: true })).toBeVisible();
  await expect(page.getByText(note)).toBeVisible();

  // Reply.
  const reply = `E2E ${RUN} reply: thanks, we are fixing the PDF export.`;
  await page.getByRole("group", { name: "Message type" }).getByRole("button", { name: "Reply" }).click();
  await page.getByLabel("Reply to the requester").fill(reply);
  await page.getByRole("button", { name: "Send reply" }).click();
  await expect(page.getByText("Reply sent", { exact: true })).toBeVisible();
  await expect(page.getByText(reply)).toBeVisible();
  await expect(page.locator("#ticket-status")).toHaveValue("in_progress");

  // Status.
  await page.locator("#ticket-status").selectOption("resolved");
  await expect(page.getByText("Status changed to Resolved", { exact: true })).toBeVisible();
  await expect(page.locator("#ticket-status")).toHaveValue("resolved");

  // The teacher sees the reply and the status, never the note.
  const seen = await apiCall<Ticket>(teacher, "GET", `/tickets/${ticket.id}`);
  expect(seen.status).toBe("resolved");
  expect(seen.messages.map((m) => m.body)).toContain(reply);
  expect(seen.messages.map((m) => m.body)).not.toContain(note);
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  expect(monitor.unexpected(ALLOW)).toEqual([]);
});

test("axe: the desk queue and a ticket", async ({ page }) => {
  const failures: string[] = [];
  for (const [route, label] of [
    ["/talimsupport", "/talimsupport"],
    [`/talimsupport/${ticket.id}`, "/talimsupport/:id"],
  ] as const) {
    await page.goto(route);
    await settled(page);
    await page.waitForTimeout(500);
    for (const f of await axeFindings(page, label, "desk")) failures.push(`${label}: ${f.rule} [${f.impact}] ${f.targets.join(" | ")}`);
  }
  expect(failures).toEqual([]);
});
