import { expect, Locator, Page } from "@playwright/test";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class CustomersPage {
  readonly page: Page;

  // ----- Page Elements -----
  private readonly panel: Locator;

  // ----- Links -----
  private readonly customersNavLink: Locator;

  // ----- Buttons -----
  private readonly createCustomerBtn: Locator;
  private readonly submitCustomerBtn: Locator;
  private readonly updateCustomerBtn: Locator;
  private readonly cancelDeleteBtn: Locator;
  private readonly deleteConfirmBtn: Locator;

  // ----- Inputs -----
  private readonly customerNameInput: Locator;
  private readonly externalCustomerIdInput: Locator;

  // ----- Dropdowns -----
  private readonly statusDropdown: Locator;

  // ----- Text / Labels -----
  private readonly createNewCustomerText: Locator;
  private readonly deleteOption: Locator;
  private readonly editOption: Locator;

  // ----- Dynamic Row Actions -----
  private readonly rowActionBtn: (name: string, externalId: string) => Locator;

  constructor(page: Page) {
    this.page = page;

    // ----- Page Elements -----
    this.panel = page.locator("h2:text('Filter & Condition')");

    // ----- Links -----
    this.customersNavLink = page.getByRole("link", { name: "Customers" });

    // ----- Buttons -----
    this.createCustomerBtn = page.getByRole("button", {
      name: "Create customer",
    });
    this.submitCustomerBtn = page.getByRole("button", {
      name: "Create Customer",
    });
    this.updateCustomerBtn = page.getByRole("button", {
      name: "Update Customer",
    });
    this.cancelDeleteBtn = page.getByRole("button", { name: "Cancel" });

    this.deleteConfirmBtn = page.getByRole("button", { name: "Delete" });

    // ----- Inputs -----
    this.customerNameInput = page.getByRole("textbox", {
      name: "Customer name",
    });
    this.externalCustomerIdInput = page.getByRole("textbox", {
      name: "External Customer ID",
    });

    // ----- Dropdowns -----
    this.statusDropdown = page.getByRole("combobox", { name: /Status/i });

    // ----- Text / Labels -----
    this.createNewCustomerText = page.getByText("Create New Customer");
    this.editOption = page.getByRole("menuitem", { name: "Edit" });
    this.deleteOption = page.getByRole("menuitem", { name: "Delete" });

    // ----- Dynamic Locators -----
    this.rowActionBtn = (name: string, externalId: string) =>
      page
        .getByRole("row", { name: `${name} ${externalId}` })
        .getByRole("button");
  }

  // ----- High-level navigation -----
  
  async navigateToCustomersPage() {
    logStep(step.click('Click "Customers" from the side nav'));
    await this.customersNavLink.click();
   logStep(withIcon("PASS", "Clicked Customers from the side nav"));

    logStep(step.wait('Wait for "Customers" page to load'));
    await expect(this.createCustomerBtn).toBeVisible({ timeout: 15000 });
    logStep(withIcon("PASS", "Customers page loaded"));
  }

  async verifyCustomersPage() {
    logStep(step.assert('Verify "Customers" page is displayed'));
    await expect(
      this.page.getByRole("heading", { name: "Customers" })
    ).toBeVisible({
      timeout: 10_000,
    });
    logStep(withIcon("PASS", 'Verified "Customers" page is displayed'));
  }

  // ----- High-level actions -----
  async createCustomer(
    customerName: string,
    externalId: string,
    status: string
  ) {
    logStep(step.click('Click "Create customer" button'));
    await this.createCustomerBtn.click();
    logStep(withIcon("PASS", "Clicked Create customer"));

    logStep(step.type('Fill "Customer name" field'));
    await this.customerNameInput.fill(customerName);
    logStep(withIcon("PASS", `Filled Customer name: ${customerName}`));

    logStep(step.type('Fill "External Customer ID" field'));
    await this.externalCustomerIdInput.fill(externalId);
    logStep(withIcon("PASS", `Filled External Customer ID: ${externalId}`));

    logStep(step.click('Open "Status" dropdown'));
    await this.statusDropdown.click();

    logStep(step.click(`Select "${status}" status`));
    await this.page.getByRole("option", { name: status }).click();
    logStep(withIcon("PASS", `Selected status: ${status}`));

    logStep(step.click('Click "Create Customer" button'));
    await this.submitCustomerBtn.click();
    logStep(withIcon("PASS", "Clicked Create Customer"));

    logStep(step.verify('Verify "Create New Customer" text is visible'));
    await this.createNewCustomerText.click();
    logStep(withIcon("PASS", "Verified Create New Customer text visible"));
  }

  // Check if a row exists
  async isCustomerPresent(name: string, externalId: string): Promise<boolean> {
//    const row = this.page.getByRole("row", { name: `${name} ${externalId}` });

const row = this.page.getByRole("row", { name: `${name}` });
    return await row.isVisible().catch(() => false);
  }

  // Search input interaction
  async searchCustomer(name: string) {
    logStep(step.type(`Searching for customer "${name}"`));
    await this.page.getByRole("textbox", { name: "Search" }).fill(name);
    await this.page.keyboard.press("Enter");
    // Wait for results to update
    const rowLocator = this.page.getByRole("row", { name });
    const isPresent = await rowLocator
      .first()
      .isVisible()
      .catch(() => false);

    return isPresent;
  }

  async deleteCustomer(name: string, externalId: string) {
    logStep(step.start(`Begin deleting customer "${name} ${externalId}"`));

    logStep(step.click(`Click actions menu for row: "${name} ${externalId}"`));
    await this.rowActionBtn(name, externalId).click();

    await this.page.waitForTimeout(2000);
    await this.page.screenshot({ path: "screenshot.png" });

    // Click Delete
    logStep(step.click('Click "Delete" option'));
    await this.deleteOption.click();

    // Click Cancel
    logStep(step.click('Click "Delete" in delete confirmation'));
    await this.deleteConfirmBtn.click();

    logStep(step.end(`Finished delete the "${name}"`));
  }

  async editCustomer(
    name: string,
    externalId: string,
    newName: string,
    newExternalId: string,
    newStatus: string
  ) {
    logStep(step.start(`Begin editing customer "${name} ${externalId}"`));

    logStep(step.click(`Click actions menu for row: "${name} ${externalId}"`));
    await this.rowActionBtn(name, externalId).click();
    // Click Edit
    logStep(step.click('Click "Edit" option'));
    await this.editOption.click({ force: true });

    // Update name
    logStep(step.type(`Update customer name to "${newName}"`));
    await this.customerNameInput.fill(newName);

    // Update external ID
    logStep(step.type(`Update external ID to "${newExternalId}"`));
    await this.externalCustomerIdInput.fill(newExternalId);

    // Update status
    logStep(step.select(`Update status to "${newStatus}"`));
    await this.statusDropdown.click();
    await this.page
      .getByRole("option", { name: newStatus, exact: true })
      .click();

    // Submit
    logStep(step.click('Click "Update Customer" button'));
    await this.updateCustomerBtn.click();

    logStep(withIcon("PASS", `Customer "${name}" updated successfully`));
    logStep(step.end(`Finished editing customer "${name}"`));
  }
}
