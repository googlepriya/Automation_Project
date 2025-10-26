import { expect, FrameLocator, Locator, Page } from "@playwright/test";
import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";
import { log } from "console";

export class KompBillingPage {
  readonly page: Page;

  // -───────────────────────── Buttons ─────────────────────────
  private readonly submitBtn: Locator;
  private readonly subscripeBtn: Locator;
  private readonly confirmPaymentButton: Locator;
  private readonly selectPlanBtn: Locator;
  private readonly enterprisePlanSelectBtn: Locator;
  private readonly upgradePlanBtn: Locator;
  readonly frame: FrameLocator;

  constructor(page: Page) {
    this.page = page;

    // ───────────────────────── Buttons ─────────────────────────

    this.subscripeBtn = page.getByRole("button", { name: "Subscribe Now" });

    this.confirmPaymentButton = page.getByRole("button", {
      name: "Confirm Payment",
    });

    this.submitBtn = page.getByRole("button", { name: "Submit" });

    this.selectPlanBtn = page.getByRole("button", { name: "Select Plan" });

    this.enterprisePlanSelectBtn = page.getByRole("button", {
      name: "Contact Sales",
    });

    this.upgradePlanBtn = page.getByRole("button", {
      name: "Upgrade to Enterprise",
    });
  }

  async subscribeToPlan(planName: string) {
    logStep(step.select("Begin subscription flow"));
    await this.selectPlanAndConfirm(planName);
    logStep(step.end("Subscription flow completed successfully"));
  }

  async manageSubscription() {
    logStep(step.assert("Verifying Task Count and Plan Cycle in UI"));
    await this.checkTaskCountInUI();
    logStep(step.assert("Verifying Plan Cycle in UI"));
    await this.checkPlanCycleInUI();
    logStep(step.select("Upgrade a plan"));
    await this.upgradePlan();
    logStep(step.end("Manage Subscription flow completed successfully"));
  }

  async upgradePlan() {
    logStep(step.start("Upgrade Plan Flow"));
    await this.upgradePlanBtn.click();
    logStep(withIcon("PASS", '"Upgrade Plan" button clicked'));
    await expect(
      this.page.getByRole("heading", { name: "Enterprise Plan - Upgrade" })
    ).toBeVisible({ timeout: 10000 });
    logStep(withIcon("PASS", '"Subscribe to Plan" page is visible'));
    logStep(step.click('Click "Submit" button'));
    await this.submitBtn.isEnabled();
    await this.submitBtn.click();
    logStep(withIcon("PASS", 'Contacted to Sales team for "Enterprise" plan'));
  }

  async selectPlanAndConfirm(planName: string) {
    logStep(
      step.start(
        "Subscribe to a Plan: Step 1: Cancel Trial & Select Plan and Confirm"
      )
    );
    if (planName != "Enterprise") {
      logStep(step.click('Click "Select Plan" button'));
      await this.selectPlanBtn.click();
      logStep(
        withIcon("PASS", '"Select plan" button for clicked to buy startup plan')
      );
      logStep(step.start(`Select ${planName} Plan and Confirm`));
      await expect(
        this.page.getByRole("heading", { name: "Subscribe to Startup" })
      ).toBeVisible({ timeout: 10000 });
      logStep(withIcon("PASS", '"Subscribe to Plan" page is visible'));
      await this.fillBillingDetails();
      await this.fillCardDetails();
      await this.page.waitForTimeout(2000);
      logStep(step.click('Click "Subscribe Now" button'));
      //   await this.subscripeBtn.click();
      logStep(withIcon("PASS", '"Subscribe Now" button clicked'));
      logStep(step.wait("Wait for subscription confirmation"));
      await this.page.waitForTimeout(3000);
      //   await expect( this.page.getByRole("button", { name: "Upgrade to Enterprise" }) ).toBeVisible({ timeout: 10000 });
      logStep(withIcon("PASS", `"${planName}" plan subscribed successfully`));
    } else {
      logStep(step.click('Click "Select Plan" button'));
      await this.enterprisePlanSelectBtn.click();
      logStep(
        withIcon(
          "PASS",
          '"Select plan" button for clicked to buy enterprise plan'
        )
      );
      await expect(
        this.page.getByRole("heading", { name: "Enterprise Plan - Upgrade" })
      ).toBeVisible({ timeout: 10000 });
      logStep(withIcon("PASS", '"Subscribe to Plan" page is visible'));
      logStep(step.click('Click "Submit" button'));
      await this.submitBtn.isEnabled();
      //    await this.submitBtn.click();
      logStep(
        withIcon("PASS", 'Contacted to Sales team for "Enterprise" plan')
      );
    }
  }

