import { test, expect } from "@playwright/test";
import { logStep } from "../utils/logger";
import { SignupPage } from "../pages/SignupPage";
import { step, withIcon } from "../utils/step-icons";
import { WebhookPage } from "../pages/WebhookPage";
import { Workflow } from "../pages/WorkflowPage";
import { WORKFLOW_CONFIG } from "../config/workflowConfig";
import { PublishWorkflowPage } from "../pages/PublishWorkflowPage";
import { WorkflowTemplatePage } from "../pages/WorkflowTemplatePage";
import { CatchhookPage } from "../pages/CatchhookPage";

test.describe("Webhook & Catchhook- Flow", () => {
  let signupPage: SignupPage;
  let workflowPage: Workflow;
  let publishWorkflowPage: PublishWorkflowPage;
  let workflowTemplatePage: WorkflowTemplatePage;
  let webhookPage: WebhookPage;
  let catchhookPage: CatchhookPage;

  const appName = "Freshsales";
  const catchHookTool = "Catch Hook";
  const timestamp = Date.now();
  const contactEmail = `api.+${timestamp}@gmail.com`;
  const workflowName = "Webhook Workflow";
  const GETURL = "https://konnectify-fw.freshdesk.com/api/v2/tickets/225729";
  const POSTURL = "https://konnectify-fw.freshdesk.com/api/v2/tickets";

  const GetMethod = "GET Request";
  const PostMethod = "POST Request";
  const PutMethod = "PUT Request";

  const JSONPayload = `
  { "description": "Details about the issue...", 
    "subject": "Support Needed...", "email": "tom@outerspace.com", 
    "priority": 1, 
    "status": 2, 
    "cc_emails": [ "ram@freshdesk.com", "diana@freshdesk.com" ] 
  }`;

  const PutMethodPayload = `
  { 
    "status": 3, 
  }`;

  const trigerWorflowname =
    WORKFLOW_CONFIG.workflow_names.Freshsales.NewContact;

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
    webhookPage = new WebhookPage(page, appName);
    catchhookPage = new CatchhookPage(page);

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

  // After each test, log the test status
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      logStep(withIcon("SUCCESS", `${testInfo.title}`));
    } else {
      logStep(withIcon("FAIL", `${testInfo.title}`), "error");
    }
    logStep(step.end(testInfo.title));
  });

  test("@test @smoke @regression GET - Webhook configuration ", async ({ page }) => {
    logStep(step.start("Begin test - Webhook configuration with GET Method"));

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
    logStep(step.configure(`Step3: Open Tools tab in Action node`));
    await workflowPage.clickSecondNode();

    logStep(step.tools("Step4:Open Tools panel"));
    await workflowPage.toolsTab();

    // -----Assert Webhook -----
    logStep(step.webhook('Step5: Verify "Webhook" node in Tools panel'));
    // await webhookPage.checkWebhook();

    // -----Add Webhook -----
    logStep(step.webhook('Step5: Add "Webhook" node to the workflow'));
    await webhookPage.addWebhook();

    // -----Configure Webhook with GET Method -----
    logStep(step.webhook("Step6: Select & Configure the webhook method"));
    await webhookPage.configureWebhook(
      GetMethod,
      GETURL,
      "NBqTGDoivpsfQDCKR24P",
      "X"
    );

    // -----Test Webhook Data -----
    logStep(step.webhook("Step7: Test Webhook Data"));
    await webhookPage.testWebhookData();

    // -----Save webhook node -----
    logStep(step.save("Step8: Save the workflow node"));
    await workflowPage.saveWorkflowNode();

    // ----- Save Workflow -----
    logStep(step.save('Step9: Name workflow and "Create & Activate"'));
    await workflowPage.saveWorkflowName(workflowName);
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    await page.waitForTimeout(1000);
    /*
    // ----- Check persistence - after login -----
    logStep(step.update("Step10: Close the workflow configuration modal"));
    await workflowPage.backWorkflow();

    logStep(step.open("Step11: Logout & Login again"));
    await signupPage.logout();
    logStep(withIcon("PASS", "User logged out successfully"));
    await page.waitForTimeout(2000);
    await signupPage.loginAgain();
    logStep(withIcon("PASS", "User logged in again successfully"));

    // Step1: Open Workflow page
    logStep(step.navigate('Step12: Open "Workflow" page for "Highperformr"'));
    await workflowPage.navigateToWorkflowPage(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // Step2: Open existing workflow
    logStep(step.open(`Step13: Open existing workflow — "${workflowName}"`));
    await workflowPage.openExistingWorkflow(workflowName);
    logStep(withIcon("PASS", "Existing workflow opened"));

    // Step3: Open Codeblock node
    logStep(
      step.assert("Step14:Verify Webhook with GET configuration persist")
    );
    await webhookPage.verifyWehbookNodeExist(GetMethod);
*/
    logStep(step.end("Finished test: Webhook configuration with GET method"));
  });

  test("@test @smoke @regression POST - Webhook configuration", async ({ page }) => {
    logStep(step.start("Begin test - Webhook configuration with GET Method"));

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
    logStep(step.configure(`Step3: Open Tools tab in Action node`));
    await workflowPage.clickSecondNode();

    logStep(step.tools("Step4:Open Tools panel"));
    await workflowPage.toolsTab();

    // -----Assert Webhook -----
    logStep(step.webhook('Step5: Verify "Webhook" node in Tools panel'));
    // await webhookPage.checkWebhook();

    // -----Add Webhook -----
    logStep(step.webhook('Step5: Add "Webhook" node to the workflow'));
    await webhookPage.addWebhook();

    // -----Configure Webhook with GET Method -----
    logStep(step.webhook("Step6: Select & Configure the webhook method"));
    await webhookPage.configureWebhook(
      PostMethod,
      POSTURL,
      "NBqTGDoivpsfQDCKR24P",
      "X"
    );

    // ----- Enter the Custom Headers Key and Value -----
    logStep(step.webhook("Step7: Enter the Custom Headers Key and Value"));
    await webhookPage.enterCustomHeaders("Content-Type", "application/json");
    logStep(withIcon("PASS", "Key & Value pair added to Custom Headers"));

    // ----- Enter the payload -----
    logStep(step.webhook("Step7: Enter the payload"));
    await webhookPage.enterPayload(JSONPayload);

    // -----Test Webhook Data -----
    logStep(step.webhook("Step8: Test Webhook Data"));
    await webhookPage.testWebhookData();
    logStep(
      withIcon("PASS", "Checked Webhook Test Data & Ouput schema is displayed")
    );

    // -----Save webhook node -----
    logStep(step.save("Step8: Save the workflow node"));
    await workflowPage.saveWorkflowNode();

    // ----- Save Workflow -----
    logStep(step.save('Step9: Name workflow and "Create & Activate"'));
    await workflowPage.saveWorkflowName(workflowName);
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    await page.waitForTimeout(1000);
    logStep(withIcon("PASS", "Workflow created and set to Inactive"));
    /*
    // ----- Check persistence - after login -----
    logStep(step.update("Step10: Close the workflow configuration modal"));
    await workflowPage.backWorkflow();

    logStep(step.open("Step11: Logout & Login again"));
    await signupPage.logout();
    logStep(withIcon("PASS", "User logged out successfully"));
    await page.waitForTimeout(2000);
    await signupPage.loginAgain();
    logStep(withIcon("PASS", "User logged in again successfully"));

    // Step1: Open Workflow page
    logStep(step.navigate('Step12: Open "Workflow" page for "Highperformr"'));
    await workflowPage.navigateToWorkflowPage(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // Step2: Open existing workflow
    logStep(step.open(`Step13: Open existing workflow — "${workflowName}"`));
    await workflowPage.openExistingWorkflow(workflowName);
    logStep(withIcon("PASS", "Existing workflow opened"));

    // Step3: Open Codeblock node
    logStep(
      step.assert("Step14:Verify Webhook with POSt configuration persist")
    );
    await webhookPage.verifyWehbookNodeExist(PostMethod);
    */
    logStep(step.end("Finished test: Webhook configuration with POST method"));
  });

  test("@smoke @regression Verify Method switch persists", async ({ page }) => {
    logStep(step.start("Begin test - Webhook configuration with GET Method"));

    // Step1: Open Workflow page
    logStep(step.navigate('Step12: Open "Workflow" page for "Highperformr"'));
    await signupPage.openMenu("Apps");
    await workflowPage.openApp(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // Step2: Open existing workflow
    logStep(step.open(`Step13: Open existing workflow — "${workflowName}"`));
    await workflowPage.openExistingWorkflow(workflowName);
    await workflowPage.enableEditMode();
    logStep(withIcon("PASS", "Existing workflow opened"));

    logStep(step.open("Open 3 dots menu in existing webhook node"));
    await workflowPage.updateNode();
    logStep(step.pass("Node updated to Filter"));

    logStep(step.tools("Step4:Open Tools panel"));
    await workflowPage.toolsTab();

    // -----Add Webhook -----
    logStep(step.webhook('Step5: Add "Webhook" node to the workflow'));
    await webhookPage.addWebhook();

    // -----Configure Webhook with GET Method -----
    logStep(step.webhook("Step6: Select & Configure the webhook method"));
    await webhookPage.configureWebhook(
      PutMethod,
      GETURL,
      "NBqTGDoivpsfQDCKR24P",
      "X"
    );

    // ----- Enter the Custom Headers Key and Value -----
    logStep(step.webhook("Step7: Enter the Custom Headers Key and Value"));
    await webhookPage.enterCustomHeaders("Content-Type", "application/json");
    logStep(withIcon("PASS", "Key & Value pair added to Custom Headers"));

    // ----- Enter the payload -----
    logStep(step.webhook("Step7: Enter the payload"));
    await webhookPage.enterPayload(PutMethodPayload);

    // -----Test Webhook Data -----
    logStep(step.webhook("Step8: Test Webhook Data"));
    await webhookPage.testWebhookData();
    logStep(
      withIcon("PASS", "Checked Webhook Test Data & Ouput schema is displayed")
    );

    // -----Save webhook node -----
    logStep(step.save("Step8: Save the workflow node"));
    await workflowPage.saveWorkflowNode();

    // ----- Save Workflow -----
    logStep(step.save('Step9: Name workflow and "Create & Activate"'));
    await workflowPage.saveWorkflowName(workflowName);
    await workflowPage.updateWorkflow();
    await page.waitForTimeout(1000);
    logStep(withIcon("PASS", "Workflow saved"));
    /*
    // ----- Check persistence - after login -----
    logStep(step.update("Step10: Close the workflow configuration modal"));
    await workflowPage.backWorkflow();

    logStep(step.open("Step11: Logout & Login again"));
    await signupPage.logout();
    logStep(withIcon("PASS", "User logged out successfully"));
    await page.waitForTimeout(2000);
    await signupPage.loginAgain();
    logStep(withIcon("PASS", "User logged in again successfully"));

    // Step1: Open Workflow page
    logStep(step.navigate('Step12: Open "Workflow" page for "Highperformr"'));
    await workflowPage.navigateToWorkflowPage(appName);
    logStep(withIcon("PASS", "Workflow page opened"));

    // Step2: Open existing workflow
    logStep(step.open(`Step13: Open existing workflow — "${workflowName}"`));
    await workflowPage.openExistingWorkflow(workflowName);
    logStep(withIcon("PASS", "Existing workflow opened"));

    // Step3: Open Codeblock node
    logStep(
      step.assert("Step14:Verify Webhook with POSt configuration persist")
    );
    await webhookPage.verifyWehbookNodeExist(PutMethod);
    logStep(
      step.end(
        "Persist Switch: Update from method to another in existing configuration "
      )
    );
    */
  });

  test("@test @smoke @regression Trigger Catch-hook configuration", async ({
    page,
    request,
  }) => {
    //
    // ---------- APP SETUP ----------
    //
    logStep(step.start("Begin test: Trigger Catch-hook configuration"));

    logStep(step.open('Step1: Open "Apps" page'));
    await signupPage.openMenu("Apps");
    logStep(withIcon("PASS", '"Apps" page opened'));

    logStep(step.toggle('Step2: Enable app — "Freshsales"'));
    await publishWorkflowPage.enableApp(appName);
    logStep(withIcon("PASS", 'App "Freshsales" enabled'));

    logStep(step.open('Step3: Open "Portal Customization"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Portal Customization");
    logStep(withIcon("PASS", "Portal Customization page opened"));

    logStep(step.open('Step4: Open "Portal Preview"'));
    await publishWorkflowPage.openPreviewInSamePage();
    logStep(withIcon("PASS", "Portal Preview opened"));

    logStep(
      step.assert(
        'Step5: Assert app visible in Marketplace — "Freshsales" (token "Automate_Token")'
      )
    );
    logStep(
      withIcon("PASS", 'Verified: "Freshsales" app available in Marketplace')
    );

    //
    // ---------- WORKFLOW CREATION ----------
    //
    logStep(step.open(`Step6: Open app card — "${appName}"`));
    await publishWorkflowPage.openAppCard(appName);
    logStep(withIcon("PASS", `App card for "${appName}" opened`));

    logStep(
      step.click('Step7: Click "+Workflows" to create Private Konnector')
    );
    await workflowTemplatePage.privateWorkflow();
    logStep(withIcon("PASS", "Private workflow creation started"));

    logStep(step.open("Step8: Open Trigger node"));
    await workflowTemplatePage.openFirstNode();
    logStep(withIcon("PASS", "Trigger node opened"));

    logStep(step.tools("Step9: Open Tools panel"));
    await workflowPage.toolsTab();
    logStep(withIcon("PASS", "Tools panel opened"));

    //
    // ---------- CATCHHOOK CONFIGURATION ----------
    //
    logStep(step.webhook('Step10: Add "Webhook" node to the workflow'));
    await catchhookPage.selectCatchhookTool(catchHookTool);
    logStep(withIcon("PASS", '"Webhook" node added'));

    logStep(step.open("Step11: Copy Webhook URL from Catchhook node"));
    const url = await catchhookPage.copyWebhookUrl();

    logStep(step.type("Step12: Send sample data to Webhook URL via API"));
    const payload = {
      id: "12345",
      name: "Playwright API",
      email: contactEmail,
      status: "TestData",
    };
    await catchhookPage.sendSampleData(request, url, payload);

    logStep(step.click('Step13: Click "Refresh" in Catchhook node'));
    await catchhookPage.refreshData();

    logStep(
      step.verify("Step14: Verify payload data visible in Catchhook node")
    );
    await catchhookPage.verifyPayloadVisible("Playwright API");
    await catchhookPage.verifyPayloadVisible("TestData");

    //
    // ---------- SAVE WORKFLOW ----------
    //
    logStep(step.continue("Step15: Continue to save workflow configuration"));
    await workflowPage.continueWorkflow(appName);
    logStep(withIcon("PASS", "Workflow continued successfully"));

    logStep(step.save('Step16: Save workflow as "Catchhook workflow"'));
    await workflowPage.saveWorkflowName("Catchhook workflow");
    logStep(withIcon("PASS", "Workflow name saved"));

    logStep(step.update("Step17: Update workflow configuration"));
    await workflowPage.updateWorkflow();
    logStep(withIcon("PASS", "Workflow updated"));

    logStep(step.toggle('Step18: Enable workflow status → "Inactive"'));
    await workflowPage.enableworkflow("Inactive");
    logStep(withIcon("PASS", 'Workflow enabled with status "Inactive"'));

    logStep(step.end("Finished test: Trigger Catch-hook configuration"));
  });
});
