import type { Page } from "@playwright/test";
import { test, expect, type Allowed } from "./support/fixtures";
import { authFile } from "./support/creds";
import { apiCall, apiLogin } from "./support/api";
import { ACCOUNTS } from "./support/creds";
import { settled } from "./support/ui";
import { axeFindings } from "./support/axe";

/**
 * Talim Admin notifications (v1.5 §2, broadcasts):
 * - compose to every teacher: the recipient preview shows the count the API's
 *   preview gives; send now; the detail and the history show the stats;
 * - schedule one for tomorrow, then cancel it;
 * - axe on the history, the composer and a broadcast's page.
 * Each run sends its own "E2E <run> ..." broadcasts (in-app rows for the
 * seeded teachers of this throwaway database).
 */
const RUN = Date.now().toString(36).slice(-5);
const NEW = "/talimadmindashboard/talimannouncement/new";
const HISTORY = "/talimadmindashboard/talimannouncement";
const ALLOW: readonly Allowed[] = [];

interface Broadcast {
  id: string;
  status: string;
  stats: { recipients: number; delivered: number };
}

test.use({ storageState: authFile("platform") });
test.describe.configure({ mode: "serial" });

let teachers = 0;
let sentId = "";

/** Opens the composer, fills the message and picks "Teachers" in every school. */
async function compose(page: Page, title: string): Promise<void> {
  await page.goto(NEW);
  await expect(page.getByRole("heading", { level: 1, name: "Send notification" })).toBeVisible();
  await settled(page);
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Message", { exact: true }).fill("The portal will be down for maintenance on Saturday from 22:00 to 23:00.");
  await page.getByRole("radiogroup", { name: "Send to" }).getByRole("radio", { name: "Choose an audience" }).check();
  await page.getByRole("checkbox", { name: "Teachers" }).check();
}

test("compose: the preview counts the audience; send now; the history has the stats", async ({ page, monitor }) => {
  const platform = await apiLogin(ACCOUNTS.platform);
  teachers = (await apiCall<{ recipients: number }>(platform, "POST", "/admin/broadcasts/preview", { audience: { roles: ["teacher"] } })).recipients;
  expect(teachers).toBeGreaterThan(0);

  monitor.clear();
  const title = `E2E ${RUN}: maintenance on Saturday`;
  await compose(page, title);
  await expect(page.getByTestId("recipient-count")).toContainText(String(teachers));
  await page.getByRole("button", { name: "Review and send" }).click();
  const confirm = page.getByRole("dialog", { name: title });
  await expect(confirm.getByTestId("confirm-count")).toContainText(String(teachers));
  const created = page.waitForResponse((r) => /\/admin\/broadcasts$/.test(r.url()) && r.request().method() === "POST");
  await confirm.getByRole("button", { name: `Send to ${teachers} ${teachers === 1 ? "person" : "people"}` }).click();
  const res = await created;
  expect(res.status()).toBe(201);
  expect(res.request().postDataJSON()).toMatchObject({ title, audience: { roles: ["teacher"] } });
  await expect(page.getByText(`Sending to ${teachers} people`, { exact: true })).toBeVisible();

  // The broadcast's page: sent, with its stats (it refreshes while sending).
  await expect(page).toHaveURL(/\/talimannouncement\/[a-f0-9]{24}$/);
  sentId = page.url().split("/").pop()!;
  const stats = page.getByRole("group", { name: "Delivery stats" });
  await expect(stats).toContainText(`Recipients${teachers}`, { timeout: 60_000 });
  const done = await apiCall<Broadcast>(platform, "GET", `/admin/broadcasts/${sentId}`);
  expect(done.stats.recipients).toBe(teachers);

  // The history row carries the same figures.
  await page.goto(HISTORY);
  await settled(page);
  const row = page.getByTestId("broadcast-row").filter({ hasText: title });
  await expect(row).toContainText("Sent");
  await expect(row.locator('[data-stat="recipients"]')).toHaveText(String(teachers));
  expect(monitor.unexpected(ALLOW)).toEqual([]);
});

test("schedule for tomorrow, then cancel", async ({ page, monitor }) => {
  monitor.clear();
  const title = `E2E ${RUN}: scheduled reminder`;
  await compose(page, title);
  await page.getByRole("radio", { name: "Schedule for later" }).check();
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const ymd = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  await page.getByLabel("Date").fill(ymd);
  await page.getByLabel("Time").fill("10:00");
  await expect(page.getByTestId("recipient-count")).toContainText(String(teachers));
  await page.getByRole("button", { name: "Review and schedule" }).click();
  const confirm = page.getByRole("dialog", { name: title });
  await confirm.getByRole("button", { name: `Schedule for ${teachers} ${teachers === 1 ? "person" : "people"}` }).click();
  await expect(page.getByText(`Scheduled for ${teachers} people`, { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/talimannouncement\/[a-f0-9]{24}$/);
  await expect(page.getByText("Scheduled", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: `Cancel “${title}”` }).click();
  await page.getByRole("dialog", { name: "Cancel this notification?" }).getByRole("button", { name: "Cancel notification" }).click();
  await expect(page.getByText("Scheduled notification cancelled", { exact: true })).toBeVisible();
  await expect(page.getByText("Cancelled", { exact: true }).first()).toBeVisible();

  const id = page.url().split("/").pop()!;
  const platform = await apiLogin(ACCOUNTS.platform);
  expect((await apiCall<Broadcast>(platform, "GET", `/admin/broadcasts/${id}`)).status).toBe("cancelled");
  expect(monitor.unexpected(ALLOW)).toEqual([]);
});

test("axe: history, composer and a broadcast", async ({ page }) => {
  const failures: string[] = [];
  for (const [route, label] of [
    [HISTORY, "history"],
    [NEW, "composer"],
    [`${HISTORY}/${sentId}`, "broadcast"],
  ] as const) {
    await page.goto(route);
    await settled(page);
    await page.waitForTimeout(500);
    for (const f of await axeFindings(page, label, "broadcasts")) failures.push(`${label}: ${f.rule} [${f.impact}] ${f.targets.join(" | ")}`);
  }
  expect(failures).toEqual([]);
});
