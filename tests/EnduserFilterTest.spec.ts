import { test, expect } from "@playwright/test";
import { Workflow } from "../pages/WorkflowPage";
import { logStep } from "../utils/logger";
import { WORKFLOW_CONFIG } from "../config/workflowConfig";
import { APP_CONFIG } from "../config/appConfig";
import { SignupPage } from "../pages/SignupPage";
import { PublishWorkflowPage } from "../pages/PublishWorkflowPage";
import { WorkflowTemplatePage } from "../pages/WorkflowTemplatePage";
import { FilterPanel } from "../pages/FilterPanel";
import { step, withIcon } from "../utils/step-icons";

test.describe("Filter - Komp Admin & Enduser Workflow configuration", () => {
  let workflowPage: Workflow;
  let filterPanel: FilterPanel;
  let signupPage: SignupPage;
  let publishWorkflowPage: PublishWorkflowPage;
  let workflowTemplatePage: WorkflowTemplatePage;
  const filterWorkflowName = "Filter with Dynamic field Workflow";
  const appName = "Freshsales";
  const FilterTool = "Filter";
  const trigerWorflowname =
    WORKFLOW_CONFIG.workflow_names.Freshsales.NewContact;

  test.beforeEach(async ({ page }, testInfo) => {
    logStep(step.start(testInfo.title));
    test.setTimeout(120_000); // 2-minute timeout per test
    workflowPage = new Workflow(page);
    filterPanel = new FilterPanel(page, appName);
    signupPage = new SignupPage(page);
    publishWorkflowPage = new PublishWorkflowPage(page, appName);
    workflowTemplatePage = new WorkflowTemplatePage(
      page,
      appName,
      filterWorkflowName
    );

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

    /*

    logStep(step.info("Begin: Field mapping using dynamic values in Filter"));

    logStep(step.navigate('Open "Workflow" page for "Freshsales"'));
    await workflowPage.navigateToWorkflowPage(appName);
    logStep(step.pass("Workflow page opened"));

    logStep(
      step.configure(`Configure Trigger — ${appName} → "${trigerWorflowname}"`)
    );
    await workflowPage.newWorkflowbutton();
    await workflowPage.clickFirstNode();
    await workflowPage.configureNode(appName, trigerWorflowname);
    await workflowPage.continueWorkflow(appName);
    logStep(step.pass("Trigger configured"));

    logStep(
      step.filter('Add "Filter" to Action node and select a base condition')
    );
    await workflowPage.configureFilter();
    await workflowPage.selectFilterCondition();
    logStep(step.pass("Base filter condition selected"));

    logStep(
      step.mapping('Add condition — operator "Contains", value "dynamic"')
    );
    await filterPanel.addFilterCondition("Contains", "dynamic");
    await filterPanel.updateFilter("Ends with", "dynamic");

    logStep(step.update('Name workflow and "Create and activate"'));
    await workflowPage.saveWorkflowName("Filter with Dynamic field Workflow");
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    await expect(page.getByText("Active")).toBeVisible({
      timeout: 15_000,
    });
   
    logStep(step.pass("Workflow created and activated"));
    */
  });

  // After each test, log the test status
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "passed") {
      //await workflowPage.backWorkflow();
      logStep(step.start("Cleaning up: Deleting created workflow"));
      await signupPage.freshsalesAppsPage();
      logStep(withIcon("PASS", '"Apps" opened'));
      await workflowPage.deleteWorkflow(filterWorkflowName);
      logStep(step.pass("Cleanup completed: Workflow deleted"));

      logStep(withIcon("SUCCESS", `${testInfo.title}`));
    } else {
      logStep(withIcon("FAIL", `${testInfo.title}`), "error");
    }
    logStep(step.end(testInfo.title));
  });
  test("Verify Enduser - Filter configuration", async ({ page }) => {
    logStep(step.info("1. Begin: Komp Admin - Verify Filter configuration"));

    logStep(step.navigate('Step1: Open "Workflow" page for "Freshsales"'));
    await signupPage.openMenu("Apps");
    await workflowPage.openApp(appName);
    logStep(step.pass("Workflow page opened"));

    logStep(
      step.configure(
        `Step2: Configure Trigger — ${appName} → "${trigerWorflowname}"`
      )
    );
    await workflowPage.newWorkflowbutton();
    await workflowPage.clickFirstNode();
    await workflowPage.configureNode(appName, trigerWorflowname);
    await workflowPage.continueWorkflow(appName);
    logStep(step.pass("Trigger configured"));

    logStep(
      step.filter(
        'Step3: Add "Filter" to Action node and select a base condition'
      )
    );
    await workflowPage.addNewNode(FilterTool);
    await workflowPage.selectFilterNode();
    logStep(step.pass("Base filter node is selected"));

    logStep(
      step.mapping(
        'Step4: Add condition — operator "Contains", value "dynamic"'
      )
    );
    await filterPanel.addFilterCondition("Contains", "dynamic");
    await filterPanel.updateFilter("Ends with", "dynamic");

    logStep(step.update('Step5: Name workflow and "Create and activate"'));
    await workflowPage.saveWorkflowName("Filter with Dynamic field Workflow");
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    await expect(page.getByRole("checkbox", { name: "Active" })).toBeVisible({
      timeout: 15_000,
    });
    logStep(withIcon("PASS", "Komp Admin - Workflow configuration completed"));

    logStep(step.info("2. Begin: Add all supported conditions in a group"));
    logStep(step.open("Open second node (Filter)"));
    await workflowPage.enableEditMode();
    await workflowPage.openSecondNode();

    logStep(step.mapping('Add "Contains" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Contains", "static");
    logStep(step.pass('"Contains" added'));

    logStep(step.mapping('Add "Does not contains" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Does not contains", "static");
    logStep(step.pass('"Does not contains" added'));

    logStep(step.mapping('Add "Does not starts with" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Does not starts with", "static");
    logStep(step.pass('"Does not starts with" added'));

    logStep(step.mapping('Add "Does not ends with" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Does not ends with", "static");
    logStep(step.pass('"Does not ends with" added'));

    logStep(step.mapping('Add "Does not exactly matches" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Does not exactly matches", "static");
    logStep(step.pass('"Does not exactly matches" added'));

    logStep(step.mapping('Add "Ends with" condition (new group)'));
    await filterPanel.addGroup();
    await filterPanel.addFilterCondition("Ends with", "static");
    logStep(step.pass('"Ends with" added'));

    logStep(step.mapping('Add "Starts with" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Starts with", "static");
    logStep(step.pass('"Starts with" added'));

    logStep(step.mapping('Add "After" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("After", "static");
    logStep(step.pass('"After" added'));

    logStep(step.mapping('Add "Is equals to" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Is equals to", "static");
    logStep(step.pass('"Is equals to" added'));

    logStep(step.mapping('Add "Is greater than" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Is greater than", "static");
    logStep(step.pass('"Is greater than" added'));

    logStep(step.mapping('Add "Is lesser than" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Is lesser than", "static");
    logStep(step.pass('"Is lesser than" added'));

    logStep(step.mapping('Add "Is not equals to" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Is not equals to", "static");
    logStep(step.pass('"Is not equals to" added'));

    logStep(step.mapping('Add "Is lesser than or equal to" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition(
      "Is lesser than or equal to",
      "static"
    );
    logStep(step.pass('"Is lesser than or equal to" added'));

    logStep(step.mapping('Add "Is greater than or equal to" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition(
      "Is greater than or equal to",
      "static"
    );
    logStep(step.pass('"Is greater than or equal to" added'));

    logStep(step.mapping('Add "Before" condition'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Before", "static");
    logStep(step.pass('"Before" added'));

    logStep(step.mapping('Add "Exactly matches" condition and remove group'));
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Exactly matches", "static");
    await filterPanel.removeGroup();
    logStep(step.pass('"Exactly matches" added; group removed'));

    logStep(step.save('Save "Filter" node'));
    await workflowPage.saveWorkflowNode();

    logStep(step.update("Step6: Close the workflow configuration modal"));
    await workflowPage.backWorkflow();
    logStep(withIcon("PASS", "All the Condition added"));

    logStep(step.info('3. Begin: Enable app — "Freshsales"'));
    logStep(step.open('Open "Apps"'));
    await signupPage.openMenu("Apps");
    logStep(withIcon("PASS", '"Apps" opened'));

    logStep(step.toggle('Enable app — "Freshsales"'));
    await publishWorkflowPage.enableApp(appName);

    logStep(withIcon("PASS", `"${appName}" enabled`));

    logStep(
      step.info("4. Begin: End User -  Verify Filter configuration in Portal")
    );

    logStep(step.open('Open "Portal Customization"'));
    await signupPage.openMenu("Settings");
    await signupPage.openSubmenu("Portal Customization");
    logStep(withIcon("PASS", "Portal Customization opened"));

    logStep(step.open('Open "Portal Preview"'));
    await publishWorkflowPage.openPreviewInSamePage();
    logStep(withIcon("PASS", "Portal Preview opened"));

    logStep(step.open(`Open app card — "${appName}"`));
    await publishWorkflowPage.openAppCard(appName);
    logStep(withIcon("PASS", "App card opened"));

    logStep(
      step.open(`Open Filter workflow configuration — "${filterWorkflowName}"`)
    );
    await publishWorkflowPage.openFilterWorkflow(filterWorkflowName);
    logStep(withIcon("PASS", "Filter workflow configuration opened"));

    logStep(step.assert('Assert "Filter" node exists on canvas'));
    await expect(page.getByText(/^Filter$/).first()).toBeVisible({
      timeout: 15_000,
    });
    logStep(withIcon("PASS", "Filter node exists"));

    logStep(step.click("Open Trigger node and select connection"));
    await workflowTemplatePage.openTriggerNode();
    await workflowPage.selectConnection(appName);
    await workflowPage.continueWorkflow(appName);
    logStep(withIcon("PASS", "Trigger configured"));

    logStep(step.open('Open "Filter" node'));
    await filterPanel.openFilternode();
    logStep(withIcon("PASS", "Filter node opened"));

    logStep(step.update('Update condition — "Contains" → "Ends with"'));
    await filterPanel.updateCondition("Starts with", "Ends with");
    logStep(withIcon("PASS", "Filter condition updated"));

    logStep(
      step.filter('Add condition — operator "Ends with", value "static"')
    );
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Ends with", "static");
    await filterPanel.updateFilter("Ends with", "static");
    logStep(withIcon("PASS", "Condition added"));
  });
});
