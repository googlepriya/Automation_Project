import { test, expect } from "@playwright/test";
import { SignupPage } from "../pages/SignupPage";
import { logStep } from "../utils/logger";
import { TEST_CONFIG } from "../config/config";
import { step, withIcon } from "../utils/step-icons";

let signupPage: SignupPage;

test.describe("Admin Workflows", () => {
  const credentials = TEST_CONFIG.credentials;
  const domainName = `gp ${Date.now()}`;

  test.beforeEach(async ({ page }, testInfo) => {
    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);
    signupPage = new SignupPage(page);
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
/*
  test("@smoke Singin link on Login page & Pwd mismatch Validation", async ({
    page,
  }) => {
    logStep(step.info("Begin: Verify Singin link on Login page"));
    logStep(step.open('Open "Login" page'));
    await signupPage.signinOnLoginPage();
    logStep(withIcon("PASS", "Signin page loaded"));

    logStep(step.assert("Verify password mismatch validation"));
    await signupPage.checkIncorrectPwd(
      domainName,
      "Konnectify@123",
      "Konnectify@1234"
    );
    logStep(withIcon("PASS", "Signup is not successful"));
  });

  test("@smoke Login link on Signup page", async ({ page }) => {
    logStep(step.info("Begin: Verify Login link on Signup page"));
    logStep(step.open('Open "Signup" page'));
    await signupPage.navigateToSignupPage();

    logStep(step.assert('Assert title contains "Register"'));
    await expect(page).toHaveTitle(/Register/, { timeout: 15000 });
    logStep(withIcon("PASS", "Signup page loaded"));

    logStep(step.open('Open "Login" page'));
    await signupPage.loginOnSignupPage();
    logStep(withIcon("PASS", "Login page loaded"));
  });

  test("@smoke @regression Signup or Login based on domain existence", async ({
    page,
  }) => {
    logStep(
      step.info('Begin: Determine flow — "Signup" or "Login" based on domain')
    );

    logStep(step.open('Open "Signup" page'));
    await signupPage.navigateToSignupPage();

    logStep(step.assert('Assert title contains "Register"'));
    await expect(page).toHaveTitle(/Register/, { timeout: 15000 });
    logStep(withIcon("PASS", "Signup page loaded"));

    logStep(step.info(`Check if domain exists — "${credentials.domain}"`));
    const domainExists = await signupPage.checkIfDomainExists(
      credentials.domain
    );

    if (!domainExists) {
      logStep(
        step.create(
          `Domain is new — proceed with signup for "${credentials.domain}"`
        )
      );
      await signupPage.detailsPage();
      logStep(withIcon("PASS", "Signup completed"));
    } else {
      logStep(
        step.open(
          `Domain exists — proceed with login for "${credentials.domain}"`
        )
      );
      await signupPage.login();

      logStep(step.assert('Assert title contains "Komp" (dashboard)'));
      await expect(page).toHaveTitle(/Admin/, { timeout: 15000 });
      logStep(withIcon("PASS", "Logged in — dashboard visible"));
    }
  });
});

test.describe("Admin Workflows", { tag: ["@smoke", "@regression"] }, () => {
  const loginCredentials = TEST_CONFIG.loginCredentials;

  test.beforeEach(async ({ page }, testInfo) => {
    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);
    signupPage = new SignupPage(page);
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      logStep(step.pass(testInfo.title));
    } else {
      logStep(step.fail(testInfo.title));
    }
  });

  for (const [type, creds] of Object.entries(loginCredentials)) {
    test(`@regression Login attempt with ${type} credentials`, async ({
      page,
    }) => {
      logStep(step.info(`Begin: Login with ${type} credentials`));
      logStep(step.type(`Attempt login — email "${creds.email}"`));
      await signupPage.testLogin(creds.email, creds.password);

      if (type === "valid") {
        logStep(step.assert('Assert title contains "Komp" (successful login)'));
        await expect(page).toHaveTitle(/Admin/, { timeout: 15000 });
        logStep(withIcon("PASS", "Login succeeded"));
      } else {
        logStep(step.assert('Assert title contains "Login" (failed login)'));
        await expect(page).toHaveTitle(/Login/, { timeout: 15000 });
        logStep(withIcon("PASS", "Login failed as expected"));
      }
    });
  }
    */
});
