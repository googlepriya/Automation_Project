import { Page, Locator, expect } from "@playwright/test";
import { APP_CONFIG } from "../config/appConfig";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class WorkflowTemplatePage {
  readonly page: Page;

  // Nodes
  private readonly triggerNode: Locator;
  private readonly secondNode: Locator;
  private readonly firstNode: Locator;

  // Tabs / Menus
  private readonly ToolsList: Locator;

  // Buttons / Controls
  private readonly connectionToggleButton: Locator;
  private readonly workflowButton: Locator;

  // Inputs for connections
  private readonly connectionNameInput: Locator;
  private readonly baseUrlInput: Locator;
  private readonly apiKeyInput1: Locator;
  private readonly apiKeyInput2: Locator;
  private readonly siteIdInput: Locator;

  // Mapping fields
  private readonly contactIDMapping: Locator;

  // Misc
  private readonly addNodePlusIcon: Locator;
  private readonly filter: Locator;

  constructor(page: Page, appName: string, workflowName: string) {
    this.page = page;

    this.triggerNode = page.getByTestId("rf__node-1").getByText("Freshsales");
    this.secondNode = page.getByTestId("rf__node-2").getByText("Freshsales");
    this.firstNode = page.getByTestId("rf__node-1");
    this.ToolsList = page.locator("div").filter({
      hasText:
        /^ToolsHelpful utilities to support various tasks and workflows\.$/,
    });

    this.workflowButton = page.getByRole("button", { name: "+ workflow" });
    this.connectionToggleButton = page.locator(".relative.inline-flex").first();

    // Connection Inputs
    this.connectionNameInput = page.getByRole("textbox", {
      name: "Connection Name",
    });
    this.baseUrlInput = page.getByText("baseUrl");
    this.apiKeyInput1 = page.getByText("apiKey *");
    this.apiKeyInput2 = page.getByText("api_key *");
    this.siteIdInput = page.getByText("site_id *");

    // Mapping Locators
    this.contactIDMapping = page
      .getByRole("textbox")
      .filter({ hasText: "Enter a value or map a field" })
      .locator("div");

    this.addNodePlusIcon = page.locator(
      "//div[@class='absolute']//div/div/div[2]"
    );
    this.filter = page.getByRole("heading", { name: "Filter" });
  }

  // ───────────── Trigger & Action Nodes ─────────────
  async privateWorkflow() {
    await this.workflowButton.click();
    logStep(
      withIcon("CREATE", "Private konnector create workflow button clicked")
    );
  }

  async openFirstNode() {
    logStep(step.click('Click "Trigger" node'));
    await this.firstNode.click();
    logStep(withIcon("OPEN", "Trigger node opened"));
  }

  async openTriggerNode() {
    logStep(step.click('Click "Trigger" node'));
    await this.triggerNode.click();
    logStep(withIcon("OPEN", "Trigger node opened"));
  }


  // ───────────── Save / Create ─────────────
  async selectActionNodeConnection() {
    logStep(step.click('Click "Action" node'));
    await this.secondNode.click();

    logStep(step.toggle('Toggle "Use this connection" (Action)'));
    await this.connectionToggleButton.click();
    logStep(withIcon("PASS", "Action node connection selected"));
  }

  // ───────────── Filter Tools ─────────────
  async selectFilterCondition() {
    logStep(step.filter('Click "Filter" module'));
    await this.filter.click();
    logStep(withIcon("PASS", "Filter module selected"));
  }

  async configureFilter() {
    logStep(step.click('Click "+ Add node"'));
    await this.addNodePlusIcon.click();
    logStep(withIcon("PASS", "New node added"));

    logStep(step.tools('Open "Tools"'));
    await this.ToolsList.first().click();

    logStep(step.assert('Assert "Filter" is visible'));
    await expect(this.filter).toBeVisible({ timeout: 10_000 });
    logStep(withIcon("PASS", "Filter available in Tools"));
  }
  
  // Full node config (parity)

  async configureAction(appName: string, workflowName: string, type: string) {
    switch (appName) {
      case "Highperformr":
        logStep(step.type("Fill connection fields (Highperformr)"));
        await this.baseUrlInput.fill(
          APP_CONFIG.connection.Highperformr.baseUrl
        );
        await this.apiKeyInput1.fill(APP_CONFIG.connection.Highperformr.apiKey);
        logStep(withIcon("PASS", "Connection fields filled"));
        break;

      case "Freshsales":
        await this.contactIDMapping.click();
        if (type === "static") {
          logStep(step.type('Enter static "Contact ID"'));
          await this.contactIDMapping.fill("401022636384");
          logStep(withIcon("PASS", "Static Contact ID entered"));
        } else {
          logStep(step.mapping('Map "Contact ID" from previous node'));
          await this.page.getByText("Freshsales - new_contact").click();

          const searchBox = this.page
            .getByRole("textbox", { name: "Search fields..." })
            .nth(1);
          logStep(step.open("Open field search"));
          await searchBox.click();
          await searchBox.fill("id");

          logStep(step.select('Select field "ID"'));
          await this.page.getByText("IDid• Contact ID").click();
          logStep(withIcon("MAPPING", "Contact ID mapped"));
        }
        break;

      case "GetBeamer":
        logStep(step.type("Fill connection fields (GetBeamer)"));
        await this.connectionNameInput.fill(
          APP_CONFIG.connection.GetBeamer.name
        );
        await this.apiKeyInput2.fill(APP_CONFIG.connection.GetBeamer.apiKey);
        logStep(withIcon("PASS", "Connection fields filled"));
        break;

      case "Hubspot":
        logStep(step.type("Fill connection fields (Hubspot)"));
        await this.connectionNameInput.fill(APP_CONFIG.connection.Hubspot.name);
        await this.baseUrlInput.fill(APP_CONFIG.connection.Hubspot.baseUrl);
        await this.apiKeyInput1.fill(APP_CONFIG.connection.Hubspot.apiKey);
        logStep(withIcon("PASS", "Connection fields filled"));
        break;

      case "mindbody":
        logStep(step.type("Fill connection fields (mindbody)"));
        await this.connectionNameInput.fill(
          APP_CONFIG.connection.mindbody.name
        );
        await this.siteIdInput.fill(APP_CONFIG.connection.mindbody.siteId);
        await this.apiKeyInput2.fill(APP_CONFIG.connection.mindbody.apiKey);
        logStep(withIcon("PASS", "Connection fields filled"));
        break;

      default:
        logStep(step.info(`No configuration flow for "${appName}"`));
        break;
    }
  }
}
