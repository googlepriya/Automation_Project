import { expect, Locator, Page } from "@playwright/test";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class WebhookPage {
  readonly page: Page;
  private readonly addPlus: Locator;
  private readonly ToolsList: Locator;
  private readonly AddInputBtn: Locator;

  // ----- Buttons -----
  private readonly node2Btn: Locator;
  private readonly TestDataBtn: Locator;

   // ----- Input Fields -----
   private readonly usernameInput: Locator;
   private readonly passwordInput: Locator;

  // ----- Locators -----
  private readonly webhook: Locator;
  private readonly toolsSelection: (method: string) => Locator;

  private readonly webhookNode: Locator;
  private readonly OutputData: Locator;



  // ----- Mapping fields -----
  private readonly requestOption: (method: string) => Locator;
  private readonly endpointUrlInput: Locator;

  // ----- Custom Headers -----
  private readonly headersKey: Locator;
  private readonly headersValue: Locator;

  // ----- Auth Dropdown -----
  private readonly authDropdown: Locator;
  private readonly basicAuthOption: Locator;

  // ----- Payload Dropdown -----
  private readonly jsonOption: Locator;
  private readonly jsonPayload: Locator;
  private readonly payloadDropdown: Locator;

  constructor(page: Page, appName: string) {
    this.page = page;

    this.addPlus = page.locator(".border-2").first();

    // ----- Buttons -----
    this.AddInputBtn = page.getByRole("button", { name: "Add new input" });
    this.node2Btn = page.getByTestId("rf__node-2");
    this.TestDataBtn = page.getByRole("button", { name: "Test Data" });

    // ----- Input Fields -----
    this.usernameInput =  page.getByRole('textbox').filter({ hasText: 'Enter the username for Basic' }).locator('div');
    this.passwordInput = page.locator('#outlined-adornment-password');

    // ----- Mapping fields -----
    this.requestOption = (method: string) =>
      page.getByText(method, { exact: true });

    this.toolsSelection = (tool: string) =>
        page.getByText(tool, { exact: true });


    this.endpointUrlInput = page
      .getByRole("textbox")
      .filter({ hasText: "Enter the endpoint URL to" })
      .locator("div");

    this.headersKey = page.getByRole("textbox", { name: "Key" });
    this.headersValue = page
      .getByRole("textbox")
      .filter({ hasText: "Value" })
      .locator("div");

    this.authDropdown = page.getByLabel("", { exact: true }).first();
    this.payloadDropdown = page
      .getByRole("combobox", { name: "Basic Auth" })
      .nth(1);

    this.basicAuthOption = page.getByRole("option", { name: "Basic Auth" });
    this.jsonOption = page.getByRole("option", { name: "JSON" });
    this.jsonPayload = page
      .getByRole("textbox")
      .filter({ hasText: "Paste data for the request" });

    // ----- Locators -----
    this.webhook = page.getByRole("heading", { name: "webhook" });
    this.webhookNode = page.getByTestId("rf__node-3");
    this.OutputData = page.locator("div").filter({ hasText: /^Test Data$/ });
  }


 

  async openWebhookNode() {
    logStep(step.webhook('Click "Webhook" node to configure'));
    await this.node2Btn.click();
    logStep(withIcon("PASS", "Webhook node opened for configuration"));
  }

  async checkPath() {
    logStep(step.assert('Assert "Path" is visible'));
    await expect(this.webhook).toBeVisible({ timeout: 10_000 });
    logStep(withIcon("PASS", "Webhook available for Action node"));
  }

  async addWebhook() {
    logStep(step.webhook('Select "Webhook"'));
    await this.webhook.click();
    logStep(withIcon("PASS", "Webhook selected"));
  }

  async configureWebhook(
    method: string,
    endpoint: string,
    username: string,
    password: string
  ) {
    logStep(step.click(`Select ${method} option`));
    await this.requestOption(method).click();
    logStep(withIcon("PASS", ` ${method} option selected`));

    logStep(step.type('Enter "Endpoint URL"'));
    await this.endpointUrlInput.fill(endpoint);
    logStep(withIcon("PASS", `Endpoint URL filled: ${endpoint}`));

    logStep(step.click('Open "Authentication" dropdown'));
    await this.authDropdown.click();
    logStep(withIcon("PASS", "Clicked Authentication dropdown"));

    logStep(step.click('Select "Basic Auth" option'));
    await this.basicAuthOption.click();
    logStep(withIcon("PASS", 'Authentication set to "Basic Auth"'));

    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async enterCustomHeaders(key: string, value: string) {
    logStep(step.type("Enter Header Key "));
    await this.headersKey.fill(key);
    logStep(withIcon("PASS", "Entered the 'Key' to Custom Headers"));

    logStep(step.type("Enter Header Key Value"));
    await this.headersValue.fill(value);
    logStep(withIcon("PASS", "Entered the 'Value' to Custom Headers"));
  }

  async enterPayload(jsonPayload: string) {
    logStep(step.click('Click "Payload" dropdown'));
    await this.payloadDropdown.click();
    logStep(withIcon("PASS", "Clicked Payload dropdown"));

    logStep(step.click('Select "JSON" option'));
    await this.jsonOption.click();
    logStep(withIcon("PASS", ' "JSON" set to Payload type'));

    logStep(step.type("Enter the JSON payload"));
    await this.jsonPayload.fill(jsonPayload);
    logStep(withIcon("PASS", "Entered the JSON payload"));
  }

  async testWebhookData() {
    logStep(step.click("Click Test Data Button"));
    await this.TestDataBtn.click();
    logStep(withIcon("PASS", "Test Data button clicked"));

    logStep(step.assert("Check Output Schema"));
    await this.page.waitForTimeout(2000);
    await expect(this.OutputData).toBeVisible({ timeout: 10000 });
    logStep(withIcon("PASS", "Ouput Schema is displaying"));
  }

  async verifyWehbookNodeExist(optionName: string) {
    logStep(step.verify(`Verify request header "${optionName}" is visible`));
    await this.page.waitForTimeout(2000);
    await expect(this.requestOption(optionName)).toBeVisible({ timeout: 5000 });
    logStep(withIcon("PASS", `Configured Node is visible for existing workflow`));
  }

  // ----- Update Existing Request Method -----
async toggleRequestMethod() {
    logStep(step.open("Check existing request method"));
  
    let currentMethod = "";
  
    // Check GET first
    if (await this.requestOption("GET Request").isVisible().catch(() => false)) {
      currentMethod = "GET";
    } else if (
      await this.requestOption("POST Request").isVisible().catch(() => false)
    ) {
      currentMethod = "POST";
    }
  
    logStep(withIcon("PASS", `Current method detected: ${currentMethod}`));
  
    // Decide what to switch to
    const newMethod = currentMethod === "GET" ? "POST" : "GET";
  
    // Open the dropdown to change
    logStep(step.click(`Switching method from "${currentMethod}" to "${newMethod}"`));
    await this.requestOption(currentMethod + " Request").click();
    await this.requestOption(newMethod + " Request").click();
  
    logStep(withIcon("PASS", `Method updated to "${newMethod}"`));
  
    return newMethod; // so test knows what it switched to
  }
  
  
}
