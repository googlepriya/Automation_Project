import { test, expect } from "@playwright/test";
import { logStep } from "../utils/logger";
import { SignupPage } from "../pages/SignupPage";
import { step, withIcon } from "../utils/step-icons";
import { EventLogPage } from "../pages/EventLogPage";
import { CatchhookPage } from "../pages/CatchhookPage";

test.describe("Eventlogs Flow", () => {
  let signupPage: SignupPage;
  let eventlogPage: EventLogPage;
  let catchhookPage: CatchhookPage;

  const eventlogName = "Catchhook_Test";
  const contactName = "API Test";
  const konName = "Filter with Dynamic field";
  const status = "Success";
  const customer = "Default Customer";

  // const eventlogName = "codeblock-flow-test";
  // const catchHookURL = "https://gp6.prestaging.us.konnectify.dev/webhook/715";
  const catchHookURL = "https://gp2.us.konnectifyapp.co/webhook/231";
  //const catchHookURL = "https://gp3.us.konnectifyapp.co/webhook/236";
  //const catchHookURL = "https://gp2.us.konnectifyapp.co/webhook/237";
  const timestamp = Date.now();
  const contactEmail = `api.+${timestamp}@gmail.com`;
  const payload = {
    id: "12345",
    name: contactName,
    email: contactEmail,
    status: "TestData",
  };

  test.beforeEach(async ({ page }, testInfo) => {
    signupPage = new SignupPage(page);
    eventlogPage = new EventLogPage(page);
    catchhookPage = new CatchhookPage(page);
    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);

    logStep(step.start(`Begin Login to the product`));
    // Login
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

  test("@regression Verify old logs still accessible", async ({
    page,
    request,
  }) => {
    //
    // ---------- VERIFY Before execution ----------
    //
    logStep(step.start(`Begin Verify: Old logs still accessible`));

    logStep(step.open("Navigate to Eventlogs Page"));
    await signupPage.openSubmenu("Event Logs");
    await eventlogPage.checkEventlogPage();

    logStep(withIcon("PASS", "Redirected to Eventlog page"));

    logStep(step.assert("Check Old logs Before execution"));
    await eventlogPage.checkLogsAccessbility(eventlogName, contactName);
    logStep(withIcon("PASS", "Old eventlog is accessible"));
    logStep(step.end(`Verified: Old logs still accessible`));
  });

  test("@regression Test Eventlog Filters ", async ({ page, request }) => {
    logStep(step.start(`Begin Verify: Apply filters & Reset Filters`));

    logStep(step.open("Navigate to Eventlogs Page"));
    await signupPage.openSubmenu("Event Logs");
    await eventlogPage.checkEventlogPage();
    logStep(withIcon("PASS", "Redirected to Eventlog page"));

    // Expect 25 rows initially
    await expect(eventlogPage.getRows()).toHaveCount(21);

    // Scroll once → expect 50
    await eventlogPage.scrollAndLoadMore(41);

    logStep(step.filter("Apply Filters"));
    await eventlogPage.applyFilters(konName, customer, status, eventlogName);
    logStep(withIcon("PASS", "Eventlogs are Filtered"));

    logStep(step.filter("Reset Filters"));
    await eventlogPage.resetFilter(eventlogName);
    logStep(
      withIcon("PASS", "Applied Filter is removed. All the logs are displaying")
    );
    logStep(step.end(`Verified: Apply filters & Reset Filters`));
  });

  test("@smoke @regression Verify latest logs accessible", async ({
    page,
    request,
  }) => {
    logStep(step.start(`Begin Verify: New logs accessible after execution`));

    //
    // ---------- Execute & VERIFY ----------
    //

    logStep(step.type("Execute the CatchHook URL via API"));
    const response = await catchhookPage.sendSampleData(
      request,
      catchHookURL,
      payload
    );
    // ✅ Access response
    const body = await response.json(); // parse JSON
    const parsedBody = JSON.parse(body.result.data.body);

    // ✅ Store values from response
    const receivedName = parsedBody.data.name;
    expect(receivedName).toBe(contactName);

    // ✅ Reuse later in the test
    logStep(step.verify(`Webhook received name: ${receivedName}`));

    logStep(step.open("Navigate to Eventlogs Page"));
    await signupPage.openSubmenu("Event Logs");
    await eventlogPage.checkEventlogPage();
    logStep(withIcon("PASS", "Redirected to Eventlog page"));

    logStep(step.assert("Check new logs after execution"));
    await eventlogPage.checkLogsAccessbility(eventlogName, contactName);
    logStep(withIcon("PASS", "New Event log is accessible after execution"));
    logStep(step.end(`Verified: Old logs still accessible`));
  });

  test("@regression paginate through event logs", async ({ page }) => {
    logStep(step.start("Begin Verify: Eventlog page pagination"));

    // --- Navigate to Eventlogs Page ---
    logStep(step.open("Navigate to Eventlogs Page"));
    await signupPage.openSubmenu("Event Logs");
    await eventlogPage.checkEventlogPage();
    logStep(step.pass("Redirected to Eventlogs page"));

    // --- Initial load check ---
    logStep(step.verify("Verify initial row count is 21"));
    await expect(eventlogPage.getRows()).toHaveCount(21);
    logStep(step.pass("Initial 21 rows loaded"));

    // --- Scroll to load more ---
    logStep(step.scroll("Scroll down to load more rows"));
    await eventlogPage.scrollAndLoadMore(41);
    logStep(step.pass("Loaded 20 more rows, total = 41"));

    /*
    // --- Scroll to load more ---
    logStep(step.scroll("Scroll down to load more rows"));
    await eventlogPage.scrollAndLoadMore(61);
    logStep(step.pass("Loaded 20 more rows, total = 61"));
  */
    // --- Finalize ---
    logStep(step.end("Verified: Eventlog page pagination"));
  });
});