  async fillBillingDetails() {
    logStep(
      step.start(
        "Subscribe to a Plan: Step 2: Fill card details in Stripe iframe"
      )
    );
    const stripeFrame = this.page.frameLocator(
      "(//div[@class='__PrivateStripeElement'])[1]//iframe[1]"
    );

    await stripeFrame.locator("#Field-nameInput").fill("Gokul Priya");

    logStep(step.click('Click "Subscribe Now" button'));
    await this.subscripeBtn.click();
    logStep(withIcon("PASS", '"Subscribe Now" button clicked'));

    await stripeFrame
      .getByRole("combobox", { name: "Address line" })
      .fill("12");
    logStep(withIcon("PASS", 'Filled "Address line" successfully'));

    await stripeFrame.getByRole("textbox", { name: "City" }).fill("Erode");
    logStep(withIcon("PASS", 'Filled "City" successfully'));
    //  await this.page.waitForTimeout(3000);
    logStep(step.wait("Wait for 3 seconds"));
    logStep(step.click('Scroll to "Card details" iframe'));

    /*
    const input = this.page.locator(
      "(//div[@class='__PrivateStripeElement'])[1]//iframe[1]"
    );

    await input.click(); // focus first

    // Move caret to the end of the text
    await input.press("End");

    // Or move it line by line down:
    await input.press("ArrowDown");

    await input.waitFor({ state: 'attached', timeout: 10000 });
    await input.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(2000);
    logStep(step.wait("Wait for 2 seconds"));

    logStep(step.info("Checking PIN code field visibility"));
    
  //  await stripeFrame.getByLabel("State").isVisible({ timeout: 15000 });

   // await expect(stripeFrame.getByRole("textbox", { name: "State" })).toHaveValue("Select");

    await stripeFrame
      .getByRole("textbox", { name: "PIN" })
      .isVisible({ timeout: 15000 });
    logStep(withIcon("PASS", "PIN code field is visible"));
    await stripeFrame
    .getByRole("textbox", { name: "PIN" }).focus();

    logStep(step.info("Filling PIN code after focus"));
    await stripeFrame.getByRole("textbox", { name: "PIN" }).fill("638051");
    logStep(withIcon("PASS", 'Filled "PIN" successfully'));
*/

    // Step 1: Get the live iframe locator (always fresh before interacting)
    const iframeLocator = this.page.locator(
      "(//div[@class='__PrivateStripeElement'])[1]//iframe[1]"
    );

    // Wait until it’s fully attached and ready
    await iframeLocator.waitFor({ state: "attached", timeout: 15000 });

    // Step 2: Switch into the frame context
    const frame = await iframeLocator.contentFrame();
    if (!frame) throw new Error("Stripe iframe not ready");

    // Step 3: Wait for input (e.g., PIN) to be ready
    const pinInput = frame.getByRole("textbox", { name: "PIN" });
    await pinInput.waitFor({ state: "visible", timeout: 10000 });

    // Step 4: Scroll and focus
    await pinInput.scrollIntoViewIfNeeded();
    await pinInput.focus();

    // Step 5: Type slowly (avoid fill for Stripe)
    await pinInput.fill("638051");

    await stripeFrame.getByLabel("State").isVisible({ timeout: 15000 });
    logStep(step.info("Filling State after wait"));
    await stripeFrame.getByLabel("State").selectOption("Tamil Nadu");
    logStep(withIcon("PASS", 'Selected "State" successfully'));
    await this.page.waitForTimeout(8000);

    logStep(withIcon("PASS", "Filled billing address details successfully"));
    logStep;
    //   await this.subscripeBtn.click();
    //   logStep(withIcon("PASS", '"Subscribe Now" button clicked'));
  }

  async fillCardDetails() {
    logStep(
      step.start(
        "Subscribe to a Plan: Step 3: Fill card details in Stripe iframe"
      )
    );
    logStep(step.click('Scroll to "Card details" iframe'));
    const input = this.page.locator(
      "(//div[@class='__PrivateStripeElement'])[2]//iframe[1]"
    );

    await input.click(); // focus first

    // Move caret to the end of the text
    await input.press("End");

    // Or move it line by line down:
    await input.press("ArrowDown");

    const cardFrame = this.page.frameLocator(
      "(//div[@class='__PrivateStripeElement'])[2]//iframe[1]"
    );

    await this.page.waitForTimeout(2000);

    await cardFrame.locator("#Field-numberInput").fill("4242 4242 4242 4242");
    logStep(withIcon("PASS", "Card number entered successfully"));
    await cardFrame
      .getByRole("textbox", { name: "Expiration date MM / YY" })
      .fill("04 / 28");
    logStep(withIcon("PASS", "Card expiration date entered successfully"));
    await cardFrame.getByRole("textbox", { name: "Security code" }).fill("424");
    logStep(withIcon("PASS", "Card CVC entered successfully"));

    logStep(withIcon("PASS", "Card details entered successfully"));
  }

  async checkTaskCountInUI() {
    logStep(step.start("Verifying Task Count in UI"));
    await this.page.waitForTimeout(5000);
    // await expect(taskCountLocator).toHaveText(`Cycle Allowance${expectedTaskCount}`, {
    await expect(this.page.getByText(`Cycle Allowance3000000`)).toBeVisible({
      timeout: 10000,
    });

    logStep(withIcon("PASS", `Task count in UI matches expected: 3000000`));
  }

  async checkPlanCycleInUI() {
    logStep(step.start("Verifying Plan Cycle in UI"));
    await expect(this.page.getByText(`Plan CycleYearly`)).toBeVisible({
      timeout: 10000,
    });
    logStep(withIcon("PASS", `Plan cycle in UI matches expected: Yearly`));
  }
}
