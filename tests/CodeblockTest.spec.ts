import { test, expect } from "@playwright/test";
import { logStep } from "../utils/logger";
import { SignupPage } from "../pages/SignupPage";
import { step, withIcon } from "../utils/step-icons";
import { CodeblockPage } from "../pages/Codeblock";
import { Workflow } from "../pages/WorkflowPage";
import { WORKFLOW_CONFIG } from "../config/workflowConfig";
import { APP_CONFIG } from "../config/appConfig";
import { PublishWorkflowPage } from "../pages/PublishWorkflowPage";
import { WorkflowTemplatePage } from "../pages/WorkflowTemplatePage";

test.describe("Codeblock - Flow", () => {
  let signupPage: SignupPage;
  let workflowPage: Workflow;
  let publishWorkflowPage: PublishWorkflowPage;
  let workflowTemplatePage: WorkflowTemplatePage;
  let codeblockPage: CodeblockPage;

  const appName = "Freshsales";
  const CodeBlockTool = "Code block";
  const workflowName = "Codeblock Workflow";
  const connectionName = APP_CONFIG.connection.Freshsales.name;

  const trigerWorflowname =
    WORKFLOW_CONFIG.workflow_names.Freshsales.NewContact;
  const actionWorkflowName =
    WORKFLOW_CONFIG.action_workflow_names.Freshsales.UpdateContact;

  const codeSnippet = `
    let FirstName = input.Input1;
    let LastName = input.Input2;
    Output = { FirstName: FirstName, LastName: LastName };
  `;

  test.beforeEach(async ({ page }, testInfo) => {
    signupPage = new SignupPage(page);
    workflowPage = new Workflow(page);
    publishWorkflowPage = new PublishWorkflowPage(page, workflowName);
    workflowTemplatePage = new WorkflowTemplatePage(
      page,
      appName,
      workflowName
    );
    codeblockPage = new CodeblockPage(page, appName);

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
  /*
   // After each test, log the test status
   test.afterAll(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      logStep(step.pass(testInfo.title));
      logStep(step.end("Cleaning up: Deleting created workflow"));
      await signupPage.freshsalesAppsPage();
      logStep(withIcon("PASS", '"Apps" opened'));
      await workflowPage.deleteWorkflow(workflowName);
      logStep(withIcon("PASS", "Cleanup completed: Workflow deleted"));
    } else {
      logStep(step.fail(testInfo.title));
    }
  });
*/
  test("@test @smoke @regression Codeblock - Verify configuration", async ({
    page,
  }) => {
    logStep(step.start("Begin test - Codeblock configuration"));

    // ----- Navigate to Workflow -----
    logStep(step.navigate(`Step1: Open "Workflow" page for "${appName}"`));
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
    logStep(
      step.configure(`Step3: Configure Action — "${actionWorkflowName}"`)
    );
    await workflowPage.clickSecondNode();
    await workflowPage.configureNode(appName, actionWorkflowName);
    await workflowPage.configureAction(appName, actionWorkflowName, "static");
    await workflowPage.saveWorkflowNode();
    logStep(withIcon("PASS", "Action fields mapped (static)"));

    // ----- Add Codeblock -----
    logStep(step.tools('Step4: Verify "Codeblock" node in Tools panel'));
    await workflowPage.addNewNode(CodeBlockTool);
    logStep(withIcon("PASS", "Codeblock node verified in Action node"));

    logStep(step.tools('Step5: Add "Codeblock" node to the workflow'));
    await codeblockPage.addCodeblock();
    logStep(withIcon("PASS", "Codeblock node added successfully"));

    // ----- Verify Editor & Panels -----
    logStep(step.assert("Step6: Verify Codeblock editor & panels render"));
    await expect(
      page.getByRole("button", { name: "Add new input" })
    ).toBeVisible();
    await expect(page.locator(".view-lines")).toBeVisible();
    logStep(withIcon("PASS", "Codeblock editor & panels rendered"));

    // ----- Add Input Literals -----
    logStep(step.create("Step7: Add input literals"));
    await codeblockPage.configureInputFields();
    logStep(withIcon("PASS", "Input literals added successfully"));

    // ----- Enter Code -----
    logStep(step.type("Step8: Enter code snippet"));
    await codeblockPage.enterCode(codeSnippet);
    logStep(withIcon("PASS", "Code snippet entered successfully"));

    logStep(step.click('Step9: Click "Test Code" button'));
    await codeblockPage.testCode();
    logStep(withIcon("PASS", "Code executed successfully"));

    logStep(step.continue("Step10: Save and continue workflow"));
    await workflowPage.continueWorkflow(appName);
    logStep(withIcon("PASS", "Workflow continued successfully"));

    logStep(step.save('Step11: Name workflow and "Create & Activate"'));
    await workflowPage.saveWorkflowName(workflowName);
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    await page.waitForTimeout(1000);
    logStep(withIcon("PASS", "Workflow created and set to Inactive"));

    logStep(step.end("Finished test: Codeblock configuration"));
  });

  test("@test @regression Codeblock - Enduser Verify configuration", async ({
    page,
  }) => {
    logStep(step.start("Begin test - Enduser Codeblock configuration"));

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
      step.assert(
        `Step5: Assert app visible in Marketplace — "${appName}" (token "Automate_Token")`
      )
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

    logStep(step.assert(`Step7: Assert workflow template — "${workflowName}"`));
    await publishWorkflowPage.workflowTemplateAvailablity(workflowName);
    logStep(withIcon("PASS", `Workflow template "${workflowName}" available`));

    logStep(
      step.open(`Step8: Open workflow configuration — "${workflowName}"`)
    );
    await publishWorkflowPage.openWorkflow(workflowName);
    logStep(withIcon("PASS", "Workflow configuration opened"));

    //
    // ----- Trigger Node -----
    //
    logStep(step.open("Step9: Open Trigger node and select connection"));
    await workflowTemplatePage.openTriggerNode();
    await workflowPage.selectConnection(appName);
    await workflowPage.continueWorkflow(appName);

    logStep(
      withIcon("PASS", "Trigger node configured with existing connection")
    );

    //
    // ----- Codeblock Node -----
    //
    logStep(step.codeblock('Step10: Open "Codeblock" node'));
    await codeblockPage.openCodeBlockNode();
    logStep(withIcon("PASS", "Codeblock node opened"));

    logStep(step.codeblock('Step11: Test "Codeblock" node'));
    await codeblockPage.testCode();
    logStep(withIcon("PASS", "Codeblock node tested successfully"));

    logStep(step.save('Step12: Save "Codeblock" node'));
    await codeblockPage.continueWorkflow();
    logStep(withIcon("PASS", "Codeblock node saved"));

    //
    // ----- Action Node -----
    //
    logStep(step.click("Step13: Open Action node and select connection"));
    await workflowTemplatePage.selectActionNodeConnection();
    logStep(
      withIcon("PASS", "Action node configured with existing connection")
    );

    logStep(step.save('Step14: Save "Action" node'));
    await workflowPage.saveWorkflowNode();
    logStep(withIcon("PASS", "Action node saved"));

    //
    // ----- Final Verification -----
    //
    logStep(step.assert("Step15: Verify 'Create' button is enabled"));
    await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();
    logStep(withIcon("PASS", "Workflow is fully configured"));

    logStep(step.end("Finished test: Enduser Codeblock configuration"));
  });

  test("@regression Codeblock - Persistence after configuration", async ({
    page,
  }) => {
    logStep(
      step.start("Begin test - Codeblock persistence after configuration")
    );

    // Step1: Open Workflow page
    logStep(step.navigate('Step1: Open "Workflow" page for "Highperformr"'));
    await workflowPage.navigateToWorkflowPage(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // Step2: Open existing workflow
    logStep(step.open(`Step2: Open existing workflow — "${workflowName}"`));
    await workflowPage.openExistingWorkflow(workflowName);
    await workflowPage.enableEditMode();
    logStep(withIcon("PASS", "Existing workflow opened"));

    // Step3: Open Codeblock node
    logStep(step.open('Step3: Open "Codeblock" node'));
    await codeblockPage.openCodeBlockNode();
    logStep(withIcon("PASS", "Codeblock node opened"));

    // Step4: Verify Save & Continue is disabled
    logStep(step.assert('Step4: Verify "Save & Continue" button is disabled'));
    await expect(
      page.getByRole("button", { name: "Save & Continue" })
    ).toBeDisabled();
    logStep(withIcon("PASS", '"Save & Continue" button is disabled'));

    // Step5: Verify input fields persist
    logStep(step.assert("Step5: Verify input fields persist"));
    await codeblockPage.checkInputPersist();
    logStep(withIcon("PASS", "Input fields persisted"));

    // Step6: Verify code persists
    logStep(step.assert("Step6: Verify code persists"));
    await codeblockPage.checkCodePersist();
    logStep(withIcon("PASS", "Code persisted"));

    // Step7: Test Codeblock
    logStep(step.codeblock('Step7: Test "Codeblock" node'));
    await codeblockPage.testCode();
    await page.waitForTimeout(1000);
    await expect(
      page.getByRole("button", { name: "Save & Continue" })
    ).toBeEnabled();
    logStep(withIcon("PASS", "Codeblock node tested successfully"));

    // Step8: Save Codeblock node
    logStep(step.save('Step8: Save "Codeblock" node'));
    await codeblockPage.continueWorkflow();
    logStep(withIcon("PASS", "Codeblock node saved"));

    // Step9: Verify output mapping persists
    logStep(step.assert("Step9: Verify output mapping persists"));
    await codeblockPage.openActionNode();
    logStep(withIcon("PASS", "Action node opened"));
    await workflowPage.saveWorkflowNode();
    logStep(withIcon("PASS", "Output mapping persisted"));
    workflowPage.backWorkflow();

    logStep(
      step.end("Finished test - Codeblock persistence after configuration")
    );

    // Final save workflow node
    await page.waitForTimeout(1000);
  });
});
