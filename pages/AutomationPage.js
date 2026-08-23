const { expect } = require('@playwright/test');

/**
 * Page Object Model for Automation Repository Section & Creation Menus
 */
class AutomationPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;

    // Left Sidebar Navigation items
    this.automationNav = page.locator('a[aria-label="Automation"], [title="Automation"], a[href*="automation"], a[href*="bots/repository"]').first();

    // Automation repository action buttons
    this.createDropdownButton = page.locator('button:has-text("Create")').filter({ hasNotText: /task bot|process|instance/i }).first();
    this.createFormOption = page.locator('.dropdown-option-label:has-text("Form"), button:has-text("Form"), [data-path="Dropdown.Option"]:has-text("Form")').first();
    this.createProcessOption = page.locator('.dropdown-option-label:has-text("Process"), button:has-text("Process"), [data-path="Dropdown.Option"]:has-text("Process")').first();
    this.createTaskBotOption = page.locator('.dropdown-option-label:has-text("Task Bot"), button:has-text("Task Bot"), [data-path="Dropdown.Option"]:has-text("Task Bot")').first();
  }

  /**
   * Navigates to Automation repository section via sidebar click or direct route
   */
  async navigateToAutomation() {
    const baseUrl = process.env.AA_BASE_URL || 'https://community.cloud.automationanywhere.digital';
    
    if (!this.page.url().includes('bots/repository')) {
      if (await this.automationNav.isVisible({ timeout: 10000 }).catch(() => false)) {
        await this.automationNav.click({ force: true });
      } else {
        await this.page.goto(`${baseUrl}/#/bots/repository`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      }
      
      await this.page.waitForURL(url => url.href.includes('bots/repository'), { timeout: 15000 }).catch(async () => {
        await this.page.goto(`${baseUrl}/#/bots/repository`, { waitUntil: 'domcontentloaded' });
      });
      await this.page.waitForTimeout(3000);
    }
  }

  /**
   * Asserts automation repository section is visible
   */
  async assertAutomationSectionVisible() {
    const createBtn = this.page.locator('button:has-text("Create")').filter({ hasNotText: /task bot|process|instance/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 25000 });
  }

  /**
   * Opens Create Form dialog
   */
  async openCreateForm() {
    const createBtn = this.page.locator('button:has-text("Create")').filter({ hasNotText: /task bot|process|instance/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 25000 });
    await createBtn.click({ force: true });
    await this.page.waitForTimeout(1000);

    const formOption = this.page.locator('.dropdown-option-label:has-text("Form"), button:has-text("Form"), [data-path*="Option"]:has-text("Form")').filter({ hasText: /^Form/ }).first();
    await expect(formOption).toBeVisible({ timeout: 15000 });
    await formOption.click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Opens Create Process dialog
   */
  async openCreateProcess() {
    const createBtn = this.page.locator('button:has-text("Create")').filter({ hasNotText: /task bot|process|instance/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 25000 });
    await createBtn.click({ force: true });
    await this.page.waitForTimeout(1000);

    const procOption = this.page.locator('.dropdown-option-label:has-text("Process"), button:has-text("Process"), [data-path*="Option"]:has-text("Process")').filter({ hasText: /^Process/ }).first();
    await expect(procOption).toBeVisible({ timeout: 15000 });
    await procOption.click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Opens Create Task Bot dialog
   */
  async openCreateTaskBot() {
    const createBtn = this.page.locator('button:has-text("Create")').filter({ hasNotText: /task bot|process|instance/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 25000 });
    await createBtn.click({ force: true });
    await this.page.waitForTimeout(1000);

    const taskBotOption = this.page.locator('.dropdown-option-label:has-text("Task Bot"), button:has-text("Task Bot"), [data-path*="Option"]:has-text("Task Bot")').filter({ hasText: /^Task Bot/ }).first();
    await expect(taskBotOption).toBeVisible({ timeout: 15000 });
    await taskBotOption.click({ force: true });
    await this.page.waitForTimeout(2000);
  }
}

module.exports = AutomationPage;
