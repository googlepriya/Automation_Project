import { Page, Locator, expect } from "@playwright/test";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class ApiTokenPage {
  readonly page: Page;

  // ---------- Buttons ----------
  private readonly backChevronBtn: Locator;
  private readonly addTokenBtn: Locator;
  private readonly submitBtn: Locator;
  private readonly closeBtn: Locator;
  private readonly updateBtn: Locator;
  private readonly editTokenBtn: Locator;
  private readonly deleteTokenBtn: Locator;

  // ---------- Dropdowns ----------
  private readonly tokenType: Locator;
  private readonly apiTokenOption: Locator;
  private readonly rsaTokenOption: Locator;

  private readonly roleType: Locator;
  private readonly roleOption: (roleName: string) => Locator;
  private readonly superAdminRoleOption: Locator;

  // ---------- Inputs ----------
  private readonly tokenNameInput: Locator;

  constructor(page: Page) {
    this.page = page;

    // ---------- Buttons ----------
    this.backChevronBtn = page.locator(
      'span[role="button"] >> i.bx-bxs-chevron-left'
    );
    this.addTokenBtn = page.getByRole("button", { name: "Add new token" });
    this.submitBtn = page.getByRole("button", { name: "Submit" });
    this.closeBtn = page.getByRole("button", { name: "Close" });
    this.updateBtn = page.getByRole("button", { name: /^Update$/ });
    this.editTokenBtn = page
      .locator(".MuiCardHeader-root")
      .filter({ has: page.locator("p", { hasText: /^Automate_API_Token$/ }) })
      .locator("button:has(i.bx-edit)")
      .first();
    this.deleteTokenBtn = page.locator("button:has(i.bx-trash)").first();

    // ---------- DropDowns ----------
    this.tokenType = page.getByRole("combobox", { name: "Token Type RSA" });
    this.roleType = page.getByRole("combobox", { name: "Role Type" });
    this.apiTokenOption = page.getByRole("option", { name: "API" });
    this.rsaTokenOption = page.getByRole("option", { name: "RSA" });
    this.roleOption = (roleName: string) =>
      page.getByRole("option", { name: roleName, exact: true });
    this.superAdminRoleOption = page.getByRole("option", {
      name: "Super admin",
    });

    // ---------- Inputs ----------
    this.tokenNameInput = page.getByRole("textbox", { name: "Token Name" });
  }

  // ============================================================
  // 🔹 API Tokens Management
  // ============================================================

  async createRSAToken(tokenName: string) {
    logStep(step.create('Click "Add new token"'));
    await this.addTokenBtn.click();

    // Select Token Type
    logStep(step.click('Open "Token Type" dropdown'));
    await this.tokenType.click();

    logStep(step.click('Select "RSA" option'));
    await this.rsaTokenOption.click();

    // Scope form inside modal
    logStep(step.type("Enter API Token name"));
    await this.tokenNameInput.fill(tokenName);
    logStep(withIcon("PASS", `Filled API Token name: ${tokenName}`));

    logStep(step.click('Click "Submit" button'));
    await this.submitBtn.click();
    logStep(withIcon("PASS", "Clicked Submit button"));
  }

  async createAPIToken(tokenName: string, role: string) {
    logStep(step.create('Click "Add new token"'));
    await this.addTokenBtn.click();

    // Select Token Type
    logStep(step.click('Open "Token Type" dropdown'));
    await this.tokenType.click();

    logStep(step.click('Select "API" option'));
    await this.apiTokenOption.click();

    // Scope form inside modal
    logStep(step.type("Enter API Token name"));
    await this.tokenNameInput.fill(tokenName);
    logStep(withIcon("PASS", `Filled API Token name: ${tokenName}`));

    // Select Role Type
    logStep(step.click('Open "Role Type" dropdown'));
    await this.roleType.click();
    logStep(withIcon("PASS", "Clicked role type dropdown"));

    logStep(step.select('Select "Admin" role'));
    await this.roleOption(role).click();
    logStep(withIcon("PASS", "Clicked 'Admin' role"));

    logStep(step.click('Click "Submit" button'));
    await this.submitBtn.click();
    logStep(withIcon("PASS", "Clicked Submit button"));
    await this.page.waitForTimeout(3000);
    logStep(step.click('Click "Close" button'));
    await this.closeBtn.click();
    logStep(withIcon("PASS", "Clicked Close button"));
  }

  async updateorAddNewToken(tokenName: string, role: string) {
    const exists = await this.checkTokenExists(tokenName);
    if (!exists) {
      logStep(step.create("API token not found — create new"));
      await this.deleteOrAddNewToken("Automate_Token", role);
      logStep(step.pass("API token created"));
      logStep(step.update("New API token created — Proceed to update"));
      await this.updateToken();
    } else {
      logStep(step.update("RSA token exists — update"));
      await this.updateToken();
    }
  }

  async updateToken() {
    await this.editTokenBtn.click();
    logStep(step.open('Click "Edit"'));

    logStep(step.select("Update the role"));
    // Read current value from dropdown
    //  const currentRole = await this.roleType.textContent();
    const currentRole = (await this.roleType.innerText()).trim();

    // Select Role Type
    logStep(step.click('Open "Role Type" dropdown'));
    await this.roleType.click();
    logStep(withIcon("PASS", "Clicked role type dropdown"));

    if (currentRole?.includes("Admin")) {
      logStep(step.update('Current role is "Admin" — switch to "User"'));
      await this.roleOption("User").click();
      logStep(withIcon("PASS", "Role updated to User"));
    } else if (currentRole?.includes("User")) {
      logStep(step.update('Current role is "User" — switch to "Admin"'));
      await this.roleOption("Admin").click();
      logStep(withIcon("PASS", "Role updated to Admin"));
    } else {
      logStep(step.fail("Role type not recognized in dropdown"));
      throw new Error("Unknown role type in Role Type dropdown");
    }
    await this.updateBtn.click();
    logStep(step.save('Click "Update"'));
  }

  async deleteOrAddNewToken(tokenName: string, role: string) {
    const exists = await this.checkTokenExists(tokenName);
    if (!exists) {
      logStep(step.create("API token not found — creating new"));
      await this.createAPIToken(tokenName, role);
    } else {
      logStep(step.del("RSA token exists — deleting"));
      await this.deleteTokenBtn.click();
      logStep(withIcon("PASS", "RSA token deleted"));
      await this.createAPIToken("Automate_API_Token", role);
    }
  }

  async checkTokenExists(tokenName: string): Promise<boolean> {
    const tokenLocator = this.page.getByText(tokenName, { exact: true });
    try {
      await tokenLocator.first().waitFor({ state: "visible", timeout: 5000 });
      logStep(withIcon("PASS", `Token "${tokenName}" found`));
      return true;
    } catch {
      logStep(step.info(`Token "${tokenName}" not found`));
      return false;
    }
  }

  // ============================================================
  // 🔹 Token Limit Check
  // ============================================================

  async checkTokenLimitOrSuccess() {
    const limitMsg = this.page.getByText(/You can't create more than 3/i);
    const successHeading = this.page.getByRole("heading", {
      name: /Token Created/i,
    });
    const successToast = this.page.getByText(/Token created successfully/i);

    logStep(step.verify("Check for token creation or token limit reached"));

    const outcome = await Promise.race([
      successToast
        .waitFor({ state: "visible", timeout: 12_000 })
        .then(() => "created")
        .catch(() => null),
      limitMsg
        .waitFor({ state: "visible", timeout: 12_000 })
        .then(() => "limit")
        .catch(() => null),
      successHeading
        .waitFor({ state: "visible", timeout: 12_000 })
        .then(() => "created")
        .catch(() => null),
    ]);

    if (outcome === "limit") {
      return "limit";
    }

    if (outcome === "created") {
      await expect(this.closeBtn)
        .toBeVisible({ timeout: 5000 })
        .catch(() => {});
      if (await this.closeBtn.isVisible()) {
        logStep(step.click('Click "Close"'));
        await this.closeBtn.click();
      }
      return "created";
    }

    // Case 3: Neither appeared
    logStep(step.fail("Neither token limit nor success message appeared"));
    await this.page.screenshot({ path: "debug-token.png", fullPage: true });
    throw new Error("Token creation outcome could not be determined");
  }
}
