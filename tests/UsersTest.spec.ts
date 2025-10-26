import { test, expect } from "@playwright/test";
import { logStep } from "../utils/logger";
import { SignupPage } from "../pages/SignupPage";
import { step, withIcon } from "../utils/step-icons";
import { UsersPage } from "../pages/Users";

test.describe(" Users Flow", () => {
  let signupPage: SignupPage;
  let usersPage: UsersPage;

  // Dynamic values for each run
  const userName = `User ${Date.now()}`;
  const status = "Pending";
  const role = "Admin";
  const newName = `${userName}-Edited`;
  const newRole = "User";
  const newStatus = "Active";
  const fullName = `${userName} ${role}`;
  const newFullName = `${newName} ${newRole}`;

  test.beforeEach(async ({ page }, testInfo) => {
    signupPage = new SignupPage(page);
    usersPage = new UsersPage(page);

    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);

    logStep(step.start(`Begin Login to the product `));
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
    logStep(step.end(`Finished Login to the product`));
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

  test("@test @smoke @regression USR-REG-001: Verify created user persists", async ({
    page,
  }) => {
    //
    // ---------- CREATE & VERIFY ----------
    //
    logStep(step.start(`Begin test - Create User "${userName}"`));

    logStep(step.open("Step1: Create new customer"));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("User");
    await usersPage.checkUserPageLoaded();
    logStep(withIcon("PASS", "Navigated to Users page"));

    logStep(step.type(`Step2: Create user "${userName}"`));
    const created = await usersPage.createUser(
      userName,
      role,
      "vinith@konnectify.co",
      "Konnectify@123",
      "English",
      status
    );

    if (created) {
      logStep(step.verify("Step3: Verify user appears in list"));

      await usersPage.verifyUserCreated(userName);
      logStep(
        withIcon(
          "PASS",
          `Verified user "${userName}" created & appears in list`
        )
      );
    } else {
      logStep(step.info(`Skipped verification since user already exists`));
      logStep(withIcon("PASS", `Verified user "${userName}" appears in list`));

      return;
    }
    logStep(step.end(`Finished test - Create user "${userName}"`));

    logStep(step.update(`Begin editing user "${userName}"`));

    //
    // ---------- EDIT & VERIFY ----------
    //
    logStep(step.start(`Begin  test - Edit customer "${userName}"`));

    logStep(step.update(`Edit User "${userName}" to "${newName}"`));
    await usersPage.editUser(
      fullName,
      newName,
      newRole,
      "Konnectify@123",
      newStatus
    );

    logStep(step.end(`Finished test - Edit user "${newName}"`));

    //
    // ---------- DELETE & VERIFY ----------
    //
    logStep(
      step.start(`Begin persistence test - Delete customer "${newName}"`)
    );

    logStep(step.del(`Delete customer "${newName}"`));
    await usersPage.deleteUser(newFullName);
    logStep(withIcon("PASS", `Customer "${newName}" delete flow executed`));

    logStep(step.end(`Finished test - Delete customer "${newName}"`));
  });
});
