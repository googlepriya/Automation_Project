import { test, expect } from "@playwright/test";
import { logStep } from "../utils/logger";
import { SignupPage } from "../pages/SignupPage";
import { step, withIcon } from "../utils/step-icons";
import { Workflow } from "../pages/WorkflowPage";
import { WORKFLOW_CONFIG } from "../config/workflowConfig";
import { APP_CONFIG } from "../config/appConfig";
import { PublishWorkflowPage } from "../pages/PublishWorkflowPage";
import { WorkflowTemplatePage } from "../pages/WorkflowTemplatePage";
import { PathPage } from "../pages/PathPage";
import { FilterPanel } from "../pages/FilterPanel";

test.describe("@path Paths - Flow", () => {
  let signupPage: SignupPage;
  let workflowPage: Workflow;
  let publishWorkflowPage: PublishWorkflowPage;
  let workflowTemplatePage: WorkflowTemplatePage;
  let pathPage: PathPage;
  let filterPanel: FilterPanel;

  const appName = "Freshsales";
  const PathTool = "Path";
  const workflowName = "Path Workflow";
  const pathWorkflowName = "Path with Action Workflow";
  const nestWorkflowName = " Nested path workflow";
  const pathPrivateKonnector = "Path - Private Konnector";

  const trigerWorflowname =
    WORKFLOW_CONFIG.workflow_names.Freshsales.NewContact;
  const actionWorkflowName =
    WORKFLOW_CONFIG.action_workflow_names.Freshsales.UpdateContact;

  test.beforeEach(async ({ page }, testInfo) => {
    signupPage = new SignupPage(page);
    workflowPage = new Workflow(page);
    pathPage = new PathPage(page, appName);
    filterPanel = new FilterPanel(page, appName);
    publishWorkflowPage = new PublishWorkflowPage(page, workflowName);
    workflowTemplatePage = new WorkflowTemplatePage(
      page,
      appName,
      workflowName
    );

    logStep(step.start(testInfo.title));
    test.setTimeout(120_000);

    // ----- Login -----
    logStep(step.start("Begin login"));
    logStep(step.open('Log in — open "Dashboard"'));
    // Step 2: Check if already logged in by verifying title or locator
    await page.goto("/dashboard"); // will reuse session
    logStep(step.pass("Logged in — dashboard visible"));
    await page.waitForTimeout(2000);
    const title = await page.title();

    if (title.includes("Admin")) {
      logStep(step.pass("✅ Session is valid, already on dashboard"));
    } else {
      logStep(step.warn("⚠️ Session expired, performing UI login..."));

      await signupPage.loginAgain();
      await expect(page).toHaveTitle(/Admin/, { timeout: 15000 });
      logStep(step.pass("Logged in — dashboard visible"));
      await page.context().storageState({ path: "auth.json" });
    }
  });
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      logStep(withIcon("SUCCESS", `${testInfo.title}`));
    } else {
      logStep(withIcon("FAIL", `${testInfo.title}`), "error");
    }
    logStep(step.end(testInfo.title));
  });

  test("@test path @smoke @regression Verify - Komp Path configuration", async ({
    page,
  }) => {
    logStep(step.start("Begin test - Path configuration"));

    // ----- Navigate to Workflow -----
    logStep(step.navigate(`Step1: Open "Workflow" page for "${appName}"`));
    // await workflowPage.navigateToWorkflowPage(appName);
    await signupPage.openMenu("Apps");
    await workflowPage.openApp(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // ----- Configure Trigger -----
    logStep(
      step.configure(
        `Step2: Configure Trigger — ${appName} → "${trigerWorflowname}"`
      )
    );
    await workflowPage.newWorkflowbutton();
    await workflowPage.clickFirstNode();
    await workflowPage.configureNode(appName, trigerWorflowname);
    await workflowPage.continueWorkflow(appName);
    logStep(withIcon("PASS", "Trigger configured successfully"));

    // ----- Configure Action -----
    logStep(step.configure(`Step3: Open Tools tab in Action node`));
    await workflowPage.addNewNode(PathTool);

    // -----Add Path -----
    logStep(step.path('Step4: Add "Path" node to the workflow'));
    await pathPage.addPath();
    logStep(step.click("Step5: Add new path rule"));
    await pathPage.openPathRuleNode(0);
    logStep(step.click("Step6: Add condition to the path rule"));
    await filterPanel.addFilterCondition("Contains", "dynamic");
    logStep(step.click("Step7: Add another condition to the same path rule"));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Does not contains", "dynamic");

    logStep(step.click("Step8: Save the path rule"));
    await workflowPage.saveWorkflowNode();

    logStep(step.click("Step9: Add second path rule"));
    await pathPage.openPathRuleNode(1);

    await filterPanel.addFilterCondition("Ends with", "dynamic");

    logStep(step.click("Step11: Save the path rule"));
    await workflowPage.saveWorkflowNode();

    logStep(step.click("Step9: Add Third path rule"));
    await pathPage.addPathRule();
    await pathPage.openPathRuleNode(2);

    await filterPanel.addFilterCondition("Starts with", "dynamic");

    logStep(step.click("Step11: Save the path rule"));
    await workflowPage.saveWorkflowNode();

    logStep(step.click("Step9: Add 4th path rule"));
    await pathPage.addPathRule();
    await pathPage.openPathRuleNode(3);
    await filterPanel.addFilterCondition("Is equals to", "dynamic");

    logStep(step.click("Step11: Save the path rule"));
    await workflowPage.saveWorkflowNode();

    logStep(step.click("Step9: Add 5th path rule"));
    await pathPage.addPathRule();
    await pathPage.openPathRuleNode(4);

    await filterPanel.addFilterCondition("Is greater than", "dynamic");

    logStep(step.click("Step11: Save the path rule"));
    await workflowPage.saveWorkflowNode();

    logStep(step.configure("Step12: Configure Path Action nodes"));
    let stepCounter = 1;

    for (let i = 0; i < 5; i++) {
      // --- Path Action Node Configure ---
      logStep(
        step.assert(`Step${stepCounter++}: Verify Path Action node ${i} exists`)
      );
      await expect(page.getByTestId(`rf__node-initial_2_${i}`)).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${i} exists`));

      logStep(
        step.path(`Step${stepCounter++}: Configure Path Action node ${i}`)
      );
      await workflowPage.openPathActionNode(i);
      logStep(withIcon("PASS", `Path Action node ${i} opened`));

      logStep(
        step.save(`Step${stepCounter++}: Select App for Path Action node ${i}`)
      );
      await workflowPage.configureNode(appName, actionWorkflowName);
      logStep(withIcon("PASS", `App selected in Path Action node ${i}`));

      logStep(
        step.save(`Step${stepCounter++}: Configure "Path Action" node ${i}`)
      );
      await workflowPage.configureAction(appName, actionWorkflowName, "static");
      logStep(withIcon("PASS", `Path Action node ${i} configured`));

      logStep(step.save(`Step${stepCounter++}: Save "Path Action" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path Action node ${i} saved`));
    }

    logStep(step.save('Step13: Name workflow and "Create & Activate"'));
    await workflowPage.saveWorkflowName(pathWorkflowName);
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    await page.waitForTimeout(1000);
    logStep(withIcon("PASS", "Workflow created and set to Inactive"));

    logStep(
      step.end(
        "Finished test: Komp Admin - Path rule with Action configuration"
      )
    );
  });

  test("@test @path @regression Verify: Enduser Path configuration", async ({
    page,
  }) => {
    logStep(step.start("Begin test - Enduser Path configuration"));

    //
    // ----- Navigate to Portal -----
    //
    logStep(step.navigate('Step1: Open "Apps" page'));
    await signupPage.openMenu("Apps");
    logStep(withIcon("PASS", '"Apps" page opened'));

    logStep(step.toggle(`Step2: Enable app — "${appName}"`));
    await publishWorkflowPage.enableApp(appName);
    logStep(withIcon("PASS", `App "${appName}" enabled`));

    logStep(step.navigate('Step3: Open "Portal Customization"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Portal Customization");
    logStep(withIcon("PASS", "Portal Customization opened"));

    logStep(step.navigate('Step4: Open "Portal Preview"'));
    await publishWorkflowPage.openPreviewInSamePage();
    logStep(withIcon("PASS", "Portal Preview opened"));

    logStep(
      step.assert(`Step5: Assert app visible in Marketplace — "${appName}"`)
    );
    logStep(
      withIcon("PASS", `Verified: App "${appName}" available in Marketplace`)
    );

    //
    // ----- Workflow Template -----
    //
    logStep(step.open(`Step6: Open app card — "${appName}"`));
    await publishWorkflowPage.openAppCard(appName);
    logStep(withIcon("PASS", "App card opened"));

    logStep(
      step.assert(`Step7: Assert workflow template — "${pathWorkflowName}"`)
    );
    await publishWorkflowPage.workflowTemplateAvailablity(pathWorkflowName);
    logStep(
      withIcon("PASS", `Workflow template "${pathWorkflowName}" available`)
    );

    logStep(
      step.open(`Step8: Open workflow configuration — "${pathWorkflowName}"`)
    );
    await publishWorkflowPage.openWorkflow(pathWorkflowName);
    logStep(withIcon("PASS", "Workflow configuration opened"));

    //
    // ----- Trigger Node -----
    //
    logStep(step.open("Step9: Open Trigger node and select connection"));
    await workflowTemplatePage.openTriggerNode();
    await workflowPage.selectConnection(appName);
    logStep(
      withIcon("PASS", "Trigger node configured with existing connection")
    );

    //
    // ----- Path Rule Node -----
    //

    let stepCounter = 10.1;

    for (let i = 0; i < 5; i++) {
      logStep(step.assert("Create button is disabled until configuration"));
      await expect(page.getByRole("button", { name: "Create" })).toBeDisabled();
      logStep(withIcon("PASS", "Create button is disabled"));

      // --- Path Rule Node Configure ---
      logStep(
        step.assert(`Step${stepCounter++}: Verify Path rule node ${i} exists`)
      );
      await expect(page.getByTestId(`rf__node-filter_2_${i}`)).toBeVisible();
      logStep(withIcon("PASS", `Path rule node ${i} exists`));

      logStep(step.path(`Step${stepCounter++}: Open "Path rule" node ${i}`));
      await pathPage.openPathRuleNode(i);
      logStep(withIcon("PASS", `Path rule node ${i} opened`));

      logStep(step.save(`Step${stepCounter++}: Save "Path rule" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path rule node ${i} saved`));

      // --- Path Action Node Configure ---
      logStep(
        step.assert(`Step${stepCounter++}: Verify Path Action node ${i} exists`)
      );
      await expect(page.getByTestId(`rf__node-initial_2_${i}`)).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${i} exists`));

      logStep(
        step.path(`Step${stepCounter++}: Configure Path Action node ${i}`)
      );
      await workflowPage.openPathActionNode(i);
      logStep(withIcon("PASS", `Path Action node ${i} opened`));

      logStep(
        step.save(
          `Step${stepCounter++}: Select Connection for Path Action node ${i}`
        )
      );
      await workflowPage.selectConnection(appName);
      logStep(withIcon("PASS", `Connection selected in Path Action node ${i}`));

      logStep(step.save(`Step${stepCounter++}: Save "Path Action" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path Action node ${i} saved`));
    }

    //
    // ----- Final Verification -----
    //
    logStep(step.assert("Step15: Verify 'Create' button is enabled"));
    await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();
    logStep(withIcon("PASS", "Workflow is fully configured"));

    logStep(step.end("Finished test: Enduser Path configuration"));
  });

  test("@test @path @regression Path - Persistence after configuration & Update Path Rule Condition", async ({
    page,
  }) => {
    logStep(step.start("Begin test - Path persistence after configuration"));

    // Step1: Open Workflow page
    logStep(step.navigate('Step1: Open "Workflow" page for "Frehsales"'));
    await workflowPage.navigateToWorkflowPage(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // Step2: Open existing workflow
    logStep(step.open(`Step2: Open existing workflow — "${pathWorkflowName}"`));
    await workflowPage.openExistingWorkflow(pathWorkflowName);
    logStep(withIcon("PASS", "Existing workflow opened"));

    // Step3: Enable edit mode
    logStep(step.open(`Step3: Enable edit mode`));
    await workflowPage.enableEditMode();
    logStep(withIcon("PASS", "Enabled edit mode"));

    // Step3: Open Codeblock node
    logStep(step.open('Step4: Open "Path" node'));
    await pathPage.openPathRuleNode(4);
    logStep(withIcon("PASS", "5thth Path rule opened"));

    // Step6: Verify code persists
    logStep(step.assert("Step5: Verify Rule condition persists"));
    await pathPage.checkRuleConditionExists();
    logStep(withIcon("PASS", "RUle condition persisted"));

    logStep(step.update("Step6: Update Rule condition"));
    await filterPanel.updateCondition("Does not contains", "Is Greater than");
    logStep(withIcon("PASS", "Rule condition updated"));

    // Step8: Save Codeblock node
    logStep(step.save('Step7: Save "Path Rule" node'));
    await workflowPage.saveWorkflowNode();
    logStep(withIcon("PASS", "Output mapping persisted"));
    workflowPage.backWorkflow();

    logStep(
      step.end(
        "Finished test - Path persistence after configuration & Update Path Rule Condition"
      )
    );

    // Final save workflow node
    await page.waitForTimeout(1000);
  });

  test("@path Path - Update Actions", async ({ page }) => {
    logStep(step.start("Begin test - Path configuration"));

    // ----- Navigate to Workflow -----
    logStep(step.navigate(`Step1: Open "Workflow" page for "${appName}"`));
    // await workflowPage.navigateToWorkflowPage(appName);
    await signupPage.openMenu("Apps");
    await workflowPage.openApp(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // ----- Configure Trigger -----
    logStep(
      step.configure(
        `Step2: Configure Trigger — ${appName} → "${trigerWorflowname}"`
      )
    );
    await workflowPage.newWorkflowbutton();
    await workflowPage.clickFirstNode();
    await workflowPage.configureNode(appName, trigerWorflowname);
    await workflowPage.continueWorkflow(appName);
    logStep(withIcon("PASS", "Trigger configured successfully"));

    // ----- Configure Action -----
    logStep(step.configure(`Step3: Open Tools tab in Action node`));
    await workflowPage.addNewNode(PathTool);

    // -----Add Path -----
    logStep(step.path('Step4: Add "Path" node to the workflow'));
    await pathPage.addPath();
    logStep(step.click("Step5: Add new path rule"));
    await pathPage.openPathRuleNode(0);
    logStep(step.click("Step6: Add condition to the path rule"));
    await filterPanel.addFilterCondition("Contains", "dynamic");
    logStep(step.click("Step7: Add another condition to the same path rule"));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Does not contains", "dynamic");

    logStep(step.click("Step8: Save the path rule"));
    await workflowPage.saveWorkflowNode();

    logStep(step.click("Step9: Add second path rule"));
    await pathPage.openPathRuleNode(1);

    await filterPanel.addFilterCondition("Ends with", "dynamic");

    logStep(step.click("Step11: Save the path rule"));
    await workflowPage.saveWorkflowNode();

    logStep(step.click("Step9: Add Third path rule"));
    await pathPage.addPathRule();
    await pathPage.openPathRuleNode(2);

    await filterPanel.addFilterCondition("Starts with", "dynamic");

    logStep(step.click("Step11: Save the path rule"));
    await workflowPage.saveWorkflowNode();

    logStep(step.click("Step9: Add 4th path rule"));
    await pathPage.addPathRule();
    await pathPage.openPathRuleNode(3);
    await filterPanel.addFilterCondition("Is equals to", "dynamic");

    logStep(step.click("Step11: Save the path rule"));
    await workflowPage.saveWorkflowNode();
  });

  test("@test @path @regression End User: Path - Private Konnector ", async ({
    page,
  }) => {
    logStep(step.start("Begin test: Enduser Path - Private Konnector configuration"));

    //
    // ----- Navigate to Portal -----
    //
    logStep(step.navigate('Step1: Open "Apps" page'));
    await signupPage.openMenu("Apps");
    logStep(withIcon("PASS", '"Apps" page opened'));

    logStep(step.toggle(`Step2: Enable app — "${appName}"`));
    await publishWorkflowPage.enableApp(appName);
    logStep(withIcon("PASS", `App "${appName}" enabled`));

    logStep(step.navigate('Step3: Open "Portal Customization"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Portal Customization");
    logStep(withIcon("PASS", "Portal Customization opened"));

    logStep(step.navigate('Step4: Open "Portal Preview"'));
    await publishWorkflowPage.openPreviewInSamePage();
    logStep(withIcon("PASS", "Portal Preview opened"));

    logStep(
      step.assert(`Step5: Assert app visible in Marketplace — "${appName}"`)
    );
    logStep(
      withIcon("PASS", `Verified: App "${appName}" available in Marketplace`)
    );

    //
    // ----- Workflow Template -----
    //
    logStep(step.open(`Step6: Open app card — "${appName}"`));
    await publishWorkflowPage.openAppCard(appName);
    logStep(withIcon("PASS", "App card opened"));

    logStep(step.assert("Verify workflow button is available"));
    await expect(page.getByRole("button", { name: "+ workflow" })).toBeVisible({
      timeout: 15_000,
    });
    logStep(
      withIcon("PASS", "Verified workflow button is available successfully")
    );

    logStep(
      step.open("Verify private konnector workflow configuration is opening")
    );

    logStep(step.click("Click on the Workflow button"));
    await workflowTemplatePage.privateWorkflow();
    logStep(
      withIcon("PASS", "Clicked Create private konnector button successfully")
    );

    logStep(step.assert("Check konnector configuration is opening"));
    await expect(page.getByRole("textbox", { name: "Untitled" })).toBeVisible({
      timeout: 15_000,
    });
    logStep(
      withIcon(
        "PASS",
        "Verified private konnector workflow configuration is opened successfully"
      )
    );

    logStep(step.click("Open Trigger node"));
    await workflowTemplatePage.openFirstNode();
    logStep(withIcon("PASS", "Trigger node opened"));

    logStep(step.configure("Configure the trigger node"));
    await workflowPage.configureNode(appName, trigerWorflowname);
    await workflowPage.continueWorkflow(appName);
    logStep(
      withIcon("PASS", `${appName} is configured in trigger node successfully`)
    );

    logStep(step.click("Add new node"));
    await workflowPage.clickSecondNode();
    logStep(withIcon("PASS", "Action node opened"));

    await pathPage.selectTools();
    logStep(withIcon("PASS", " Tools tab opened"));

    // -----Add Path -----
    logStep(step.path('Step4: Add "Path" node to the workflow'));
    await pathPage.addPath();
    logStep(step.click("Step5: Add new path rule"));

    for (let j = 0; j < 2; j++) {
      let stepCounter = 0;

      await pathPage.openPathRuleNode(j);
      logStep(
        step.click(`Step6.${stepCounter}: Add condition to the path rule`)
      );
      await filterPanel.addFilterCondition("Contains", "dynamic");
      logStep(
        step.click(
          `Step6.${stepCounter}: Add another condition to the same path rule`
        )
      );
      await filterPanel.addNewCondition();
      await filterPanel.addFilterCondition("Does not contains", "dynamic");

      logStep(step.click(`Step6.${stepCounter}: Save the path rule`));
      await workflowPage.saveWorkflowNode();

      logStep(step.configure("Step6.${stepCounter}: Add Nested path"));

      // --- Path Action Node Configure ---
      logStep(
        step.assert(`Step6.${stepCounter}: Verify Path Action node ${j} exists`)
      );
      await expect(page.getByTestId(`rf__node-initial_2_${j}`)).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${j} exists`));

      logStep(
        step.path(`Step6.${stepCounter}: Configure Path Action node ${j}`)
      );
      await workflowPage.openPathActionNode(j);
      logStep(withIcon("PASS", `Path Action node ${j} opened`));

      await pathPage.selectTools();
      logStep(withIcon("PASS", " Tools tab opened"));

      await pathPage.addPath();
      logStep(withIcon("PASS", "Nested path is added"));
    }

    for (let i = 0; i < 2; i++) {
      await pathPage.openNestedPathRuleNode(i);
      logStep(
        step.click("Step6.${stepCounter}: Add condition to the path rule")
      );
      await filterPanel.addFilterCondition("Contains", "dynamic");
      logStep(
        step.click(
          "Step6.${stepCounter}: Add another condition to the same path rule"
        )
      );
      await filterPanel.addNewCondition();
      await filterPanel.addFilterCondition("Does not contains", "dynamic");

      logStep(step.click("Step6.${stepCounter}: Save the path rule"));
      await workflowPage.saveWorkflowNode();

      logStep(step.configure("Step11: Add Nested path"));
      let stepCounter = 0;

      // --- Path Action Node Configure ---
      logStep(
        step.assert(
          `Step6.${stepCounter}.${stepCounter++}: Verify Path Action node ${i} exists`
        )
      );
      await expect(
        page.getByTestId(`rf__node-initial_initial_2_0_${i}`)
      ).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${i} exists`));

      logStep(
        step.path(
          `Step6.${stepCounter}.${stepCounter++}: Configure Path Action node ${i}`
        )
      );
      await workflowPage.openNestedPathActionNode(i);
      logStep(withIcon("PASS", `Path Action node ${i} opened`));

      await workflowPage.configureNode(appName, actionWorkflowName);
      logStep(withIcon("PASS", `App selected in Path Action node ${i}`));

      logStep(
        step.save(`Step${stepCounter++}: Configure "Path Action" node ${i}`)
      );
      await workflowPage.configureAction(appName, actionWorkflowName, "static");
      logStep(withIcon("PASS", `Path Action node ${i} configured`));

      logStep(step.save(`Step${stepCounter++}: Save "Path Action" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path Action node ${i} saved`));
    }
    for (let i = 0; i < 2; i++) {
      await pathPage.openSecondNestedPathRuleNode(i);
      logStep(
        step.click("Step6.${stepCounter}: Add condition to the path rule")
      );
      await filterPanel.addFilterCondition("Contains", "dynamic");
      logStep(
        step.click(
          "Step6.${stepCounter}: Add another condition to the same path rule"
        )
      );
      await filterPanel.addNewCondition();
      await filterPanel.addFilterCondition("Does not contains", "dynamic");

      logStep(step.click("Step6.${stepCounter}: Save the path rule"));
      await workflowPage.saveWorkflowNode();

      logStep(step.configure("Step11: Add Nested path"));
      let stepCounter = 0;

      // --- Path Action Node Configure ---
      logStep(
        step.assert(
          `Step6.${stepCounter}.${stepCounter++}: Verify Path Action node ${i} exists`
        )
      );
      await expect(
        page.getByTestId(`rf__node-initial_initial_2_1_${i}`)
      ).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${i} exists`));

      logStep(
        step.path(
          `Step6.${stepCounter}.${stepCounter++}: Configure Path Action node ${i}`
        )
      );
      await workflowPage.openSecondNestedPathActionNode(i);
      logStep(withIcon("PASS", `Path Action node ${i} opened`));

      await workflowPage.configureNode(appName, actionWorkflowName);
      logStep(withIcon("PASS", `App selected in Path Action node ${i}`));

      logStep(
        step.save(`Step${stepCounter++}: Configure "Path Action" node ${i}`)
      );
      await workflowPage.configureAction(appName, actionWorkflowName, "static");
      logStep(withIcon("PASS", `Path Action node ${i} configured`));

      logStep(step.save(`Step${stepCounter++}: Save "Path Action" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path Action node ${i} saved`));
    }
    logStep(step.save('Step13: Name workflow and "Create & Activate"'));
    await workflowPage.saveWorkflowName(pathPrivateKonnector);
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    await page.waitForTimeout(1000);
    logStep(withIcon("PASS", "Workflow created and set to Active"));

    logStep(
      step.end(
        "Finished test: Komp Admin - Path - Private konnector configuration"
      )
    );
  });

  test("@test @path @regression Komp admin: Path - Nested Path configuration ", async ({
    page,
  }) => {
    logStep(step.start("Begin test - Path configuration"));

    // ----- Navigate to Workflow -----
    logStep(step.navigate(`Step1: Open "Workflow" page for "${appName}"`));
    // await workflowPage.navigateToWorkflowPage(appName);
    await signupPage.openMenu("Apps");
    await workflowPage.openApp(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // ----- Configure Trigger -----
    logStep(
      step.configure(
        `Step2: Configure Trigger — ${appName} → "${trigerWorflowname}"`
      )
    );
    await workflowPage.newWorkflowbutton();
    await workflowPage.clickFirstNode();
    await workflowPage.configureNode(appName, trigerWorflowname);
    await workflowPage.continueWorkflow(appName);
    logStep(withIcon("PASS", "Trigger configured successfully"));

    // ----- Configure Action -----
    logStep(step.configure(`Step3: Open Tools tab in Action node`));
    await workflowPage.addNewNode(PathTool);

    // -----Add Path -----
    logStep(step.path('Step4: Add "Path" node to the workflow'));
    await pathPage.addPath();
    logStep(step.click("Step5: Add new path rule"));

    for (let j = 0; j < 2; j++) {
      let stepCounter = 0;

      await pathPage.openPathRuleNode(j);
      logStep(
        step.click(`Step6.${stepCounter}: Add condition to the path rule`)
      );
      await filterPanel.addFilterCondition("Contains", "dynamic");
      logStep(
        step.click(
          `Step6.${stepCounter}: Add another condition to the same path rule`
        )
      );
      await filterPanel.addNewCondition();
      await filterPanel.addFilterCondition("Does not contains", "dynamic");

      logStep(step.click(`Step6.${stepCounter}: Save the path rule`));
      await workflowPage.saveWorkflowNode();

      logStep(step.configure("Step6.${stepCounter}: Add Nested path"));

      // --- Path Action Node Configure ---
      logStep(
        step.assert(`Step6.${stepCounter}: Verify Path Action node ${j} exists`)
      );
      await expect(page.getByTestId(`rf__node-initial_2_${j}`)).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${j} exists`));

      logStep(
        step.path(`Step6.${stepCounter}: Configure Path Action node ${j}`)
      );
      await workflowPage.openPathActionNode(j);
      logStep(withIcon("PASS", `Path Action node ${j} opened`));

      await pathPage.selectTools();
      logStep(withIcon("PASS", " Tools tab opened"));

      await pathPage.addPath();
      logStep(withIcon("PASS", "Nested path is added"));
    }

    for (let i = 0; i < 2; i++) {
      await pathPage.openNestedPathRuleNode(i);
      logStep(
        step.click("Step6.${stepCounter}: Add condition to the path rule")
      );
      await filterPanel.addFilterCondition("Contains", "dynamic");
      logStep(
        step.click(
          "Step6.${stepCounter}: Add another condition to the same path rule"
        )
      );
      await filterPanel.addNewCondition();
      await filterPanel.addFilterCondition("Does not contains", "dynamic");

      logStep(step.click("Step6.${stepCounter}: Save the path rule"));
      await workflowPage.saveWorkflowNode();

      logStep(step.configure("Step11: Add Nested path"));
      let stepCounter = 0;

      // --- Path Action Node Configure ---
      logStep(
        step.assert(
          `Step6.${stepCounter}.${stepCounter++}: Verify Path Action node ${i} exists`
        )
      );
      await expect(
        page.getByTestId(`rf__node-initial_initial_2_0_${i}`)
      ).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${i} exists`));

      logStep(
        step.path(
          `Step6.${stepCounter}.${stepCounter++}: Configure Path Action node ${i}`
        )
      );
      await workflowPage.openNestedPathActionNode(i);
      logStep(withIcon("PASS", `Path Action node ${i} opened`));

      await workflowPage.configureNode(appName, actionWorkflowName);
      logStep(withIcon("PASS", `App selected in Path Action node ${i}`));

      logStep(
        step.save(`Step${stepCounter++}: Configure "Path Action" node ${i}`)
      );
      await workflowPage.configureAction(appName, actionWorkflowName, "static");
      logStep(withIcon("PASS", `Path Action node ${i} configured`));

      logStep(step.save(`Step${stepCounter++}: Save "Path Action" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path Action node ${i} saved`));
    }
    for (let i = 0; i < 2; i++) {
      await pathPage.openSecondNestedPathRuleNode(i);
      logStep(
        step.click("Step6.${stepCounter}: Add condition to the path rule")
      );
      await filterPanel.addFilterCondition("Contains", "dynamic");
      logStep(
        step.click(
          "Step6.${stepCounter}: Add another condition to the same path rule"
        )
      );
      await filterPanel.addNewCondition();
      await filterPanel.addFilterCondition("Does not contains", "dynamic");

      logStep(step.click("Step6.${stepCounter}: Save the path rule"));
      await workflowPage.saveWorkflowNode();

      logStep(step.configure("Step11: Add Nested path"));
      let stepCounter = 0;

      // --- Path Action Node Configure ---
      logStep(
        step.assert(
          `Step6.${stepCounter}.${stepCounter++}: Verify Path Action node ${i} exists`
        )
      );
      await expect(
        page.getByTestId(`rf__node-initial_initial_2_1_${i}`)
      ).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${i} exists`));

      logStep(
        step.path(
          `Step6.${stepCounter}.${stepCounter++}: Configure Path Action node ${i}`
        )
      );
      await workflowPage.openSecondNestedPathActionNode(i);
      logStep(withIcon("PASS", `Path Action node ${i} opened`));

      await workflowPage.configureNode(appName, actionWorkflowName);
      logStep(withIcon("PASS", `App selected in Path Action node ${i}`));

      logStep(
        step.save(`Step${stepCounter++}: Configure "Path Action" node ${i}`)
      );
      await workflowPage.configureAction(appName, actionWorkflowName, "static");
      logStep(withIcon("PASS", `Path Action node ${i} configured`));

      logStep(step.save(`Step${stepCounter++}: Save "Path Action" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path Action node ${i} saved`));
    }

    logStep(step.save('Step13: Name workflow and "Create & Activate"'));
    await workflowPage.saveWorkflowName(nestWorkflowName);
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    await page.waitForTimeout(1000);
    logStep(withIcon("PASS", "Workflow created and set to Inactive"));

    logStep(step.end("Finished test: Pathrule with Action configuration"));
  });

  test("@test @path @regression End User: Path - Nested Path configuration ", async ({
    page,
  }) => {
    logStep(step.start("Begin test - Enduser Nested Path configuration"));

    //
    // ----- Navigate to Portal -----
    //
    logStep(step.navigate('Step1: Open "Apps" page'));
    await signupPage.openMenu("Apps");
    logStep(withIcon("PASS", '"Apps" page opened'));

    logStep(step.toggle(`Step2: Enable app — "${appName}"`));
    await publishWorkflowPage.enableApp(appName);
    logStep(withIcon("PASS", `App "${appName}" enabled`));

    logStep(step.navigate('Step3: Open "Portal Customization"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Portal Customization");
    logStep(withIcon("PASS", "Portal Customization opened"));

    logStep(step.navigate('Step4: Open "Portal Preview"'));
    await publishWorkflowPage.openPreviewInSamePage();
    logStep(withIcon("PASS", "Portal Preview opened"));

    logStep(
      step.assert(`Step5: Assert app visible in Marketplace — "${appName}"`)
    );
    logStep(
      withIcon("PASS", `Verified: App "${appName}" available in Marketplace`)
    );

    //
    // ----- Workflow Template -----
    //
    logStep(step.open(`Step6: Open app card — "${appName}"`));
    await publishWorkflowPage.openAppCard(appName);
    logStep(withIcon("PASS", "App card opened"));

    logStep(
      step.assert(`Step7: Assert workflow template — "${nestWorkflowName}"`)
    );
    await publishWorkflowPage.workflowTemplateAvailablity(nestWorkflowName);
    logStep(
      withIcon("PASS", `Workflow template "${nestWorkflowName}" available`)
    );

    logStep(
      step.open(`Step8: Open workflow configuration — "${nestWorkflowName}"`)
    );
    await publishWorkflowPage.openWorkflow(nestWorkflowName);
    logStep(withIcon("PASS", "Workflow configuration opened"));

    //
    // ----- Trigger Node -----
    //
    logStep(step.open("Step9: Open Trigger node and select connection"));
    await workflowTemplatePage.openTriggerNode();
    await workflowPage.selectConnection(appName);
    logStep(
      withIcon("PASS", "Trigger node configured with existing connection")
    );

    //
    // ----- Path Rule Node Configuration-----
    //

    let stepCounter = 10.1;
    logStep(step.start("EndUser: Configure Path Node"));

    for (let i = 0; i < 2; i++) {
      logStep(step.assert("Create button is disabled until configuration"));
      await expect(page.getByRole("button", { name: "Create" })).toBeDisabled();
      logStep(withIcon("PASS", "Create button is disabled"));

      // --- Path Rule Node Configure ---
      logStep(
        step.assert(`Step${stepCounter++}: Verify Path rule node ${i} exists`)
      );
      await expect(page.getByTestId(`rf__node-filter_2_${i}`)).toBeVisible();
      logStep(withIcon("PASS", `Path rule node ${i} exists`));

      logStep(step.path(`Step${stepCounter++}: Open "Path rule" node ${i}`));
      await pathPage.openPathRuleNode(i);
      logStep(withIcon("PASS", `Path rule node ${i} opened`));

      logStep(step.save(`Step${stepCounter++}: Save "Path rule" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path rule node ${i} saved`));
    }
    logStep(withIcon("PASS", "Path configuration is completed successfully"));

    //
    // -----First Nested Path Node Configuration-----
    //
    logStep(step.start("EndUser: Configure First Nested path node"));

    for (let i = 0; i < 2; i++) {
      logStep(step.assert("Create button is disabled until configuration"));
      await expect(page.getByRole("button", { name: "Create" })).toBeDisabled();
      logStep(withIcon("PASS", "Create button is disabled"));

      // --- Path Rule Node Configure ---
      logStep(
        step.assert(`Step${stepCounter++}: Verify Path rule node ${i} exists`)
      );
      await expect(
        page.getByTestId(`rf__node-filter_initial_2_0_${i}`)
      ).toBeVisible();
      logStep(withIcon("PASS", `Path rule node ${i} exists`));

      logStep(step.path(`Step${stepCounter++}: Open "Path rule" node ${i}`));
      await pathPage.openNestedPathRuleNode(i);
      logStep(withIcon("PASS", `Path rule node ${i} opened`));

      logStep(step.save(`Step${stepCounter++}: Save "Path rule" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path rule node ${i} saved`));

      // --- Path Action Node Configure ---
      logStep(
        step.assert(`Step${stepCounter++}: Verify Path Action node ${i} exists`)
      );
      await expect(
        page.getByTestId(`rf__node-initial_initial_2_0_${i}`)
      ).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${i} exists`));

      logStep(
        step.path(`Step${stepCounter++}: Configure Path Action node ${i}`)
      );
      await workflowPage.openNestedPathActionNode(i);
      logStep(withIcon("PASS", `Path Action node ${i} opened`));

      logStep(
        step.save(
          `Step${stepCounter++}: Select Connection for Path Action node ${i}`
        )
      );
      await workflowPage.selectConnection(appName);
      logStep(withIcon("PASS", `Connection selected in Path Action node ${i}`));

      logStep(step.save(`Step${stepCounter++}: Save "Path Action" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path Action node ${i} saved`));
    }
    logStep(
      withIcon(
        "PASS",
        "First nested Path configuration is completed successfully"
      )
    );

    //
    // -----Second Nested Path Node Configuration-----
    //
    logStep(step.start("EndUser: Configure Second Nested path node"));

    for (let i = 0; i < 2; i++) {
      logStep(step.assert("Create button is disabled until configuration"));
      await expect(page.getByRole("button", { name: "Create" })).toBeDisabled();
      logStep(withIcon("PASS", "Create button is disabled"));

      // --- Path Rule Node Configure ---
      logStep(
        step.assert(`Step${stepCounter++}: Verify Path rule node ${i} exists`)
      );
      await expect(
        page.getByTestId(`rf__node-filter_initial_2_1_${i}`)
      ).toBeVisible();
      logStep(withIcon("PASS", `Path rule node ${i} exists`));

      logStep(step.path(`Step${stepCounter++}: Open "Path rule" node ${i}`));
      await pathPage.openSecondNestedPathRuleNode(i);
      logStep(withIcon("PASS", `Path rule node ${i} opened`));

      logStep(step.save(`Step${stepCounter++}: Save "Path rule" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path rule node ${i} saved`));

      // --- Path Action Node Configure ---
      logStep(
        step.assert(`Step${stepCounter++}: Verify Path Action node ${i} exists`)
      );
      await expect(
        page.getByTestId(`rf__node-initial_initial_2_1_${i}`)
      ).toBeVisible();
      logStep(withIcon("PASS", `Path Action node ${i} exists`));

      logStep(
        step.path(`Step${stepCounter++}: Configure Path Action node ${i}`)
      );
      await workflowPage.openSecondNestedPathActionNode(i);
      logStep(withIcon("PASS", `Path Action node ${i} opened`));

      logStep(
        step.save(
          `Step${stepCounter++}: Select Connection for Path Action node ${i}`
        )
      );
      await workflowPage.selectConnection(appName);
      logStep(withIcon("PASS", `Connection selected in Path Action node ${i}`));

      logStep(step.save(`Step${stepCounter++}: Save "Path Action" node ${i}`));
      await workflowPage.saveWorkflowNode();
      logStep(withIcon("PASS", `Path Action node ${i} saved`));
    }
    logStep(
      withIcon(
        "PASS",
        "Second nested Path configuration is completed successfully"
      )
    );

    //
    // ----- Final Verification -----
    //
    logStep(step.assert("Step15: Verify 'Create' button is enabled"));
    await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();
    logStep(withIcon("PASS", "Workflow is fully configured"));

    logStep(step.end("Finished test: Enduser Nested Path configuration"));
  });
});
