import fs from "node:fs";
import { test, expect } from "./support/fixtures";
import { authFile } from "./support/creds";
import { settled } from "./support/ui";

/**
 * Screenshots of the main screens for visual review, desktop (1440×900) and
 * mobile (390×844), into e2e/screenshots/<desktop|mobile>/ (gitignored). The
 * portal is light only (no dark theme). Each screen must load its heading.
 */
const SCREENS: readonly { path: string; heading: RegExp; slug: string }[] = [
  { path: "/talimadmindashboard", heading: /./, slug: "dashboard" },
  { path: "/talimschool", heading: /./, slug: "schools" },
  { path: "/talimsupport", heading: /^Support desk$/, slug: "support-desk" },
  { path: "/talimadmindashboard/talimannouncement", heading: /^Notifications$/, slug: "notifications" },
  { path: "/talimadmindashboard/talimannouncement/new", heading: /^Send notification$/, slug: "notifications-new" },
  { path: "/talimadmindashboard/payments", heading: /./, slug: "payments" },
  { path: "/talimadmindashboard/talimsetting", heading: /./, slug: "settings" },
];

for (const [device, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  test.describe(device, () => {
    test.use({ storageState: authFile("platform"), viewport });

    test(`main screens (${device})`, async ({ page, browser }) => {
      test.setTimeout(300_000);
      fs.mkdirSync(`e2e/screenshots/${device}`, { recursive: true });
      for (const screen of SCREENS) {
        await page.goto(screen.path);
        await expect(page.getByRole("heading", { level: 1, name: screen.heading }).first()).toBeVisible({ timeout: 60_000 });
        await settled(page);
        await page.waitForTimeout(600);
        await page.screenshot({ path: `e2e/screenshots/${device}/${screen.slug}.png`, fullPage: true });
      }
      // A ticket, when the desk has one.
      const first = page.locator('a[href^="/talimsupport/"]').first();
      await page.goto("/talimsupport");
      await settled(page);
      if (await first.count()) {
        await first.click();
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await settled(page);
        await page.screenshot({ path: `e2e/screenshots/${device}/support-ticket.png`, fullPage: true });
      }
      const anon = await browser.newContext({ viewport });
      const signIn = await anon.newPage();
      await signIn.route((url) => !["localhost", "127.0.0.1"].includes(url.hostname), (route) => route.abort());
      await signIn.goto("/talimadminlogin");
      await expect(signIn.getByRole("heading", { name: "Welcome back" })).toBeVisible();
      await signIn.waitForTimeout(600);
      await signIn.screenshot({ path: `e2e/screenshots/${device}/sign-in.png`, fullPage: true });
      await anon.close();
    });
  });
}
