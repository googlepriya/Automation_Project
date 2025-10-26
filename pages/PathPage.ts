import { expect, Locator, Page } from "@playwright/test";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class PathPage {
  readonly page: Page;
  private readonly addPlus: Locator;
  private readonly ToolsList: Locator;
  private readonly AddInputBtn: Locator;

  // ----- Buttons -----
  private readonly saveAndContinueButton: Locator;
  private readonly node2Btn: Locator;
  private readonly plusBtn: Locator;

  // ----- Locators -----
  private readonly path: Locator;
  private readonly firstPathRule: Locator;

  // ----- Mapping fields -----
  private readonly expandOutputFields: Locator;
  private readonly contactIDMapping: Locator;
  private readonly mappingLastname: Locator;
  private readonly mappingFirstname: Locator;
  private readonly openPathRule: (ruleNodeNo: number) => Locator;
  private readonly openNestedPathRule: (ruleNodeNo: number) => Locator;
  private readonly opensecondNestedPathRule: (ruleNodeNo: number) => Locator;



  // ----- Input fields -----

  // ----- Mapping Options -----

  // ----- Mapped Fields -----

  constructor(page: Page, appName: string) {
    this.page = page;

    this.addPlus = page.locator(".border-2").first();

    // ----- Buttons -----
    this.plusBtn = page
      .getByTestId("rf__node-2")
      .getByRole("button", { name: "Add new path" });

    this.openPathRule = (ruleNodeNo: number) =>
      page.getByTestId(`rf__node-filter_2_${ruleNodeNo}`);

    this.openNestedPathRule = (ruleNodeNo: number) =>
      page.getByTestId(`rf__node-filter_initial_2_0_${ruleNodeNo}`);

    this.opensecondNestedPathRule = (ruleNodeNo: number) =>
      page.getByTestId(`rf__node-filter_initial_2_1_${ruleNodeNo}`);


    // ----- Input fields -----

    this.ToolsList = page.locator("div").filter({
      hasText:
        /^ToolsHelpful utilities to support various tasks and workflows\.$/,
    });

    // ----- Locators -----
    this.path = page.getByRole("heading", { name: "Path" });
    this.firstPathRule = page.getByTestId("rf__node-filter_2_0");

    // ----- Mapping fields -----
    this.expandOutputFields = page.getByText("Freshsales - new_contact");

    this.mappingFirstname = page
      .locator("span")
      .filter({ hasText: "First name" });

    this.mappingLastname = page
      .locator("span")
      .filter({ hasText: "Last name" });

    // ----- Mapping Options -----

    // ----- Mapped Fields -----
  }

  async selectTools() {
    logStep(step.tools('Open "Tools" tab'));
    await this.ToolsList.first().click();

    logStep(step.assert('Assert "Path" is visible'));
    await expect(this.path).toBeVisible({ timeout: 10_000 });
    logStep(withIcon("PASS", "Path available for Action node"));
  }

  async addPath() {
    logStep(step.path('Select "Path"'));
    await this.path.click();
    logStep(withIcon("PASS", "Path selected"));
    await this.page.waitForTimeout(2000);
    await this.page.mouse.click(0, 0);
  }

  async addPathRule() {
    logStep(step.click('Click "Add new path" button'));
    await this.plusBtn.click();
    logStep(withIcon("PASS", "New path rule added"));
    await this.page.waitForTimeout(2000);

    await this.page.mouse.click(0, 0);
    await this.page.waitForTimeout(1000);
  }

  async openPathRuleNode(ruleNodeNo: number) {
    logStep(step.click(`Click "Path Rule" node ${ruleNodeNo + 1}`));
    await this.openPathRule(ruleNodeNo).click();
    logStep(withIcon("PASS", `Path rule ${ruleNodeNo + 1} opened`));
  }


  async openNestedPathRuleNode(ruleNodeNo: number) {
    logStep(step.click(`Click "Path Rule" node 2_0_${ruleNodeNo}`));
    await this.openNestedPathRule(ruleNodeNo).click();
    logStep(withIcon("PASS", `Path Rule" node 2_0_${ruleNodeNo}`));
  }

  async openSecondNestedPathRuleNode(ruleNodeNo: number) {
    logStep(step.click(`Click "Path Rule" node 2_1_${ruleNodeNo}`));
    await this.opensecondNestedPathRule(ruleNodeNo).click();
    logStep(withIcon("PASS", `Path Rule" node 2_0_${ruleNodeNo}`));
  }

  async checkRuleConditionExists() {
    logStep(step.verify('Verify "Rule Condition" persists in Path Rule'));
    await expect(
      this.page.getByRole("combobox", { name: "Is greater than" })
    ).toBeVisible();
    logStep(withIcon("PASS", `"Rule Condition" is exists`));
  }
}
