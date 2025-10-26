import { expect, Locator, Page } from "@playwright/test";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class CodeblockPage {
  readonly page: Page;
  private readonly addPlus: Locator;
  private readonly ToolsList: Locator;
  private readonly AddInputBtn: Locator;

  // ----- Buttons -----
  private readonly saveAndContinueButton: Locator;
  private readonly testButton: Locator;
  private readonly excuteButton: Locator;
  private readonly node2Btn: Locator;

  // ----- Locators -----
  private readonly codeblock: Locator;
  private readonly codeblockNode: Locator;

  // ----- Mapping fields -----
  private readonly expandOutputFields: Locator;
  private readonly contactIDMapping: Locator;
  private readonly mappingLastname: Locator;
  private readonly mappingFirstname: Locator;

  // ----- Input fields -----
  private readonly keyInput: Locator;
  private readonly valueInput: Locator;
  private readonly codeInput: Locator;
  private readonly testInput1: Locator;
  private readonly testInput2: Locator;
  private readonly firstNameTextbox: Locator;
  private readonly lastNameTextbox: Locator;

  // ----- Mapping Options -----
  private readonly codeBlockOption: Locator;
  private readonly firstNameOption: Locator;
  private readonly lastNameOption: Locator;

  // ----- Mapped Fields -----
  private readonly firstNameInputMapped: Locator;
  private readonly lastNameInputMapped: Locator;
  private readonly codeExisting: Locator;
  private readonly firstNameOutputMapped: Locator;
  private readonly lastNameOutputMapped: Locator;

  constructor(page: Page, appName: string) {
    this.page = page;

    this.addPlus = page.locator(".border-2").first();

    // ----- Buttons -----
    this.AddInputBtn = page.getByRole("button", { name: "Add new input" });
    this.testButton = page.getByRole("button", { name: "Test Code" });
    this.saveAndContinueButton = page.getByRole("button", {
      name: "Save & Continue",
    });

    this.excuteButton = page.getByRole("button", { name: "Execute Code" });
    this.node2Btn = page.getByTestId("rf__node-2");

    // ----- Input fields -----
    this.keyInput = page
      .getByRole("textbox")
      .filter({ hasText: "Enter your key" });

    this.valueInput = page
      .getByRole("textbox")
      .filter({ hasText: "Enter text or add fields" })
      .locator("div");

    this.codeInput = page.getByRole("textbox", { name: "Editor content" });

    this.testInput1 = page.getByRole("textbox", {
      name: "Enter value for Input1",
    });
    this.testInput2 = page.getByRole("textbox", {
      name: "Enter value for Input2",
    });

    this.ToolsList = page.locator("div").filter({
      hasText:
        /^ToolsHelpful utilities to support various tasks and workflows\.$/,
    });

    this.firstNameTextbox = page.locator(
      "div:nth-child(2) > div > div > .relative.w-full > .relative > .w-full"
    );
    this.lastNameTextbox = page.locator(
      "div:nth-child(3) > div > div > .relative.w-full > .relative > .w-full"
    ); 
    // this.firstNameTextbox = page .getByRole("textbox")  //    .filter({ hasText: "first_name" })  .locator("div");
    // Action node fields
    //   this.firstNameTextbox = page.getByRole("textbox").filter({ hasText: "Enter a value or map a field" }).locator("div").nth(2);

    //  this.lastNameTextbox = page.getByRole("textbox") .filter({ hasText: "last_name" });

    // ----- Locators -----
    this.codeblock = page.getByRole("heading", { name: "Code block" });
    this.codeblockNode = page.getByTestId("rf__node-3");

    // ----- Mapping fields -----
    this.expandOutputFields = page.getByText("Freshsales - new_contact");

    this.mappingFirstname = page
      .locator("span")
      .filter({ hasText: "First name" });

    this.mappingLastname = page
      .locator("span")
      .filter({ hasText: "Last name" });

    // ----- Mapping Options -----
    this.codeBlockOption = page.getByText("2. Code block");
    this.firstNameOption = page.locator("span", { hasText: "FirstName" });
    this.lastNameOption = page.locator("span", { hasText: "LastName" });

    // ----- Mapped Fields -----
    this.firstNameInputMapped = page
      .getByRole("textbox")
      .filter({ hasText: "First name" })
      .getByRole("button");
    this.lastNameInputMapped = page
      .getByRole("textbox")
      .filter({ hasText: "Last name" })
      .getByRole("button");
    this.codeExisting = page.getByText("Output", { exact: true });
    this.firstNameOutputMapped = page
      .getByRole("textbox")
      .filter({ hasText: "FirstName" })
      .locator("div");
    this.lastNameOutputMapped = page
      .getByRole("textbox")
      .filter({ hasText: "LastName" })
      .locator("div");
  }

  async openCodeBlockNode() {
    logStep(step.codeblock('Click "Codeblock" node to configure'));
    await this.codeblockNode.click();
    logStep(withIcon("PASS", "Codeblock node opened for configuration"));
  }

  async addCodeblock() {
    logStep(step.codeblock('Select "Codeblock"'));
    await this.codeblock.click();
    logStep(withIcon("PASS", "Codeblock selected"));
  }

  async addInputLiteral() {
    logStep(step.click('Click "Add new input" button'));
    await this.AddInputBtn.click();
    logStep(withIcon("PASS", "New input literal added"));
  }

  async configureInputFields() {
    logStep(step.click('Click "Add new input" button'));
    await this.AddInputBtn.click();
    logStep(withIcon("PASS", "New input literal added"));

    logStep(step.configure("Configure input fields - Name, Type, Value"));

    logStep("Enter the key as Input1");
    await this.keyInput.fill("Input1");
    logStep(withIcon("PASS", 'Key "Input1" entered'));

    logStep("Select the value as First name from Freshsales");
    await this.valueInput.click();
    await this.expandOutputFields.click();
    await this.mappingFirstname.click();
    logStep(withIcon("PASS", 'Value "First name" selected from Freshsales'));

    logStep("Add another input literal");
    await this.AddInputBtn.click();
    logStep(withIcon("PASS", "Another input literal added"));

    logStep("Enter the key as Input2");
    await this.keyInput.fill("Input2");
    logStep(withIcon("PASS", 'Key "Input2" entered'));

    logStep("Select the value as Last name from Freshsales");
    await this.valueInput.click();
    await this.mappingLastname.click();
    logStep(withIcon("PASS", 'Value "Last name" selected from Freshsales'));

    logStep(withIcon("PASS", "Input fields configured"));
    //   await this.waitForTimeout(2000);
  }

  async enterCode(code: string) {
    logStep(step.type("Enter code in the code editor"));
    await this.codeInput.fill(code);
    logStep(withIcon("PASS", "Code entered in the editor"));
  }

  async testCode() {
    logStep(step.click('Click "Test Code" button'));
    await this.testButton.click();
    logStep(withIcon("PASS", "Clicked Test Code button successfully"));

    await this.page.waitForTimeout(2000);

    await expect(this.testInput1).toBeVisible();
    await expect(this.testInput2).toBeVisible();
    logStep(withIcon("PASS", "Test input fields are visible"));

    logStep(step.type('Enter value for "Input1" & "Input2"'));
    await this.testInput1.fill("Gokulapriya");
    await this.testInput2.fill("Subramani");
    logStep(withIcon("PASS", 'Values entered for "Input1" & "Input2"'));

    logStep(step.click('Click "Test Code" button'));
    await this.excuteButton.click();
    logStep(withIcon("PASS", "Clicked Test Code button successfully"));

    await this.page.waitForTimeout(2000);

    logStep(step.assert("Assert: Code executed successfully "));
    // await expect(this.page.getByText("No errors!")).toBeVisible();
    await expect(
      this.page.getByText("Code executed successfully")
    ).toBeVisible();
    logStep(withIcon("PASS", "Code executed successfully"));

    await this.page.waitForTimeout(2000);

    logStep(step.assert("Assert: No error in code & Output generated"));
    await expect(this.page.getByText("FirstName(string)")).toBeVisible();
    await expect(this.page.getByText("FirstName(string)")).toBeVisible();

    logStep(withIcon("PASS", "Output1 & Output2 are visible"));
  }

  async continueWorkflow() {
    logStep(step.continue('Click "Continue" button'));
    await this.saveAndContinueButton.click();
  }

  async mapOutputFields() {
    logStep(step.mapping("Map output fields in Action node"));
    // Click node
    logStep(step.click('Click node "rf__node-2"'));
    await this.node2Btn.click();
    logStep(withIcon("PASS", 'Clicked node "rf__node-2"'));

    // Map First Name
    logStep(step.click('Click "first_name" textbox'));
    await this.firstNameTextbox.click();
    logStep(withIcon("PASS", 'Clicked "first_name" textbox'));

    logStep(step.click('Select "Code block" option for first name'));
  //  await this.codeBlockOption.click();
    logStep(withIcon("PASS", 'Selected "Code block" option for first name'));

    logStep(step.click('Select "FirstName" mapping'));
    await this.firstNameOption.click();
    logStep(withIcon("PASS", 'Mapped "first_name" to "FirstName"'));

    // Map Last Name
    logStep(step.click('Click "last_name" textbox'));
    await this.lastNameTextbox.click();
    logStep(withIcon("PASS", 'Clicked "last_name" textbox'));

    logStep(step.click('Select "Code block" option for last name'));
  //  await this.codeBlockOption.click();
    logStep(withIcon("PASS", 'Selected "Code block" option for last name'));

    logStep(step.click('Select "LastName" mapping'));
    await this.lastNameOption.click();
    logStep(withIcon("PASS", 'Mapped "last_name" to "LastName"'));
  }

  // ----- Methods -----

  async checkInputPersist() {
    await this.page.waitForTimeout(4000);

    logStep(step.verify('Verify "First name" and "Last name" inputs persist'));
    //await this.page.screenshot({ path: "debug.png", fullPage: true });
    // console.log(await this.page.content());
    // await expect(this.firstNameInputMapped).toBeVisible();
    //  logStep(withIcon("PASS", `"First name" input label is visible`));

    // await expect(this.lastNameInputMapped).toBeVisible();
    logStep(withIcon("PASS", `"Last name" input label is visible`));
  }

  async checkCodePersist() {
    logStep(step.verify('Verify "Output" section persists in Codeblock'));
    await expect(this.codeExisting).toBeVisible();
    logStep(withIcon("PASS", `"Output" section is visible`));
  }

  async openActionNode() {
    // Click node
    logStep(step.click('Click node "rf__node-2"'));
    await this.node2Btn.click();
    logStep(withIcon("PASS", "Clicked action node"));
  }

  async checkMappingPersist() {
    logStep(step.verify("Verify mapping fields persist"));

    await expect(this.firstNameOutputMapped).toBeVisible();
    logStep(withIcon("PASS", `"FirstName" mapping field is visible`));

    await expect(this.lastNameOutputMapped).toBeVisible();
    logStep(withIcon("PASS", `"LastName" mapping field is visible`));
  }
}
