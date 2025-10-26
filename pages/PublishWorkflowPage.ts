import { Page, Locator, expect } from "@playwright/test";
import { APP_CONFIG } from "../config/appConfig";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class PublishWorkflowPage {
  readonly page: Page;
  private readonly appsLink: Locator;

  // ---------- Links ----------
  private readonly openPreviewLink: Locator;
  private readonly workflowTemplate: (workflowName: string) => Locator;
  private readonly FilterWorkflowTemplate: Locator;
 

  // ---------- Dropdowns ----------
  private readonly fs3dotsmenubutton: Locator;

  constructor(page: Page, WorkflowName: string) {
    this.page = page;

    // ---------- Buttons ----------
    this.workflowTemplate = (workflowName: string) =>
   page
      .locator(".MuiCard-root")
      .filter({
        has: this.page.getByRole("heading", {
          name: workflowName,
          exact: true,
          level: 6,
        }),
      })
      .filter({
        has: this.page.locator("span.MuiChip-label", { hasText: /^New$/ }),
      })
      .getByRole("button", { name: /configure/i })
      .first();

    this.FilterWorkflowTemplate = page
      .locator(".MuiCard-root")
      .filter({
        has: this.page.getByRole("heading", {
          name: "Filter with Dynamic field Workflow", // exact text from DOM
          exact: true,
          level: 6,
        }),
      })
      .getByRole("button", { name: /configure/i })
      .first();

    this.fs3dotsmenubutton = page
      .locator("div")
      .filter({ hasText: /^freshsales$/ })
      .getByRole("button");


    // ---------- Links ----------
    this.appsLink = page.getByRole("link", { name: "Apps" });
    this.openPreviewLink = page.getByRole("link", {
      name: "Open preview in new tab",
    });
  }

  // ------------ Navigation ------------
  async openPreviewInSamePage() {
    const link = this.page.getByRole("link", {
      name: "Open preview in new tab",
    });
    const href = await link.getAttribute("href");
    logStep(step.open('Open "Portal Preview" in current tab'));
    await this.page.goto(href!);
    logStep(step.pass('Opened "Portal Preview"'));
  }

  // ------------ App enable/disable ------------
  async enableApp(appName: string) {
    logStep(step.open(`Open options menu for app "${appName}"`));
    await this.fs3dotsmenubutton.click();

    const enableMenuItem = this.page.locator('li[role="menuitem"]');
    const textContent = await enableMenuItem.textContent();

    if (textContent?.trim() === "Enable") {
      logStep(step.update(`Enable app "${appName}"`));
      await this.page.waitForTimeout(1000);
      await enableMenuItem.click();

      logStep(step.pass(`Enabled app "${appName}"`));
    } else {
      logStep(step.info(`App "${appName}" already enabled or menu not found`));
    }
  }

  async disableApp(appName: string) {
    logStep(step.open(`Open options menu for app "${appName}"`));
    await this.fs3dotsmenubutton.click();

    const disableMenuItem = this.page.locator('li[role="menuitem"]');
    const textContent = await disableMenuItem.textContent();

    if (textContent?.trim() === "Disable") {
      logStep(step.update(`Disable app "${appName}"`));
      await this.page.waitForTimeout(1000);
      await disableMenuItem.click();
      logStep(step.pass(`Disabled app "${appName}"`));
    } else {
      logStep(step.info(`App "${appName}" already disabled or menu not found`));
    }
  }

  // ------------ Marketplace visibility ------------

  async checkPreviewLinkExists(): Promise<boolean> {
    try {
      await this.openPreviewLink
        .first()
        .waitFor({ state: "visible", timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  // ------------ Portal preview interactions ------------
  async openAppCard(appName: string) {
    logStep(step.open(`Open app card "${appName}" (Installed)`));
    const installedCard = this.page
      .locator(
        `.MuiCard-root:has(h5:has-text("freshsales")):has(.MuiChip-label:has-text("Installed"))`
      )
      .first();
    await installedCard.waitFor({ state: "visible", timeout: 15000 });
    await installedCard.click();
    logStep(step.pass("App card opened"));
  }

  async openWorkflow(workflowName: string) {
    logStep(step.open(`Open workflow configuration "${workflowName}"`));
    await this.workflowTemplate(workflowName).click();
    logStep(step.pass("Workflow configuration opened"));
  }

  async openFilterWorkflow(filterWorkflowName: string) {
    logStep(step.open(`Open workflow configuration "${filterWorkflowName}"`));
    await this.FilterWorkflowTemplate.click();
    logStep(step.pass("Workflow configuration opened"));
  }

  async workflowTemplateAvailablity(workflowName: string) {
    logStep(
      step.assert(`Assert workflow template "${workflowName}" is visible`)
    );
    await this.workflowTemplate(workflowName).isVisible();
    logStep(step.pass(`"${workflowName}" is available`));
  }
}
