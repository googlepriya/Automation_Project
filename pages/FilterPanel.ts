import { expect, Locator, Page } from "@playwright/test";
import { logStep } from "../utils/logger";
import { step } from "../utils/step-icons";

export class FilterPanel {
  readonly page: Page;
  private readonly panel: Locator;
  private readonly conditionRow: (index: number) => Locator;
  private readonly fieldInput: (index: number) => Locator;
  private readonly operatorDropdown: (index: number) => Locator;
  private readonly valueInput: (index: number) => Locator;
  private readonly addConditionButton: Locator;
  private readonly addGroupButton: Locator;
  private readonly saveButton: Locator;
  private readonly deleteConditionButton: (index: number) => Locator;
  private readonly filterConditionOption: Locator;
  private readonly FSFieldMapping: Locator; // renamed from FSFiledMapping
  private readonly SelectFieldMapping: Locator;
  private readonly SelectValueMapping: Locator;
  private readonly FirstnameField: Locator;
  private readonly removeFilterCondition: Locator;
  private readonly removeFilterGroup: Locator;
  private readonly filterNode: Locator;
  private readonly FirstnameFieldMap: Locator;

  constructor(page: Page, appName: string) {
    this.page = page;

    // ----- Locators -----
    this.panel = this.page.locator("h2:text('Filter & Condition')");

    // Condition rows
    this.conditionRow = (index: number) =>
      this.page.locator(`text=Condition ${index}`).locator("..").first();

    this.fieldInput = (index: number) =>
      this.conditionRow(index)
        .locator("label:text('Field')")
        .locator("..")
        .locator("[data-slate-editor='true']");

    this.operatorDropdown = (index: number) =>
      this.conditionRow(index)
        .locator("label:text('Operator')")
        .locator("..")
        .getByRole("combobox");

    this.valueInput = (index: number) =>
      this.conditionRow(index)
        .locator("label:text('Value')")
        .locator("..")
        .locator("[data-slate-editor='true']");

    this.filterNode = this.page
      .getByTestId("rf__node-2")
      .getByText("Filter")
      .last();

    this.addConditionButton = this.page.getByRole("button", {
      name: "Add Condition",
    });
    this.addGroupButton = this.page.getByRole("button", {
      name: "Add Filter Group",
    });
    this.saveButton = this.page.getByRole("button", {
      name: /Save & Continue/i,
    });

    this.filterConditionOption = this.page.getByRole("combobox", {
      name: "Exactly matches",
    });

    this.FSFieldMapping = this.page.getByText("Freshsales - new_contact");

    this.SelectFieldMapping = this.page
      .getByRole("textbox")
      .filter({ hasText: "Click to select field" })
      .locator("div")
      .nth(0);

    this.SelectValueMapping = this.page
      .getByRole("textbox")
      .filter({ hasText: "Click to select value or" })
      .locator("div")
      .nth(0);

    this.removeFilterCondition = this.page
      .locator(".flex.justify-between.items-center.mb-2 > .MuiButtonBase-root")
      .first();

    this.removeFilterGroup = this.page.locator(
      "div:nth-child(2) > .MuiPaper-root > .p-3 > .flex.justify-between.items-start > .MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeSmall.text-red-500"
    );

    this.FirstnameField = this.page.getByText("First Name").nth(0);
    this.FirstnameFieldMap = this.page.getByText("First Name").nth(0);
  }

  // ----- High-level filter node -----
  async openFilternode() {
    logStep(step.click('Click "Filter" node'));
    await this.filterNode.click();
    logStep(step.pass('"Filter" node opened'));
  }

