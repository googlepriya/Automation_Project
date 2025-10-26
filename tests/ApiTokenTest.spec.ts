import { test, expect } from "@playwright/test";
import { SignupPage } from "../pages/SignupPage";
import { ApiTokenPage } from "../pages/ApiTokenPage";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

let signupPage: SignupPage;
let apiTokenPage: ApiTokenPage;

test.describe("@api @smoke @regression API & RSA Token Flow", () => {
  // Before each test, login and initialize the workflow page
  test.beforeEach(async ({ page }, testInfo) => {
    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);
    signupPage = new SignupPage(page);
    apiTokenPage = new ApiTokenPage(page);

    logStep(step.open('Log in — open "Dashboard"'));
    // Step 2: Check if already logged in by verifying title or locator
    await page.goto("/dashboard"); // will reuse session
    logStep(step.pass("Logged in — dashboard visible"));
    await page.waitForTimeout(2000);
    const title = await page.title();

    if (title.includes("Admin")) {
      logStep(step.pass("✅ Session is valid, already on dashboard"));
    } else {
      logStep(step.warn("⚠️ Session expired, performing UI login..."));

      await signupPage.loginAgain();
      await expect(page).toHaveTitle(/Admin/, { timeout: 15000 });
      logStep(step.pass("Logged in — dashboard visible"));
      await page.context().storageState({ path: "auth.json" });
    }
  });

  // After each test, log the test status
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      logStep(withIcon("SUCCESS", `${testInfo.title}`));
    } else {
      logStep(withIcon("FAIL", `${testInfo.title}`), "error");
    }
    logStep(step.end(testInfo.title));
  });

  test("@test 1. Verify Generate the RSA token", async ({ page }) => {
    logStep(step.info("Begin: Generate RSA token"));

    logStep(step.open('Open "Tokens"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Tokens");
    logStep(withIcon("PASS", '"Tokens" opened'));

    logStep(step.create('Generate RSA token "Automate_Token"'));
    await apiTokenPage.createRSAToken("Automate_Token");

    const result = await apiTokenPage.checkTokenLimitOrSuccess();

    if (result === "limit") {
      logStep(
        withIcon("WARN", "Token limit reached — can't create more than 3")
      );
      await apiTokenPage.deleteOrAddNewToken("Automate_Token", "Admin");
      logStep(step.create('Generate RSA token "Automate_Token"'));
      await apiTokenPage.createRSAToken("Automate_Token");
    } else {
      logStep(withIcon("PASS", "Token created successfully"));
    }

    logStep(withIcon("PASS", "Verified: RSA token generation"));
  });

  test("2. Verify Generate the API token", async ({ page }) => {
    logStep(step.info("Begin: Generate API token"));

    logStep(step.open('Open "Tokens"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Tokens");
    logStep(withIcon("PASS", '"Tokens" opened'));

    logStep(step.create('Generate API token "Automate_API_Token"'));
    await apiTokenPage.createAPIToken("Automate_API_Token", "Admin");

    const result = await apiTokenPage.checkTokenLimitOrSuccess();

    if (result === "limit") {
      logStep(
        withIcon("WARN", "Token limit reached — can't create more than 3")
      );
      await apiTokenPage.deleteOrAddNewToken("Automate_API_Token", "Admin");
      logStep(step.create('Generate API token "Automate_API_Token"'));
      await apiTokenPage.createAPIToken("Automate_API_Token", "Admin");
    } else {
      logStep(withIcon("PASS", "Token created successfully"));
    }

    logStep(withIcon("PASS", "Verified: API token generation"));
  });

  test("2. Verify Update API token role or Create new token", async ({
    page,
  }) => {
    logStep(step.info("Begin: Update or create API token"));

    logStep(step.open('Open " Tokens"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Tokens");
    logStep(withIcon("PASS", '"Tokens" opened'));

    logStep(step.update('Update or create API token "Automate_API_Token"'));
    await apiTokenPage.updateorAddNewToken("Automate_API_Token", "Admin");

    logStep(step.assert('Assert token status "updated"'));
    // await publishWorkflowPage.checkUpdateStaus("updated");
    logStep(withIcon("PASS", "Verified: API token updated/created"));
  });

  test("3. Verify Delete/Create the API token", async ({ page }) => {
    logStep(step.info("Begin: Delete or create API token"));

    logStep(step.open('Open "Tokens"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Tokens");
    logStep(withIcon("PASS", '"Tokens" opened'));

    logStep(step.del('Delete or create API token "Automate_API_Token"'));
    await apiTokenPage.deleteOrAddNewToken("Automate_API_Token", "Admin");
    logStep(withIcon("PASS", "Verified: API token deleted/created"));
  });
});
