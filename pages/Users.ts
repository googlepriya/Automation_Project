import { expect, Locator, Page } from "@playwright/test";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";
import { log } from "console";

export class UsersPage {
  readonly page: Page;

  // ----- Page Elements -----
  private readonly panel: Locator;

  // ----- Buttons -----
  private readonly createUserBtn: Locator;
  private readonly submitUserBtn: Locator;

  //
  // --- IGNORE ---
  private readonly cancelBtn: Locator;
  private readonly deleteConfirmBtn: Locator;

  // ----- Inputs -----
  private readonly userNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly languageDropdown: Locator;

  // ----- Dropdowns -----
  private readonly roleDropdown: Locator;
  private readonly statusDropdown: Locator;

  // ----- Dropdown Options -----
  private readonly roleOption: (role: string) => Locator;
  private readonly languageOption: (language: string) => Locator;
  private readonly statusOption: (status: string) => Locator;

  // ----- Text / Labels -----
  private readonly deleteOption: Locator;
  private readonly editOption: Locator;

  // ----- Dynamic Row Actions -----
  private readonly rowActionBtn: (fullName: string) => Locator;

  constructor(page: Page) {
    this.page = page;

    // ----- Page Elements -----
    this.panel = page.locator("h2:text('Filter & Condition')");

    // ----- Buttons -----
    this.createUserBtn = page.getByRole("button", { name: "Create user" });
    this.submitUserBtn = page.getByRole("button", { name: "Save" });

    this.cancelBtn = page.getByRole("button", { name: "Cancel" });

    this.deleteConfirmBtn = page.getByRole("button", { name: "Delete" });

    // ----- Inputs -----
    this.userNameInput = page.getByRole("textbox", { name: "User name" });
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });

    // ----- Dropdowns -----
    this.roleDropdown = page.getByRole("combobox", { name: "Role" });
    this.languageDropdown = page.getByRole("combobox", { name: "Language" });
    this.statusDropdown = page.getByRole("combobox", { name: "Status" });

    // ----- Dropdown Options -----
    this.roleOption = (role: string) =>
      page.getByRole("option", { name: role, exact: true });
    this.languageOption = (language: string) =>
      page.getByRole("option", { name: language, exact: true });
    this.statusOption = (status: string) =>
      page.getByRole("option", { name: status, exact: true });

    // ----- Text / Labels -----
    this.editOption = page.getByRole("menuitem", { name: "Edit" });
    this.deleteOption = page.getByRole("menuitem", { name: "Delete" });

    // ----- Dynamic Locators -----
    this.rowActionBtn = (fullName: string) =>
      page.getByRole("row", { name: fullName }).getByRole("button");
  }

