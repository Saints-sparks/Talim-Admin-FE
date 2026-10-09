import { test, expect, type Allowed } from "./support/fixtures";
import { ACCOUNTS, authFile } from "./support/creds";
import { signInPlatform, signInThroughUi } from "./support/auth";
import { settled } from "./support/ui";

/**
 * Signing in to the Talim Admin portal: the platform admin lands on the
 * dashboard, and a stored session survives a reload; a school admin is refused
 * with the access-denied banner and stays on the sign-in page.
 */
const ALLOW: readonly Allowed[] = [
  {
    kind: "http",
    match: /POST \/auth\/admin-login -> 40[13]/,
    reason: "The refused sign-in below is the point of the test.",
  },
  {
    kind: "http",
    match: /POST \/auth\/refresh -> 401/,
    reason: "A signed-out visit tries the refresh cookie once on start; there is none.",
  },
];

test("the platform admin signs in and lands on the dashboard", async ({ page, monitor }) => {
  monitor.clear();
  await signInPlatform(page, ACCOUNTS.platform);
  await settled(page);
  await expect(page.getByRole("link", { name: "Support" }).first()).toBeVisible();
  expect(monitor.unexpected(ALLOW)).toEqual([]);
});

test("a school admin is refused", async ({ page, monitor }) => {
  monitor.clear();
  await signInThroughUi(page, ACCOUNTS.schoolAdmin);
  await expect(page.getByText("Access denied", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/talimadminlogin/);
  expect(monitor.unexpected(ALLOW)).toEqual([]);
});

test.describe("a stored session", () => {
  test.use({ storageState: authFile("platform") });

  test("survives a reload (the refresh cookie signs the portal back in)", async ({ page }) => {
    await page.goto("/talimsupport");
    await expect(page.getByRole("heading", { level: 1, name: "Support desk" })).toBeVisible({ timeout: 60_000 });
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Support desk" })).toBeVisible({ timeout: 60_000 });
  });
});
