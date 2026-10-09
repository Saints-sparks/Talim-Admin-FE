import { test as setup } from "@playwright/test";
import { ACCOUNTS, authFile } from "./support/creds";
import { signInPlatform } from "./support/auth";

/** Signs the seeded platform admin in once and stores the session (the API's refresh cookie) for the other specs. */
setup("sign in platform admin", async ({ page }) => {
  await signInPlatform(page, ACCOUNTS.platform);
  await page.context().storageState({ path: authFile("platform") });
});