async checkUserPageLoaded() {
  logStep(step.wait('Wait for "Users" page to load'));
  await expect(this.createUserBtn).toBeVisible({ timeout: 15000 });
  logStep(withIcon("PASS", "Users page loaded"));
}
  // ----- High-level actions -----
  async createUser(
    userName: string,
    role: string,
    email: string,
    password: string,
    language: string,
    status: string
  ) {
    // Click Create User button
    logStep(step.click('Click "Create user" button'));
    await this.createUserBtn.click();
    logStep(withIcon("PASS", "Clicked Create User button"));

    // Fill form
    // Fill User Name
    logStep(step.type('Fill "User name" field'));
    await this.userNameInput.fill(userName);
    logStep(withIcon("PASS", `Filled User name: ${userName}`));

    logStep(step.click('Open "Role" dropdown'));
    await this.roleDropdown.click();
    await this.roleOption(role).click();
    logStep(withIcon("PASS", `Role set to "${role}"`));

    logStep(step.type('Fill "Email" field'));
    await this.emailInput.fill(email);
    logStep(withIcon("PASS", `Filled Email: ${email}`));

    logStep(step.type('Fill "Password" field'));
    await this.passwordInput.fill(password);
    logStep(withIcon("PASS", "Filled Password field"));

    logStep(step.click('Open "Language" dropdown'));
    await this.languageDropdown.click();
    await this.languageOption(language).click();
    logStep(withIcon("PASS", `Language set to "${language}"`));

    logStep(step.click('Open "Status" dropdown'));
    await this.statusDropdown.click();
    await this.statusOption(status).click();
    logStep(withIcon("PASS", `Status set to "${status}"`));

    // Submit form
    logStep(step.click('Click "Create" button'));
    await this.submitUserBtn.click();
    logStep(withIcon("PASS", "Clicked Create button"));
    await this.page.waitForTimeout(1000);

    // ----- Duplicate check -----
    const duplicateMsg = this.page.getByText("A user with this email", {
      exact: false,
    });

    if (await duplicateMsg.isVisible({ timeout: 10000 }).catch(() => false)) {
      logStep(
        step.warn(
          `Duplicate user creation blocked — Email "${email}" already exists`
        )
      );

      // Cancel out of popup
      logStep(step.click('Click "Cancel" button on duplicate popup'));
      await this.cancelBtn.click();
      logStep(withIcon("PASS", "Cancelled duplicate user creation"));

      // Verify user with this email already exists in table
      logStep(
        step.verify(
          `Verify user with email "${email}" already exists in the list`
        )
      );
      const emailRow = this.page.getByRole("row", { name: email });
      await expect(emailRow).toBeVisible({ timeout: 15000 });
      logStep(withIcon("PASS", `Verified existing user with email: ${email}`));

      return false; // return early so test knows duplicate path
    }

    return true;
  }

  // Verify user creation
  async verifyUserCreated(userName: string) {
    logStep(step.verify(`Verify user "${userName}" appears in the list`));
    // const userRow = this.page.getByRole("row", { name: userName });
    const userRow = this.page
      .getByRole("row", { name: userName })
      .getByRole("button");

    //  await expect(userRow).toBeVisible();
    try {
      await expect(userRow).toBeVisible({ timeout: 5000 });
      logStep(withIcon("PASS", `User "${userName}" verified in the list`));
      return true; // ✅ Always return a boolean
    } catch (error) {
      logStep(step.fail(`User "${userName}" not found in the list`));
      return false; // ✅ return false instead of undefined
    }

    logStep(withIcon("PASS", `User "${userName}" verified in the list`));
  }

  // ----- Edit User -----
  async editUser(
    fullName: string,
    newName: string,
    newRole: string,
    password: string,
    newStatus: string
  ) {
    logStep(step.click(`Click actions menu for user "${fullName}"`));
    await this.rowActionBtn(fullName).click();
    logStep(withIcon("PASS", `Clicked actions menu for user "${fullName}"`));

    logStep(step.click('Click "Edit" option'));
    await this.editOption.click();
    logStep(withIcon("PASS", `Clicked Edit option for user "${fullName}"`));

    logStep(step.type(`Update user name to "${newName}"`));
    await this.userNameInput.fill(newName);
    logStep(withIcon("PASS", `User name updated to "${newName}"`));

    logStep(step.click('Open "Role" dropdown'));
    await this.roleDropdown.click();
    await this.roleOption(newRole).click();
    logStep(withIcon("PASS", `Role updated to "${newRole}"`));

    // Fill Password
    logStep(step.type('Fill "Password" field'));
    await this.passwordInput.fill(password);
    logStep(withIcon("PASS", "Password field updated"));

    logStep(step.click('Open "Status" dropdown'));
    await this.statusDropdown.click();
    await this.statusOption(newStatus).click();

    logStep(withIcon("PASS", `Status updated to "${newStatus}"`));

    logStep(step.click('Click "Update User" button'));
    await this.submitUserBtn.click();
    logStep(withIcon("PASS", `User "${fullName}" updated to "${newName}"`));
  }

  // ----- Delete User -----
  async deleteUser(fullName: string) {
    logStep(step.click(`Click actions menu for user "${fullName}"`));
    await this.rowActionBtn(fullName).click();
    logStep(withIcon("PASS", `Clicked actions menu for user "${fullName}"`));

    logStep(step.click('Click "Delete" option'));
    await this.deleteOption.click();
    logStep(withIcon("PASS", `Clicked Delete option for user "${fullName}"`));

    logStep(step.click('Click "Confirm Delete" button'));
    await this.deleteConfirmBtn.click();
    logStep(withIcon("PASS", `Clicked Confirm Delete button`));
  }
}
