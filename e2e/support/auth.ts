import { expect, type Page } from "@playwright/test";
import type { Account } from "./creds";

/** Signs in through the real form at /talimadminlogin; resolves once the form has answered. */
export async function signInThroughUi(page: Page, account: Pick<Account, "email" | "password">): Promise<void> {
  await page.goto("/talimadminlogin");
  await page.getByLabel("Email address").fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Signs the platform admin in and waits for the dashboard. */
export async function signInPlatform(page: Page, account: Pick<Account, "email" | "password">): Promise<void> {
  await signInThroughUi(page, account);
  await expect(page).toHaveURL(/\/talimadmindashboard$/, { timeout: 60_000 });
}
