import { Page, Locator, expect, request } from "@playwright/test";
import { TEST_CONFIG } from "../config/config";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class SignupPage {
  readonly page: Page;

  private readonly signupLink: Locator;
  private readonly domainInput: Locator;
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly continueButton: Locator;
  private readonly nextButton: Locator;
  private readonly websiteInput: Locator;
  private readonly submitButton: Locator;

  private readonly loginButton: Locator;
  private readonly loginEmailInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly profileMenuBtn: Locator;
  private readonly logoutBtn: Locator;

  private readonly loginLink: Locator;
  private readonly signinLink: Locator;
  private readonly dashboardMenu: Locator;
  private readonly mainMenuLink: (menuName: string) => Locator;
  private readonly submenuLink: (submenuName: string) => Locator;

  constructor(page: Page) {
    this.page = page;

    this.signupLink = page.getByRole("link", { name: "Sign up" });
    this.nextButton = page.getByRole("button", { name: "Next" });

    this.nameInput = page.getByRole("textbox", { name: "Name *" });
    this.websiteInput = page.getByRole("textbox", { name: "Website *" });
    this.submitButton = page.getByRole("button", { name: "Submit" });

    this.domainInput = page.getByRole("textbox", { name: "abc" });
    this.emailInput = page.getByRole("textbox", { name: "Email *" });

    this.passwordInput = page.getByRole("textbox", {
      name: "Password *",
      exact: true,
    });
    this.confirmPasswordInput = page.getByRole("textbox", {
      name: "Confirm Password *",
      exact: true,
    });

    this.continueButton = page.getByRole("button", {
      name: "Continue",
      exact: true,
    });

    this.profileMenuBtn = page.getByText("AD", { exact: true });
    this.logoutBtn = page.getByText("Logout");

    this.loginEmailInput = page.locator('input[type="text"]');
    this.loginPasswordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');

    this.loginLink = page.getByRole("link", { name: "Sign in instead" });
    this.signinLink = page.getByRole("link", { name: "Create an account" });

    // ───────────────────────── Dynamic Locators ─────────────────────────
    // ───────────────────────── Locators ─────────────────────────
    // Static locator (Dashboard hover)
    this.dashboardMenu = this.page.locator("div.scrollbar-container", {
      hasText: "Dashboard",
    });

    // Dynamic main menu (like “Settings”)
    this.mainMenuLink = (menuName: string) =>
      this.page
        .locator("a")
        .filter({ hasText: new RegExp(`^${menuName}$`, "i") });

    // Dynamic submenu (like “User”)
    this.submenuLink = (submenuName: string) =>
      this.page.getByRole("link", { name: submenuName, exact: true });
  }

  // ───────────────────────── Method ─────────────────────────
  async openMenu(mainMenu: string) {
    logStep(step.start("Step 1: Hover over Dashboard to reveal main menu"));
    await this.dashboardMenu.hover();
    logStep(withIcon("PASS", "Hovered over Dashboard — main menu visible"));

    logStep(step.start(`Step 2: Wait for main menu "${mainMenu}" to appear`));
    await this.mainMenuLink(mainMenu).waitFor({
      state: "visible",
      timeout: 10_000,
    });
    logStep(withIcon("PASS", `Main menu "${mainMenu}" is visible`));

    logStep(step.click(`Step 3: Click main menu "${mainMenu}"`));
    await this.mainMenuLink(mainMenu).click();
  //  await this.page.waitForTimeout(4000);
    logStep(withIcon("PASS", `Main menu "${mainMenu}" expanded`));
  }

  async openSubmenu(submenu: string) {
    logStep(step.start(`Step 4: Wait for submenu "${submenu}" to appear`));
  //await this.submenuLink(submenu).waitFor({state: "visible", timeout: 10_000, });
// await this.page .getByRole("link", { name: "User", exact: true }) .waitFor({ state: "visible", timeout: 10_000 });

   // logStep(withIcon("PASS", `Submenu "${submenu}" is visible`));

    logStep(step.click(`Step 5: Click submenu "${submenu}"`));
    await this.submenuLink(submenu).click();
    logStep(withIcon("PASS", `Submenu "${submenu}" opened successfully`));
  }

  // ───────────────── helpers (no secrets in logs) ─────────────────
  private maskEmail(email: string): string {
    const [user, domain] = email.split("@");
    if (!domain) return "****";
    const u =
      user.length <= 2
        ? `${user[0] ?? ""}***`
        : `${user[0]}***${user[user.length - 1]}`;
    return `${u}@${domain}`;
  }

  // ───────────────── flows ─────────────────
  async navigateToSignupPage() {
    const fullUrl = `https://${TEST_CONFIG.urls.domain}.${TEST_CONFIG.urls.baseDomain}${TEST_CONFIG.urls.signup}`;
    logStep(step.navigate(`Open "Signup" URL: ${fullUrl}`));
    await this.page.goto(fullUrl);

    logStep(step.assert('Title contains "Register"'));
    await expect(this.page).toHaveTitle(/Register/);
    logStep(step.pass("Signup page loaded"));
  }

  async loginOnSignupPage() {
    logStep(step.open('Click "Login" Link'));
    await this.loginLink.click();
    logStep(step.pass("Login link clicked"));
    await this.page.waitForTimeout(1000);
    await expect(this.loginButton).toBeVisible({ timeout: 15000 });
    logStep(step.pass("Login button is visible"));
  }

  async signinOnLoginPage() {
    const fullUrl = `https://${TEST_CONFIG.urls.domain}.${TEST_CONFIG.urls.baseDomain}${TEST_CONFIG.urls.login}`;
    logStep(step.navigate(`Open "Login" URL: ${fullUrl}`));
    await this.page.goto(fullUrl);

    await expect(this.page).toHaveTitle(/Login/, { timeout: 15000 });
    logStep(withIcon("PASS", "Redirected to Login page"));

    logStep(step.open('Click "Signin" Link'));
    await this.signinLink.click();
    logStep(step.pass("Signin link clicked"));
    await expect(this.domainInput).toBeVisible({ timeout: 15000 });
    logStep(step.pass("Login button is visible"));
  }

  async checkIncorrectPwd(domain: string, pwd: string, confirmPwd: string) {
    const { email, name, website } = TEST_CONFIG.credentials;
    logStep(step.update(`Fill "Domain" with "${domain}"`));
    await this.domainInput.fill(domain);

    logStep(step.open('Click "Next"'));
    await this.nextButton.click();
    logStep(step.pass("Domain step submitted"));

    logStep(step.update(`Fill "Email" with ${this.maskEmail(email)}`));
    await this.emailInput.fill(email);

    logStep(step.update(`Fill "Name" with "${name}"`));
    await this.nameInput.fill(name);

    logStep(step.update(`Fill "Website" with "${website}"`));
    await this.websiteInput.fill(website);

    logStep(step.update('Fill "Password" (hidden)'));
    await this.passwordInput.fill(pwd);

    logStep(step.update('Fill "Confirm Password" (hidden)'));
    await this.confirmPasswordInput.fill(confirmPwd);

    logStep(step.save('Click "Submit"'));
    await this.submitButton.click();
    logStep(step.pass("Signup details submitted"));

    logStep(step.assert("Check Password mismatch validation message"));
    await expect(this.page.getByText("Passwords do not match.")).toBeVisible({
      timeout: 15000,
    });
  }

  async domainPage() {
    const domain = TEST_CONFIG.credentials.domain;
    logStep(step.update(`Fill "Domain" with "${domain}"`));
    await this.domainInput.fill(domain);

    logStep(step.open('Click "Next"'));
    await this.nextButton.click();
    logStep(step.pass("Domain step submitted"));
  }

  async checkIfDomainExists(domain: string): Promise<boolean> {
    logStep(step.assert(`Check domain availability for "${domain}"`));
    await this.domainInput.fill(domain);

    logStep(step.open('Click "Next"'));
    await this.nextButton.click();

    try {
      await this.page.waitForSelector("text=Domain is already taken", {
        timeout: 8000,
      });
      logStep(step.info("Domain exists (error toast visible)"));
      return true;
    } catch {
      logStep(step.info("No error toast — domain appears available"));
      return false;
    }
  }

  async detailsPage() {
    const { email, name, website, password } = TEST_CONFIG.credentials;

    logStep(step.update(`Fill "Email" with ${this.maskEmail(email)}`));
    await this.emailInput.fill(email);

    logStep(step.update(`Fill "Name" with "${name}"`));
    await this.nameInput.fill(name);

    logStep(step.update(`Fill "Website" with "${website}"`));
    await this.websiteInput.fill(website);

    logStep(step.update('Fill "Password" (hidden)'));
    await this.passwordInput.fill(password);

    logStep(step.update('Fill "Confirm Password" (hidden)'));
    await this.confirmPasswordInput.fill(password);

    logStep(step.save('Click "Submit"'));
    await this.submitButton.click();
    logStep(step.pass("Signup details submitted"));
  }

  async freshsalesAppsPage() {
    const appPageURL = `https://${TEST_CONFIG.urls.domain}.${TEST_CONFIG.urls.baseDomain}${TEST_CONFIG.urls.freshsalesApp}`;
    logStep(step.navigate(`Open "Apps" page: ${appPageURL}`));
    await this.page.goto(appPageURL);
    logStep(withIcon("PASS", "Redirected to Login page"));

    //  await this.page.getByRole('complementary').getByRole('button').click();
  }

  async login() {
    const fullUrl = `https://${TEST_CONFIG.urls.domain}.${TEST_CONFIG.urls.baseDomain}${TEST_CONFIG.urls.login}`;
    logStep(step.navigate(`Open "Login" URL: ${fullUrl}`));
    await this.page.goto(fullUrl);

    const { email, password } = TEST_CONFIG.credentials;

    logStep(step.update(`Fill "Email" with ${this.maskEmail(email)}`));
    await this.loginEmailInput.fill(email);
    logStep(withIcon("PASS", "Filled the email"));

    logStep(step.update('Fill "Password" (hidden)'));
    await this.loginPasswordInput.fill(password);
    logStep(withIcon("PASS", "Filled the password"));

    logStep(step.open('Click "Login"'));
    await this.loginButton.click();
    logStep(withIcon("PASS", "Clicked Login button"));
  }

  async loginAgain() {
    const { email, password } = TEST_CONFIG.credentials;

    logStep(step.update(`Fill "Email" with ${this.maskEmail(email)}`));
    await this.loginEmailInput.fill(email);

    logStep(step.update('Fill "Password" (hidden)'));
    await this.loginPasswordInput.fill(password);

    logStep(step.open('Click "Login"'));
    await this.loginButton.click();

    logStep(withIcon("PASS", "Clicked Login button"));
  }
  async logout() {
    logStep(step.click('Click "Profile Menu"'));
    await this.profileMenuBtn.click();
    logStep(withIcon("PASS", "Clicked 'Profile Menu' button"));

    logStep(step.click('Click "Logout"'));
    await this.logoutBtn.click();
    logStep(withIcon("PASS", "Clicked Logout button"));
  }
  async testLogin(username: string, password: string) {
    const fullUrl = `https://${TEST_CONFIG.urls.domain}.${TEST_CONFIG.urls.baseDomain}${TEST_CONFIG.urls.login}`;
    logStep(step.navigate(`Open "Login" URL: ${fullUrl}`));
    await this.page.goto(fullUrl);
    logStep(withIcon("PASS", "Redirected to Login page"));

    logStep(step.update(`Fill "Email" with ${this.maskEmail(username)}`));
    await this.loginEmailInput.fill(username);
    logStep(withIcon("PASS", "Filled the email"));

    logStep(step.update('Fill "Password" (hidden)'));
    await this.loginPasswordInput.fill(password);
    logStep(withIcon("PASS", "Filled the password"));

    logStep(step.open('Click "Login"'));
    await this.loginButton.click();
    logStep(withIcon("PASS", "Clicked Login button"));
  }

  async isSessionValid(): Promise<boolean> {
    const apiContext = await request.newContext({ storageState: "auth.json" });
    const response = await apiContext.get(
      "https://gp6.prestaging.us.konnectify.dev/admin/api/sessions/me"
    );
    return response.status() === 200;
  }

  async refreshSession(page: Page) {
    if (!(await this.isSessionValid())) {
      console.log("⚠️ Session expired → refreshing via UI login...");
      await this.login();
    } else {
      console.log("✅ Session still valid → using saved auth.json");
      await page.goto(
        "https://gp6.prestaging.us.konnectify.dev/admin/ui/en/dashboard"
      );
    }
  }

  async navPage(page: string) {}
}
