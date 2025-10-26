import { expect, Locator, Page, APIRequestContext } from "@playwright/test";

import { logStep } from "../utils/logger";
import { step, withIcon } from "../utils/step-icons";
import { TIMEOUT } from "dns";

export class EventLogPage {
  readonly page: Page;

  // ----- Buttons -----
  private readonly backArrowBtn: Locator;
  private readonly filtersBtn: Locator;
  private readonly clearFiltersBtn: Locator;
  private readonly applyFiltersBtn: Locator;

  // ----- Dynamic Options -----
  private readonly fieldsDropdown: (fieldName: string) => Locator;
  private readonly optionCheckbox: (optionName: string) => Locator;
  private readonly eventlogLink: (evenlogName: string) => Locator;

  // ----- Links -----
  private readonly eventlogNavLink: Locator;

  //  ----- Event Log Fields -----
  private readonly nameField: (name: string) => Locator;

  private readonly table: Locator;
  private readonly rows: Locator;
  private readonly loader: Locator;

  constructor(page: Page) {
    this.page = page;

    // ----- Buttons -----
    this.backArrowBtn = this.page.locator("div.flex.items-center.gap-2 button");
    this.filtersBtn = page.getByRole("button", { name: "Filters" });
    this.clearFiltersBtn = page.getByRole("button", { name: "Clear Filters" });
    this.applyFiltersBtn = page.getByRole("button", { name: "Apply Filters" });

    // Dynamic option checkboxes
    this.eventlogLink = (evenlogName: string) =>
      this.page.getByRole("cell", { name: evenlogName, exact: true }).first();

    this.fieldsDropdown = (fieldName: string) =>
      page.getByRole("combobox", { name: fieldName, exact: true });

    this.optionCheckbox = (optionName: string) =>
      page.getByRole("option", { name: optionName }).getByRole("checkbox");

    // ----- Links -----
    this.eventlogNavLink = page.getByRole("link", { name: "Event Logs" });
    // this.eventlogLink = page.getByRole('cell', { name: 'codeblock-flow-test' })

    //  ----- Event Log Fields -----
    this.nameField = (name: string) => this.page.getByText(name);

    this.table = this.page.locator("table.table_table__MJltV");
    this.rows = this.table.locator("tbody tr");
    this.loader = this.page.locator(".loading-indicator");
  }

  // Public getter
  getRows() {
    return this.rows;
  }

  // ----- High-level navigation -----
  async checkEventlogPage() {

    logStep(step.wait('Wait for "Eventlogs" page to load'));
    await expect(
      this.page.getByRole("heading", { name: "Event Logs" })
    ).toBeVisible({ timeout: 15000 });
    logStep(withIcon("PASS", "Eventlogs page loaded"));
  }

  async checkLogsAccessbility(eventlogName: string, name: string) {
    logStep(step.assert("Check old log is exist"));
    await expect(this.eventlogLink(eventlogName)).toBeVisible({
      timeout: 15000,
    });
    logStep(
      withIcon("PASS", `${eventlogName} konnector's eventlog is existing`)
    );

    logStep(step.open(`Open the ${eventlogName} eventlog`));
    await this.eventlogLink(eventlogName).click();
    logStep(step.pass(`Clicked the ${eventlogName} eventlog`));

    logStep(step.assert(`Check the payload`));
    await expect(this.nameField(name)).toBeVisible({ timeout: 15000 });
    logStep(
      step.assert(`Name: ${name} is visible in the eventlog summary page`)
    );
  }

