import { expect, Locator, Page, APIRequestContext } from "@playwright/test";

import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";

export class CatchhookPage {
  readonly page: Page;
  private readonly toolsSelection: (method: string) => Locator;

  // ---- Buttons --- //
  private readonly copyURLBtn: Locator;
  private readonly tryAgainBtn: Locator;
  private readonly refreshBtn: Locator;

  // ---- Input Fields --- //
  private readonly webhookUrlInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toolsSelection = (tool: string) =>
      page.getByText(tool, { exact: true });

   

    // ---- Buttons --- //
    this.copyURLBtn = page.locator(".lucide.lucide-copy");
    this.tryAgainBtn = page.getByRole("button", { name: "Try Again" });
    this.refreshBtn = page.getByRole("button", { name: "Refresh Data" });

    // ---- Input Fields --- //
    this.webhookUrlInput = page.locator(
      "code.text-green-400.text-sm.font-mono.break-all"
    );
  }

  async selectCatchhookTool(toolName: string) {
    logStep(step.webhook('Select "Catch-hook"'));
    await this.toolsSelection(toolName).click();
    await this.page.waitForTimeout(1000);
    await this.toolsSelection(toolName).click();
    logStep(withIcon("PASS", "Catchhook selected"));
    await this.page.waitForTimeout(1000);
  }

  // ----- Copy Webhook URL -----
  async copyWebhookUrl(): Promise<string> {
    logStep(step.open("Copy Webhook URL from CatchHook node"));
    const url = await this.webhookUrlInput.innerText(); // ✅ works for <code>
    logStep(withIcon("PASS", `Webhook URL copied: ${url}`));
    return url.trim(); // remove any trailing spaces
  }

  // ----- Send Sample Data via API -----
  async sendSampleData(request: APIRequestContext, url: string, payload: any) {
    logStep(step.type("Execute the CatchHook URL via API"));
    const response = await request.post(url, { data: payload });
    expect(response.status()).toBe(200);
    logStep(
      withIcon(
        "PASS",
        `CatchHook is executed successfully: ${JSON.stringify(payload)}`
      )
    );
    return response;
  }

  // ----- Refresh UI -----
  async refreshData() {
    logStep(step.click('Click "Refresh" button to fetch data'));
    await this.refreshBtn.click();
    logStep(withIcon("PASS", "Clicked Refresh button"));
  }

  // ----- Verify Payload Visible -----
  async verifyPayloadVisible(payloadValue: string) {
    logStep(
      step.verify(`Verify payload value "${payloadValue}" is visible in UI`)
    );
    await expect(this.page.getByText(payloadValue)).toBeVisible({
      timeout: 10000,
    });
    logStep(withIcon("PASS", `Payload value "${payloadValue}" is visible`));
  }
}
