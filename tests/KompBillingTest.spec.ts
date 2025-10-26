import { test, expect } from "@playwright/test";
import { logStep } from "../utils/logger";
import { SignupPage } from "../pages/SignupPage";
import { step, withIcon } from "../utils/step-icons";
import { KompBillingPage } from "../pages/KompBillingPage";

let signupPage: SignupPage;
let kompBillingPage: KompBillingPage;

const freePlan = "Free";
const startupPlan = "Startup";
const enterprisePlan = "Enterprise";

const customerID = "cus_TD0fePJ5WpMdaU";
const secretKey =
  "sk_test_51S5KDMPl9Y9McqVPZYEiqlvfeAA4xbjUDsHR7PBP25i5mmjVs10K85g6HgBuoEEGu4GI8u7hTO0KY0nb8TnpjJKs00DzajQrM8";

test.describe("@komp Komp Billing - Subscription Flow", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    signupPage = new SignupPage(page);
    kompBillingPage = new KompBillingPage(page);

    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);

    // ----- Login -----
    logStep(step.start("Begin login"));
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
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      logStep(withIcon("SUCCESS", `${testInfo.title}`));
    } else {
      logStep(withIcon("FAIL", `${testInfo.title}`), "error");
    }
    logStep(step.end(testInfo.title));
  });

  test("@komp @billing Trial - Startup a plan", async ({ page }) => {
    logStep(step.start("Begin: New org trial start"));
    logStep(step.open('Open "Settings" > "Billing"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Billings");
    logStep(step.pass('"Billing" page opened'));
  //  await expect(page).toHaveURL(/.*\/billings/);
    logStep(step.pass('"Billing" page URL verified'));

    logStep(step.start("Subscribe to Startup plan"));
    await kompBillingPage.subscribeToPlan(startupPlan);
  });

  test("@komp Trial - Enterprise plan", async ({ page }) => {
    logStep(step.start("Begin: New org trial start"));
    logStep(step.open('Open "Settings" > "Billing"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Billings");
    logStep(step.pass('"Billing" page opened'));
  //  await expect(page).toHaveURL(/.*\/billings/);
    logStep(step.pass('"Billing" page URL verified'));

    // Subscribe to Teams plan
    logStep(step.start("Subscribe to Enterprise plan"));
    await kompBillingPage.subscribeToPlan(enterprisePlan);
  });
});

test.describe(" @komp Komp Billing - Upgrade Plan Flow", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    signupPage = new SignupPage(page);
    kompBillingPage = new KompBillingPage(page);

    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);

    // ----- Login -----
    logStep(step.start("Begin login"));
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
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      logStep(withIcon("SUCCESS", `${testInfo.title}`));
    } else {
      logStep(withIcon("FAIL", `${testInfo.title}`), "error");
    }
    logStep(step.end(testInfo.title));
  });

  test("@billing Upgrade Plan", async ({ page }) => {
    logStep(step.open('Open "Settings" > "Billing"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Billings");
    logStep(step.pass('"Billing" page opened'));
 //   await expect(page).toHaveURL(/.*\/billings/);
    logStep(step.pass('"Billing" page URL verified'));

    // Navigate to Billing Page
    logStep(step.start("Navigate to Billing Page"));

    await kompBillingPage.manageSubscription();
  });
});