  async applyFilters(
    konName: string,
    customer: string,
    status: string,
    evenlogName: string
  ) {
    // Apply Konnector Name Filter
    logStep(step.click('Click "Filters" button'));
    await this.filtersBtn.click();
    logStep(withIcon("PASS", '"Filters" button clicked'));

    logStep(step.click('Open "Konnector name" dropdown'));
    await this.fieldsDropdown("Konnector name").click();
    logStep(withIcon("PASS", '"Konnector name" dropdown opened'));

    logStep(step.check(`Select "${konName}" option`));
    await this.optionCheckbox(konName).check();
    logStep(withIcon("PASS", `Selected "${konName}" option`));
    await this.page.keyboard.press("Escape");

    logStep(step.click('Open "Customer name" dropdown'));
    await this.fieldsDropdown("Customer name").click();
    logStep(withIcon("PASS", '"Customer name" dropdown opened'));

    logStep(step.check(`Select "${customer}" option`));
    await this.optionCheckbox(customer).check();
    logStep(withIcon("PASS", `Selected "${customer}" option`));

    await this.page.keyboard.press("Escape");

    logStep(step.click('Open "Status" dropdown'));
    await this.fieldsDropdown("Status").click();
    logStep(withIcon("PASS", '"Status" dropdown opened'));

    logStep(step.check(`Select "${status}" option`));
    await this.optionCheckbox(status).check();
    // await this.fieldsDropdown(status).click();
    logStep(withIcon("PASS", `Selected "${status}" option`));
    await this.page.keyboard.press("Escape");

    logStep(step.click('Click "Apply Filters" button'));
    await this.applyFiltersBtn.click();
    logStep(withIcon("PASS", '"Apply Filters" button clicked'));
    await this.page.waitForTimeout(1000);

    logStep(step.assert("Check Eventlog list is filtered"));
    await expect(this.eventlogLink(evenlogName)).toBeHidden({
      timeout: 15000,
    });
    logStep(withIcon("PASS", "Eventlog list is filtered"));
  }

  async resetFilter(evenlogName: string) {
    logStep(step.click('Click "Filters" button'));
    await this.filtersBtn.click();
    logStep(withIcon("PASS", '"Filters" button clicked'));

    logStep(step.click('Click "Clear Filters" button'));
    await this.clearFiltersBtn.click();
    logStep(withIcon("PASS", '"Clear Filters" button clicked'));

    logStep(step.assert("Check Filter is reset to Default"));
    await expect(this.eventlogLink(evenlogName)).toBeVisible({
      timeout: 15000,
    });
    logStep(withIcon("PASS", "Filter is reset to Default"));
  }

  async verifyAllPagination() {
    const logRows = this.page.locator('[data-testid="event-log-row"]');
    const loader = this.page.locator('[data-testid="loading-indicator"]');

    let prevCount = await logRows.count();
    logStep(step.info(`Initial logs loaded: ${prevCount}`));

    while (true) {
      // Scroll to bottom
      logStep(step.scroll("Scroll to bottom to trigger pagination"));
      await this.page.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight)
      );

      // Wait for loader
      try {
        await expect(loader).toBeVisible({ timeout: 3000 });
        await expect(loader).toBeHidden({ timeout: 10000 });
        logStep(withIcon("PASS", "Loading indicator appeared and disappeared"));
      } catch {
        logStep(step.info("No loading indicator — probably last page reached"));
      }

      // Get new count
      const newCount = await logRows.count();

      if (newCount > prevCount) {
        logStep(
          withIcon("PASS", `Logs increased from ${prevCount} → ${newCount}`)
        );
        prevCount = newCount;
      } else {
        logStep(step.end(`Reached end of logs at ${prevCount} entries`));
        break;
      }
    }

    // Final assertion: ensure at least one pagination happened
    expect(prevCount).toBeGreaterThan(25);
  }

  // ---- Scroll + wait for pagination ----
  async scrollAndLoadMore(expectedTotal: number) {
    logStep(step.scroll(`Scroll to load until row count = ${expectedTotal}`));

    const initialCount = await this.getRows().count();
    logStep(step.info(`Initial row count = ${initialCount}`));

    await this.getRows().last().scrollIntoViewIfNeeded();

    logStep(step.wait("Wait for loader to appear/disappear"));
    await this.loader
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(() => {});
    await this.loader
      .waitFor({ state: "hidden", timeout: 10000 })
      .catch(() => {});
    logStep(step.pass("Loader finished, new rows should be available"));

    await expect(this.getRows()).toHaveCount(expectedTotal, { timeout: 10000 });
    logStep(step.pass(`Row count verified = ${expectedTotal}`));
  }
}