  // ----- Group & condition CRUD -----
  async updateFilter(operator: string, type?: string) {
    logStep(step.click('Step1: Click "Add Condition"'));
    await this.addConditionButton.click();
    logStep(step.create("Condition row added"));

    // Step 1: Choose operator
    logStep(
      step.click('Open "Operator" dropdown (current: "Exactly matches")')
    );
    await this.filterConditionOption.click();

    logStep(step.select(`Select operator "${operator}"`));
    await this.page
      .getByRole("option", { name: operator, exact: true })
      .click();
    logStep(step.pass(`Operator set to "${operator}"`));

    // Step 2: Map the FIELD
    logStep(step.mapping('Open "Field" picker'));
    await this.SelectFieldMapping.click();

    logStep(step.mapping('Open source "Freshsales - new_contact"'));
    await this.FSFieldMapping.click();

    logStep(step.mapping('Map field to "First name"'));
    await this.FirstnameField.click();
    logStep(step.pass('Field mapped to "First name"'));

    // Step 3: Map the VALUE
    if (type === "dynamic") {
      logStep(step.mapping('Open "Value" picker (dynamic)'));
      await this.SelectValueMapping.click();

      await this.page.waitForTimeout(1000);
      logStep(step.mapping('Open source "Freshsales - new_contact"'));

      logStep(step.mapping('Map value to field "First name"'));
      await this.FirstnameFieldMap.click();
      logStep(step.pass('Dynamic value mapped to "First name"'));
    } else {
      const staticVal = "GP";
      logStep(step.type(`Enter static value "${staticVal}"`));
      await this.SelectValueMapping.fill(staticVal);
      logStep(step.pass("Static value entered"));
    }

    logStep(step.pass(`Condition added (operator: "${operator}")`));

    logStep(step.click('Click "Remove condition"'));
    await this.removeFilterCondition.click();
    logStep(step.del("Condition removed"));

    logStep(step.click('Click "Save & Continue"'));
    await this.saveButton.click();
    logStep(step.pass("Filter configuration saved"));
  }
  async addNewCondition() {
    logStep(step.start('Start to add the filter condition'));
    logStep(step.click('Click "Add Condition"'));
    await this.addConditionButton.click();
    logStep(step.end('End to add the filter condition'));

  }

  async removeCondition() {
    logStep(step.start('Start to remove the filter condition'));
    logStep(step.click('Click "Remove condition"'));
    await this.removeFilterCondition.click();
    logStep(step.end('End to remove the filter condition'));

  }

  async addGroup() {
    logStep(step.start('Start to add the filter group'));
    logStep(step.click('Click "Add Filter Group"'));
    await this.addGroupButton.click();
    logStep(step.end('End to add the filter group'));
  }

  async removeGroup() {
    logStep(step.click('Click "Remove Filter Group"'));
    await this.removeFilterGroup.click();
    logStep(step.end('End to remove the filter group'));

  }

  async updateCondition(operator: string, oldCondition: string, type?: string) {
    logStep(step.click(`Open operator dropdown (current: "${oldCondition}")`));
    await this.page.getByRole("combobox", { name: oldCondition }).click();

    logStep(step.select(`Select operator "${operator}"`));
    await this.page
      .getByRole("option", { name: operator, exact: true })
      .click();
    logStep(step.pass(`Operator set to "${operator}"`));
  }


  // ----- Guided flow: add a filter condition -----
  async addFilterCondition(operator: string, type?: string) {
    // Step 1: Choose operator
    logStep(
      step.click('Open "Operator" dropdown (current: "Exactly matches")')
    );
    await this.filterConditionOption.click();

    logStep(step.select(`Select operator "${operator}"`));
    await this.page
      .getByRole("option", { name: operator, exact: true })
      .click();
    logStep(step.pass(`Operator set to "${operator}"`));

    // Step 2: Map the FIELD
    logStep(step.mapping('Open "Field" picker'));
    await this.SelectFieldMapping.click();

    logStep(step.mapping('Open source "Freshsales - new_contact"'));
    await this.FSFieldMapping.click();

    logStep(step.mapping('Map field to "First name"'));
    await this.FirstnameField.click();
    logStep(step.pass('Field mapped to "First name"'));

    // Step 3: Map the VALUE
    if (type === "dynamic") {
      logStep(step.mapping('Open "Value" picker (dynamic)'));
      await this.SelectValueMapping.click();

      await this.page.waitForTimeout(1000);
      logStep(step.mapping('Open source "Freshsales - new_contact"'));

      logStep(step.mapping('Map value to field "First name"'));
      await this.FirstnameFieldMap.click();
      logStep(step.pass('Dynamic value mapped to "First name"'));
    } else {
      const staticVal = "GP";
      logStep(step.type(`Enter static value "${staticVal}"`));
      await this.SelectValueMapping.fill(staticVal);
      logStep(step.pass("Static value entered"));
    }

    logStep(step.pass(`Condition added (operator: "${operator}")`));
  }

  async addMultipleFieldValues() {
    logStep(step.mapping("Map the second field value"));
    await this.FirstnameField.click();
    logStep(step.pass("Second field value mapped"));

    logStep(step.mapping("Map the third field value"));
    await this.FirstnameField.click();
    logStep(step.pass("Third field value mapped"));
  }
}
