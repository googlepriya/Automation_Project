import { test, expect } from "@playwright/test";
import { logStep } from "../utils/logger";
import { SignupPage } from "../pages/SignupPage";
import { step, withIcon } from "../utils/step-icons";
import { CustomersPage } from "../pages/Customers";

test.describe(" Customers Flow", () => {
  let signupPage: SignupPage;
  let customersPage: CustomersPage;
  let customerName: string;
  let externalId: string;
  let status: string;

  // Dynamic values for each run
  customerName = `Customer ${Date.now()}`;
  externalId = `EXT-${Math.floor(Math.random() * 10000)}`;
  status = "Onboarding";

  const newName = `${customerName}-Edited`;
  const newExternalId = `EXT-${Math.floor(Math.random() * 10000)}`;
  const newStatus = "Active";

  test.beforeEach(async ({ page }, testInfo) => {
    signupPage = new SignupPage(page);
    customersPage = new CustomersPage(page);

    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);

    logStep(step.start(`Begin Login to the product "${customerName}"`));
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

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      logStep(withIcon("SUCCESS", `${testInfo.title}`));
    } else {
      logStep(withIcon("FAIL", `${testInfo.title}`), "error");
    }
    logStep(step.end(testInfo.title));
  });

  test("@test @persistence CUST-VAL-001: Customer create, edit, delete persistence across relogins", async ({
    page,
  }) => {
    //
    // ---------- CREATE & VERIFY ----------
    //
    logStep(
      step.start(`Begin persistence test - Create customer "${customerName}"`)
    );

    logStep(step.open("Step1: Create new customer"));
    await signupPage.openSubmenu("Customers");
    await customersPage.verifyCustomersPage();
    await customersPage.createCustomer(customerName, externalId, status);
    logStep(withIcon("PASS", `Customer "${customerName}" created`));

    logStep(step.open("Step2: Logout & Login again"));
    await signupPage.logout();
    logStep(withIcon("PASS", "User logged out successfully"));
    await page.waitForTimeout(2000);
    await signupPage.loginAgain();
    logStep(withIcon("PASS", "User logged in again successfully"));

    logStep(
      step.verify("Step3: Verify created customer persists after relogin")
    );
     await customersPage.navigateToCustomersPage();
    await customersPage.verifyCustomersPage();
    const exists = await customersPage.isCustomerPresent(
      customerName,
      externalId
    );
    expect(exists).toBeTruthy();
    logStep(
      withIcon("PASS", `Customer "${customerName}" persisted after relogin`)
    );

    logStep(
      step.end(`Finished persistence test - Create customer "${customerName}"`)
    );

    //
    // ---------- SEARCH & VERIFY ----------
    //
    logStep(
      step.start(
        `Begin persistence test - Search for customer "${customerName}"`
      )
    );

    logStep(step.open(`Step1: Search for customer "${customerName}"`));
    const searchResult = await customersPage.searchCustomer(customerName);
    expect(searchResult).toBeTruthy();
    logStep(
      withIcon("PASS", `Search returned correct result for "${customerName}"`)
    );

    logStep(
      step.end(
        `Finished persistence test - Search for customer "${customerName}"`
      )
    );

    //
    // ---------- EDIT & VERIFY ----------
    //
    logStep(
      step.start(`Begin persistence test - Edit customer "${customerName}"`)
    );

    logStep(
      step.update(`Step1: Edit customer "${customerName}" to "${newName}"`)
    );
    await customersPage.editCustomer(
      customerName,
      externalId,
      newName,
      newExternalId,
      newStatus
    );
    logStep(
      withIcon("PASS", `Customer "${customerName}" updated to "${newName}"`)
    );

    logStep(step.open("Step2: Logout & Login again"));
    await signupPage.logout();
    logStep(withIcon("PASS", "User logged out successfully"));
    await page.waitForTimeout(2000);
    await signupPage.loginAgain();
    logStep(withIcon("PASS", "User logged in again successfully"));

    logStep(
      step.verify(
        `Step3: Verify updated customer "${newName}" persists after relogin`
      )
    );
    await signupPage.openSubmenu("Customers");
    await page.waitForTimeout(2000);
    await customersPage.verifyCustomersPage();
    const existsAfterEdit = await customersPage.isCustomerPresent(
      newName,
      newExternalId
    );
   expect(existsAfterEdit).toBeTruthy();
    logStep(
      withIcon("PASS", `Customer "${newName}" persisted after edit & relogin`)
    );

    logStep(step.end(`Finished persistence test - Edit customer "${newName}"`));

    //
    // ---------- DELETE & VERIFY ----------
    //
    logStep(
      step.start(`Begin persistence test - Delete customer "${newName}"`)
    );

    logStep(step.del(`Step1: Delete customer "${newName}"`));
    await customersPage.deleteCustomer(newName, newExternalId);
    logStep(withIcon("PASS", `Customer "${newName}" delete flow executed`));

    logStep(step.open("Step2: Logout & Login again"));
    await signupPage.logout();
    logStep(withIcon("PASS", "User logged out successfully"));
    await page.waitForTimeout(2000);
    await signupPage.loginAgain();
    logStep(withIcon("PASS", "User logged in again successfully"));

    logStep(
      step.verify(
        `Step3: Verify customer "${newName}" does not persist after deletion`
      )
    );
    await signupPage.openSubmenu("Customers");
    await customersPage.verifyCustomersPage();
    const existsAfterDelete = await customersPage.isCustomerPresent(
      newName,
      newExternalId
    );
    expect(existsAfterDelete).toBeFalsy();
    logStep(
      withIcon(
        "PASS",
        `Customer "${newName}" not found after deletion & relogin`
      )
    );

    logStep(
      step.end(`Finished persistence test - Delete customer "${newName}"`)
    );
  });
});
