import { expect, type Page } from "@playwright/test";

/** Waits until no skeleton or spinner is left on screen (the page has its data). */
export async function settled(page: Page): Promise<void> {
  await expect(page.locator(".animate-pulse:visible")).toHaveCount(0, { timeout: 30_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
}
