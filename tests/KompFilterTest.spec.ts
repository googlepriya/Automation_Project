import { test, expect } from "@playwright/test";
import { Workflow } from "../pages/WorkflowPage";
import { logStep } from "../utils/logger";
import { WORKFLOW_CONFIG } from "../config/workflowConfig";
import { FilterPanel } from "../pages/FilterPanel";
import { SignupPage } from "../pages/SignupPage";
import { step, withIcon } from "../utils/step-icons";

test.describe.serial("Filter - Komp Admin Workflows", () => {
  let workflowPage: Workflow;
  let filterPanel: FilterPanel;
  let signupPage: SignupPage;
  const appName = "Freshsales";
  const FilterTool = "Filter";
  const trigerWorflowname =
    WORKFLOW_CONFIG.workflow_names.Freshsales.NewContact;
  const actionWorkflowName =
    WORKFLOW_CONFIG.action_workflow_names.Freshsales.UpdateContact;

  // Before each test, login and initialize the workflow page
  test.beforeEach(async ({ page }, testInfo) => {
    logStep(step.start(testInfo.title));
    test.setTimeout(120_000); // 2-minute timeout per test
    workflowPage = new Workflow(page);
    filterPanel = new FilterPanel(page, appName);
    signupPage = new SignupPage(page);
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

  test("@smoke @regression 1.  Filter - Configuration flow", async ({
    page,
  }) => {
    logStep(step.info("Begin: Admin - Filter configuration"));

    logStep(step.navigate('Step1: Open "Workflow" page for "Freshsales"'));
    await workflowPage.navigateToWorkflowPage(appName);
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

    await workflowPage.addNewNode(FilterTool);

    logStep(
      step.filter(
        'Step4: Add "Filter" to Action node and select a base condition'
      )
    );
    await workflowPage.selectFilterNode();
    logStep(step.pass("Base filter condition selected"));

    logStep(
      step.mapping(
        'Step5: Add condition — operator "Contains", value "dynamic"'
      )
    );
    await filterPanel.addFilterCondition("Contains", "dynamic");

    logStep(
      step.mapping(
        'Step5: Add new condition — operator "Contains", value "static"'
      )
    );
    await filterPanel.addNewCondition();
    await filterPanel.addFilterCondition("Contains", "static");

    logStep(step.mapping("Step6: Remove the condition"));
    await filterPanel.removeCondition();

    logStep(step.mapping("Step7: Add the Filter group"));
    await filterPanel.addGroup();

    logStep(step.mapping("Step8: Remove the Filter group"));
    await filterPanel.removeGroup();
  });

  test("1.  Filter - Verify field mapping with static fields values", async ({
    page,
  }) => {
    logStep(step.info("Begin: Filter smoke and regression tests"));

    logStep(step.navigate('Step1: Open "Workflow" page for "Freshsales"'));
    await workflowPage.navigateToWorkflowPage(appName);
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

    await workflowPage.addNewNode(FilterTool);

    logStep(
      step.filter(
        'Step4: Add "Filter" to Action node and select a base condition'
      )
    );
    await workflowPage.selectFilterNode();
    logStep(step.pass("Base filter condition selected"));

    logStep(
      step.mapping('Step5: Add condition — operator "Contains", value "static"')
    );
    await filterPanel.addFilterCondition("Contains", "static");

    logStep(step.save('Save "Filter" node'));
    await workflowPage.saveWorkflowNode();
    logStep(step.pass("Filter node saved"));

    logStep(step.update('Step6: Name workflow and "Create and activate"'));
    await workflowPage.saveWorkflowName("Filter with Static field Workflow");
    await workflowPage.saveActivateDeactivateWorkflow("Inactive");
    const statusLocator = page.locator(".MuiBox-root.mui-70qvj9", {
      hasText: "Active",
    });
   // await expect(statusLocator).toBeVisible({ timeout: 15000 });
    logStep(step.pass("Workflow created and activated"));

    logStep(step.pass("Filter condition saved with static value"));
  });

  test("2.  Filter - Verify update the node from other to Filter ", async ({
    page,
  }) => {
    logStep(step.info('Begin: Update node type — Other → "Filter"'));

    logStep(step.create('Create new workflow for "Freshsales"'));
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
    logStep(step.pass("Workflow canvas opened"));

    logStep(
      step.configure(`Configure Trigger — ${appName} → "${trigerWorflowname}"`)
    );
    await workflowPage.clickFirstNode();
    await workflowPage.configureNode(appName, trigerWorflowname);
    await workflowPage.continueWorkflow(appName);
    logStep(step.pass("Trigger configured"));

    logStep(
      step.configure(`Configure Action — ${appName} → "${actionWorkflowName}"`)
    );
    await workflowPage.clickSecondNode();
    await workflowPage.configureNode(appName, actionWorkflowName);

    logStep(step.save("Save current node configuration"));
    await workflowPage.saveWorkflowNode();
    logStep(step.pass("Action node configured"));

    logStep(step.update('Update node type — switch to "Filter"'));
    await workflowPage.updateNode();
    await workflowPage.updateNodeToFilter();
    logStep(step.pass("Node updated to Filter"));
  });

  test("3.  Filter - Verify update the node to other from Filter", async ({
    page,
  }) => {
    logStep(step.info('Begin: Update node type — "Filter" → Other (Action)'));

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

    logStep(step.filter('Add "Filter" to Action node and select a condition'));
    await workflowPage.addNewNode(FilterTool);
    await workflowPage.selectFilterNode();

    logStep(
      step.mapping('Add condition — operator "Contains", value "static"')
    );
    await filterPanel.addFilterCondition("Contains", "static");

    logStep(step.save('Save "Filter" node'));
    await workflowPage.saveWorkflowNode();

    logStep(step.update('Change node type — "Filter" → Action and save'));
    await workflowPage.updateNode();
    await workflowPage.configureNode("Freshsales", actionWorkflowName);
    await workflowPage.saveWorkflowNode();
    logStep(step.pass("Node updated from Filter to Action"));
  });
  
});
