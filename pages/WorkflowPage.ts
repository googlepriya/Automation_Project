import { Page, Locator, expect } from "@playwright/test";
import { APP_CONFIG } from "../config/appConfig";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class Workflow {
  readonly page: Page;

  // ───────────────────────── Navigation Locators ─────────────────────────
  private readonly appsLink: Locator;
  private readonly backChevronButton: Locator;
  private readonly createWorkflowButton: Locator;

  // ───────────────────────── Buttons ─────────────────────────
  private readonly backButton: Locator;
  private readonly update: Locator;
  private readonly filtersBtn: Locator;
  private readonly clearFiltersBtn: Locator;
  private readonly applyFiltersBtn: Locator;
  private readonly editBtn: Locator;
  private readonly continueEditBtn: Locator;

  // ----- Dynamic Options -----
  private readonly fieldsDropdown: (fieldName: string) => Locator;
  private readonly optionCheckbox: (optionName: string) => Locator;
  private readonly workflowLink: (evenlogName: string) => Locator;
  private readonly pathActionNode: (actionNodeNo: number) => Locator;
  private readonly nestedPathActionNode: (actionNodeNo: number) => Locator;
  private readonly nestedSecondPathActionNode: (
    actionNodeNo: number
  ) => Locator;

  // ───────────────────────── Canvas Locators ─────────────────────────
  private readonly triggerNode: Locator;
  private readonly appsTab: Locator;
  private readonly addNodePlusIcon: Locator;
  private readonly continueButton: Locator;
  private readonly secondNode: Locator;

  // ───────────────────────── Connection Locators ─────────────────────────
  private readonly newConnectionButton: Locator;
  private readonly connectionNameInput: Locator;
  private readonly baseUrlInput: Locator;
  private readonly apiKeyInput1: Locator;
  private readonly apiKeyInput2: Locator;
  private readonly fsDomainInput: Locator;
  private readonly siteIdInput: Locator;
  private readonly createConnectionButton: Locator;

  // ───────────────────────── Action Node Locators ─────────────────────────
  private readonly contactIDMapping: Locator;
  private readonly lastNameField: Locator;
  private readonly expandOutputFields: Locator;
  private readonly mappingLastname: Locator;

  // ───────────────────────── Tools / Filter Locators ─────────────────────────
  private readonly toolsList: Locator;
  private readonly filter: Locator;
  private readonly toolCheck: (toolName: string) => Locator;


  // ───────────────────────── Save / Activate Locators ─────────────────────────
  private readonly saveAndContinue: Locator;
  private readonly activateToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.appsLink = page.getByRole("link", { name: "Apps" });
    this.backChevronButton = page.locator(
      'span[role="button"] >> i.bx-bxs-chevron-left'
    );
    this.createWorkflowButton = page.getByRole("button", {
      name: "Create Workflows",
    });

    // Buttons
    /*
    this.backButton = page
      .locator("div")
      .filter({ hasText: /^ConfigureSettingsActiveSave$/ })
      .getByRole("button")
      .first();
*/
    this.backButton = page
      .getByRole("button")
      .filter({ hasText: /^$/ })
      .first();
    this.update = page.getByText("Update", { exact: true });

    this.filtersBtn = page.getByRole("button", { name: "Filters" });
    this.clearFiltersBtn = page.getByRole("button", { name: "Clear Filters" });
    this.applyFiltersBtn = page.getByRole("button", { name: "Apply Filters" });
    this.editBtn = page.getByRole("button", { name: "Edit" });
    this.continueEditBtn = page.getByRole("button", {
      name: "Continue Editing",
    });

    // Dynamic option checkboxes
    this.workflowLink = (evenlogName: string) =>
      this.page.getByRole("cell", { name: evenlogName, exact: true }).first();

    this.fieldsDropdown = (fieldName: string) =>
      page.getByRole("combobox", { name: fieldName, exact: true });

    this.optionCheckbox = (optionName: string) =>
      page
        .getByRole("option", { name: optionName, exact: true })
        .getByRole("checkbox");

    this.pathActionNode = (nodeSelector: number) =>
      page.getByTestId(`rf__node-initial_2_${nodeSelector}`);

    this.nestedPathActionNode = (nodeSelector: number) =>
      page.getByTestId(`rf__node-initial_initial_2_0_${nodeSelector}`);

    this.nestedSecondPathActionNode = (nodeSelector: number) =>
      page.getByTestId(`rf__node-initial_initial_2_1_${nodeSelector}`);

    this.toolCheck = (toolName: string) =>
      page.getByRole("heading", { name: toolName });

    // Canvas
    this.triggerNode = page.getByTestId("rf__node-1");
    this.appsTab = page.getByText("Apps");
    this.addNodePlusIcon = page.locator(
      "//div[@class='absolute']//div/div/div[2]"
    );
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.secondNode = page.getByTestId("rf__node-2");

    // Connection
    this.newConnectionButton = page.getByRole("button", {
      name: "+ New Connection",
    });
    this.connectionNameInput = page.getByRole("textbox", {
      name: "Connection Name",
    });
    this.baseUrlInput = page.getByText("baseUrl");
    this.apiKeyInput1 = page.getByText("apiKey *");
    this.apiKeyInput2 = page.getByText("api_key *");
    this.fsDomainInput = page.getByText("domain *");
    this.siteIdInput = page.getByText("site_id *");
    this.createConnectionButton = page.getByRole("button", {
      name: "Create Connection",
    });

    // Action node fields
    this.contactIDMapping = page
      .getByRole("textbox")
      .filter({ hasText: "Enter a value or map a field" })
      .locator("div")
      .first();
    this.lastNameField = page
      .getByRole("textbox")
      .filter({ hasText: "last_name" })
      .locator("div");
    this.expandOutputFields = page.getByText("Freshsales - new_contact");
    this.mappingLastname = page.locator("span", { hasText: "Last name" });

    // Tools / Filter
    this.toolsList = page.locator(".lucide.lucide-arrow-right");

    this.filter = page.getByRole("heading", { name: "Filter" });

    // Save / Activate
    this.saveAndContinue = page.getByRole("button", {
      name: "Save & Continue",
    });
    this.activateToggle = page.getByRole("checkbox", { name: "Inactive" });
  }

  // ───────────────────────── Methods ─────────────────────────
  async navigateToWorkflowPage(appName: string) {
    logStep(step.open('Open "Apps"'));
    await this.appsLink.click();

    logStep(step.click('Click "Back" chevron'));
    await this.backChevronButton.click();

    logStep(step.open(`Open app "${appName}"`));
    await this.page.getByRole("heading", { name: appName }).click();
    logStep(withIcon("PASS", "App page opened"));
  }

  async openApp(appName: string) {
    logStep(step.open(`Open app "${appName}"`));
    await this.page.getByRole("heading", { name: appName }).click();
    logStep(withIcon("PASS", "App page opened"));
  }

  async searchWorkflow(workflowName: string) {
    logStep(step.start("Start to search the workflow name"));
    await this.page
      .getByRole("textbox", { name: "Search Template name," })
      .fill(workflowName);
    await this.page
      .getByRole("textbox", { name: "Search Template name," })
      .press("Enter");
    await expect(this.page.getByText("Freshsales Workflow")).toBeVisible();
    logStep(step.pass("Search the workflow name is finished"));
  }

  async openExistingWorkflow(workflowName: string) {
    logStep(step.open(`Open existing workflow "${workflowName}"`));
    await this.page.getByText(workflowName).first().click();
    logStep(withIcon("PASS", "Workflow opened"));
  }

  async enableEditMode() {
    await expect(this.page.getByText("View Mode")).toBeVisible();
    logStep(step.assert("Workflow template is View Mode"));

    logStep(step.click("Click Edit button to enable edit mode"));
    await this.editBtn.click();
    logStep(withIcon("PASS", "Clicked Edit button to enable edit mode"));

    logStep(step.click("Click Continue Edit button"));
    await this.continueEditBtn.click();
    logStep(withIcon("PASS", "Clicked Continue Edit button"));

    await expect(this.page.getByText("View Mode")).toBeHidden();
    logStep(withIcon("PASS", "View mode is not visible"));
  }

  async newWorkflowbutton() {
    logStep(step.click('Click "Create Workflows"'));
    await this.createWorkflowButton.click();
    logStep(withIcon("PASS", "New workflow canvas opened"));
  }

  // ───────────────────────── Canvas nodes ─────────────────────────
  async clickFirstNode() {
    logStep(step.click('Click "Trigger" node'));
    await this.triggerNode.click();
    logStep(withIcon("PASS", "Trigger node opened"));
  }

  async clickSecondNode() {
    logStep(step.click('Click "+ Add node" for Action'));
    await this.addNodePlusIcon.click();
    logStep(withIcon("PASS", "Action node placeholder opened"));
  }

  async openPathActionNode(pathNode: number) {
    logStep(step.open("Click  path action node"));
    await this.pathActionNode(pathNode).isEnabled();
    await this.pathActionNode(pathNode).click();
    logStep(step.open("Clicked path action node"));
  }

  
  async updateNodeToFilter() { 
    logStep(step.tools('Open "Tools" tab'));
    await this.toolsList.first().click();

    logStep(step.assert('Assert "Filter" is visible'));
    await expect(this.filter).toBeVisible({ timeout: 10_000 });

    logStep(step.filter('Select "Filter" module'));
    await this.filter.click();
    logStep(withIcon("PASS", "Node updated to Filter"));
  }

  async openNestedPathActionNode(pathNode: number) {
    logStep(step.open("Click first nested path action node"));

    await this.nestedPathActionNode(pathNode).isEnabled();
    await this.nestedPathActionNode(pathNode).click();
    logStep(step.open("Clicked first nested path action node"));
  }

  async openSecondNestedPathActionNode(pathNode: number) {
    logStep(step.open("Click second nested path action node"));

    await this.nestedSecondPathActionNode(pathNode).isEnabled();
    await this.nestedSecondPathActionNode(pathNode).click();
    logStep(step.open("Clicked second nested path action node"));
  }

  async selectApp(appName: string, workflowName: string) {
    logStep(step.open('Open "Apps" tab'));
    await this.appsTab.click();

    logStep(step.select(`Select app "${appName}"`));
    await this.page.getByRole("heading", { name: appName }).first().click();

    logStep(step.select(`Select workflow "${workflowName}"`));
    await this.page.locator(`text=${workflowName}`).first().waitFor();
    await this.page
      .locator(`text=${workflowName}`)
      .first()
      .click({ force: true, timeout: 10_000 });
    logStep(withIcon("PASS", `Selected workflow "${workflowName}"`));
  }

  async selectConnection(appName: string) {
    const connectionName = APP_CONFIG.connection[appName].name;
    const connectionExists = await this.checkConnectionExists(connectionName);

    if (!connectionExists) {
      logStep(
        step.connection(`Connection "${connectionName}" not found — create new`)
      );
      await this.createNewConnection(appName);
      logStep(withIcon("PASS", `Connection "${connectionName}" created`));
    } else {
      logStep(step.info(`Using existing connection "${connectionName}"`));
    }

    logStep(step.toggle('Toggle "Use this connection" switch'));
    await this.page.locator(".relative.inline-flex").first().click();
    logStep(withIcon("PASS", "Connection toggled on"));
    await this.page.waitForTimeout(2000);
  }

  // ───────────────────────── Configure nodes ─────────────────────────
  async configureNode(appName: string, workflowName: string) {
    logStep(step.open('Open "Apps" tab'));
    await this.appsTab.isVisible();
    await this.appsTab.click();

    logStep(step.select(`Select app "${appName}"`));
    const selectApp = this.page.getByRole("heading", { name: appName }).first();
    await selectApp.isEnabled();
    await selectApp.click();

    logStep(step.select(`Select workflow "${workflowName}"`));
    //   await this.page.locator(`text=${workflowName}`).first().waitFor();
    const selectWorkflow = this.page.locator(`text=${workflowName}`).first();
    await selectWorkflow.isVisible();
    await selectWorkflow.click({ force: true, timeout: 10_000 });
    logStep(withIcon("PASS", `Selected workflow "${workflowName}"`));

    const connectionName = APP_CONFIG.connection[appName].name;
    const connectionExists = await this.checkConnectionExists(connectionName);

    if (!connectionExists) {
      logStep(
        step.connection(`Connection "${connectionName}" not found — create new`)
      );
      await this.createNewConnection(appName);
      logStep(withIcon("PASS", `Connection "${connectionName}" created`));
    } else {
      logStep(step.info(`Using existing connection "${connectionName}"`));
    }

    logStep(step.toggle('Toggle "Use this connection" switch'));
    await this.page.locator(".relative.inline-flex").first().click();
    logStep(withIcon("PASS", "Connection toggled on"));
  }

  async continueWorkflow(appName: string) {
    if (appName === "Highperformr") {
      logStep(step.open('Open "Segment" dropdown'));
      await this.page.getByRole("combobox", { name: "Segment *" }).click();

      logStep(step.select('Select segment "test for daloopa"'));
      await this.page.getByText("test for daloopa").click();

      logStep(step.continue('Click "Continue"'));
      await this.continueButton.click();
      logStep(withIcon("PASS", "Dynamic fields configured (Highperformr)"));
    } else {
      logStep(step.continue('Click "Continue"'));
      await this.continueButton.click();
      logStep(withIcon("PASS", "Continued to next step"));
    }
  }

  async updateNode() {
    logStep(step.open("Open action node menu"));
    await this.page.getByTestId("rf__node-2").getByRole("button").click();

    logStep(step.update('Click "Update"'));
    await this.update.click();
    logStep(withIcon("PASS", "Action node update opened"));
  }

  async openSecondNode() {
    logStep(step.click('Click "Action" node'));
    await this.secondNode.click();
    logStep(withIcon("PASS", "Action node opened"));
  }

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
          logStep(step.open('Open "Contact ID" mapping'));
          await this.contactIDMapping.isVisible();
          logStep(step.type('Enter static "Contact ID"'));
          await this.contactIDMapping.fill("401022636384");
          logStep(withIcon("PASS", "Static Contact ID entered"));
        } else {
          logStep(step.mapping('Map "Contact ID" from previous node'));
          await this.expandOutputFields.click();

          logStep(step.open("Open field search"));
          const searchBox = this.page
            .getByRole("textbox", { name: "Search fields..." })
            .nth(1);
          await searchBox.click();
          await searchBox.fill("id");

          logStep(step.select('Select field "ID"'));
          await this.page.getByText("IDid• Contact ID").click();
          logStep(withIcon("MAPPING", "Contact ID mapped"));

          logStep(step.open('Open output mapping for "last_name"'));
          await this.lastNameField.click();

          logStep(step.open("Expand previous output fields"));
          await this.expandOutputFields.click();

          logStep(step.select('Select field "Last name"'));
          await this.mappingLastname.click();
          logStep(withIcon("MAPPING", "Last name mapped"));
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

  // ───────────────────────── Tools / Filter ─────────────────────────
  async selectFilterNode() {
    logStep(step.filter('Click "Filter" module'));
    await this.filter.click();
    logStep(withIcon("PASS", "Filter module selected"));
  }

  async selectFilter() {
    logStep(step.tools('Open "Tools" tab'));
    await this.toolsList.first().click();

    logStep(step.filter('Click "Filter" module'));
    await this.filter.click();
    logStep(withIcon("PASS", "Filter module selected"));

    logStep(step.assert('Assert "Filter" is visible'));
    await expect(this.filter).toBeVisible({ timeout: 10_000 });
    logStep(withIcon("PASS", "Filter available for Action node in "));
  }

  async addNewNode(toolName: string) {
    logStep(step.start('Assert "Filter" is visible'));

    logStep(step.click('Click "+ Add node"'));
    await this.addNodePlusIcon.click();
    logStep(withIcon("PASS", "New node added"));

    logStep(step.tools('Open "Tools" tab'));
    await this.toolsList.first().click();

    logStep(step.assert('Assert "Filter" is visible'));
    await expect(this.toolCheck(toolName)).toBeVisible({ timeout: 10_000 });
    logStep(withIcon("PASS", "Filter available for Action node"));
    logStep(step.end('Assert "Filter" is visible'));
  }

  async toolsTab() {
    logStep(step.tools('Open "Tools" tab'));
    await this.toolsList.first().click();
  }

  // ───────────────────────── Connections ─────────────────────────
  async checkConnectionExists(connectionName: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(".font-medium.text-gray-900", {
        timeout: 5000,
        state: "visible",
      });
      const connectionNames = await this.page.$$eval(
        ".font-medium.text-gray-900",
        (els) => els.map((el) => (el.textContent ? el.textContent.trim() : ""))
      );
      return connectionNames.includes(connectionName);
    } catch (error: any) {
      console.log(`Connection names not found or timed out: ${error.message}`);
      return false;
    }
  }

  async createNewConnection(appName: string) {
    logStep(step.connection('Click "+ New Connection"'));
    await this.newConnectionButton.click();

    switch (appName) {
      case "Highperformr":
        await this.connectionNameInput.fill(
          APP_CONFIG.connection.Highperformr.name
        );
        await this.baseUrlInput.fill(
          APP_CONFIG.connection.Highperformr.baseUrl
        );
        await this.apiKeyInput1.fill(APP_CONFIG.connection.Highperformr.apiKey);
        break;

      case "Freshsales":
        await this.connectionNameInput.fill(
          APP_CONFIG.connection.Freshsales.name
        );
        await this.fsDomainInput.fill(APP_CONFIG.connection.Freshsales.domain);
        await this.apiKeyInput2.fill(APP_CONFIG.connection.Freshsales.apiKey);
        break;

      case "GetBeamer":
        await this.connectionNameInput.fill(
          APP_CONFIG.connection.GetBeamer.name
        );
        await this.apiKeyInput2.fill(APP_CONFIG.connection.GetBeamer.apiKey);
        break;

      case "Hubspot":
        await this.connectionNameInput.fill(APP_CONFIG.connection.Hubspot.name);
        await this.baseUrlInput.fill(APP_CONFIG.connection.Hubspot.baseUrl);
        await this.apiKeyInput1.fill(APP_CONFIG.connection.Hubspot.apiKey);
        break;

      case "mindbody":
        await this.connectionNameInput.fill(
          APP_CONFIG.connection.mindbody.name
        );
        await this.siteIdInput.fill(APP_CONFIG.connection.mindbody.siteId);
        await this.apiKeyInput2.fill(APP_CONFIG.connection.mindbody.apiKey);
        break;

      default:
        logStep(step.info(`No connection template for "${appName}"`));
        break;
    }

    logStep(step.create('Click "Create Connection"'));
    await this.createConnectionButton.click();
    logStep(withIcon("PASS", "Connection created"));
  }

  // ───────────────────────── Save / Activate ─────────────────────────
  async backWorkflow() {
    logStep(step.click("Click back button to close the workflow"));
    await this.backButton.isVisible();
    await this.backButton.click();
    logStep(withIcon("PASS", "Clicked 'Back' button"));
  }
  async saveWorkflowNode() {
    await this.saveAndContinue.isEnabled();
    logStep(step.save('Click "Save & Continue"'));
    await this.saveAndContinue.click();
    logStep(withIcon("PASS", "Node saved"));
  }

  async saveWorkflowName(workflowTemplateName: string) {
    logStep(step.type(`Set workflow name to "${workflowTemplateName}"`));
    await this.page
      .getByRole("textbox", { name: "Untitled" })
      .fill(workflowTemplateName);
    logStep(withIcon("PASS", "Workflow name set"));
  }

  async updateWorkflow() {
    logStep(step.open("Click the 'SAVE '-button to save workflow"));
    // await this.page.getByRole("button", { name: "select option" }).click();
    await this.page.getByRole("button", { name: "Save", exact: true }).click();
  }

  async saveActivateDeactivateWorkflow(option: string) {
    logStep(step.open("Click the 'Create'-button to save workflow"));
    // await this.page.getByRole("button", { name: "select option" }).click();
    await this.page.getByRole("button", { name: "Create" }).click();
    logStep(step.click("Clicked Create button"));
    //await expect(  this.page.getByText("Konnector created successfully") ).toBeVisible({ timeout: 15_000 });
    const activateToggle = this.page.getByRole("checkbox", { name: option });
    logStep(step.select(`Click the toggle button`));

    await activateToggle.isVisible();
    await activateToggle.click();
    logStep(
      withIcon("PASS", `Clicked the toggle button to update the status"`)
    );
  }

  async enableworkflow(option: string) {
    logStep(step.select(`Click the toggle button`));
    //  await this.page.getByRole("menuitem", { name: option }).click();
    //  await this.activateToggle.click();
    await this.page.getByRole("checkbox", { name: option }).click();
    logStep(
      withIcon("PASS", `Clicked the toggle button to update the status"`)
    );
  }

  async deactivateWorkflow() {
    logStep(step.select(`Click the toggle button`));

    await this.page.getByRole("checkbox", { name: "Active" }).click();
    /*  
    //  await this.page.getByRole("menuitem", { name: option }).click();
    //  await this.activateToggle.click();
    await expect(this.page.getByText("Template status updated")).toBeVisible({
    timeout: 15_000,
    });
*/
    logStep(
      withIcon("PASS", `Clicked the toggle button to update the status"`)
    );
  }

  // ───────────────────────── Delete ─────────────────────────
  async deleteWorkflow(workflowName: string) {
    // await this.page.getByRole('complementary').getByRole('button').click();

    logStep(step.open("Open workflow overflow menu"));
    await this.page
      .locator("tr", { hasText: workflowName })
      .locator("button")
      .first()
      .click();

    logStep(step.del('Click "Delete"'));
    const deleteButton = this.page.getByRole("menuitem", { name: "Delete" });
    await deleteButton.click();

    logStep(step.del('Confirm "Delete"'));
    const confirmDeleteButton = this.page.getByRole("button", {
      name: "Delete",
    });
    await confirmDeleteButton.click();

    logStep(withIcon("DELETE", `Deleted workflow "${workflowName}"`));
  }

  async deleteAllWorkflows(workflowName: string) {
    logStep(step.start("Begin deleting all workflows"));
    // Grab workflow rows by the blue clickable name

    while (true) {
      await this.page.waitForTimeout(1000);
      await this.page
        .locator("tr", { hasText: workflowName })
        .locator("button")
        .first()
        .click();
      const rows = await this.page
        .locator("tr", { hasText: workflowName })
        .locator("button")
        .all();
      const rowsCount = rows.length;

      if (rowsCount === 0) {
        logStep(withIcon("PASS", "No workflows left — all deleted"));
        break;
      }

      logStep(step.del('Click "Delete"'));
      const deleteButton = this.page.getByRole("menuitem", { name: "Delete" });
      await deleteButton.click();

      logStep(step.del('Confirm "Delete"'));
      const confirmDeleteButton = this.page.getByRole("button", {
        name: "Delete",
      });
      await confirmDeleteButton.click();

      logStep(withIcon("DELETE", `Deleted workflow "${workflowName}"`));
      await this.page.waitForTimeout(1000);
    }
  }

  async applyFilters(
    configStatus: string,
    status: string,
    workflowName: string
  ) {
    // Apply Konnector Name Filter
    logStep(step.click('Click "Filters" button'));
    await this.filtersBtn.click();
    logStep(withIcon("PASS", '"Filters" button clicked'));

    logStep(step.click('Open "Configuration Status" dropdown'));
    await this.fieldsDropdown("Configuration Status").click();
    logStep(withIcon("PASS", '"Configuration Status" dropdown opened'));

    logStep(step.check(`Select "${configStatus}" option`));
    await this.optionCheckbox(configStatus).check();
    logStep(withIcon("PASS", `Selected "${configStatus}" option`));
    await this.page.keyboard.press("Escape");

    logStep(step.click('Open "Status" dropdown'));
    await this.fieldsDropdown("Status").click();
    logStep(withIcon("PASS", '"Status" dropdown opened'));

    logStep(step.check(`Select "${status}" option`));
    await this.optionCheckbox(status).check();
    // await this.fieldsDropdown(status).click();
    logStep(withIcon("PASS", `Selected "${status}" option`));
    await this.page.keyboard.press("Escape");

    logStep(step.click('Click "Apply Filters" button'));
    await this.applyFiltersBtn.click();
    logStep(withIcon("PASS", '"Apply Filters" button clicked'));
    await this.page.waitForTimeout(1000);

    logStep(step.assert("Check Workflows list is filtered"));
    await expect(this.workflowLink(workflowName)).toBeHidden({
      timeout: 15000,
    });
    logStep(withIcon("PASS", "Workflows list is filtered"));
  }

  async resetFilter(workflowName: string) {
    logStep(step.click('Click "Filters" button'));
    await this.filtersBtn.click();
    logStep(withIcon("PASS", '"Filters" button clicked'));

    logStep(step.click('Click "Clear Filters" button'));
    await this.clearFiltersBtn.click();
    logStep(withIcon("PASS", '"Clear Filters" button clicked'));

    logStep(step.assert("Check Filter is reset to Default"));
    await expect(this.workflowLink(workflowName)).toBeVisible({
      timeout: 15000,
    });
    logStep(withIcon("PASS", "Filter is reset to Default"));
  }
}
