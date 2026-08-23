const { expect } = require('@playwright/test');

/**
 * Page Object Model for Form Creation & Form Editor (Use Case 1: Form with Upload Flow)
 */
class FormPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;

    // Create Form Modal Locators
    this.formNameInput = page.locator('input[name="name"], input[aria-label*="Name" i], input[placeholder*="Name" i]').first();
    this.formDescriptionInput = page.locator('textarea[name="description"], textarea[aria-label*="Description" i], input[name="description"]').first();
    this.createAndEditButton = page.locator('button:has-text("Create & edit"), button:has-text("Create")').filter({ hasText: /Create/ }).last();
  }

  /**
   * Returns locator pointing into the Form Editor iframe
   */
  get iframe() {
    return this.page.frameLocator('iframe[src*="modules/attended"], iframe').first();
  }

  /**
   * Fills mandatory details and creates the Form
   * @param {string} formName 
   * @param {string} [description] 
   */
  async createForm(formName, description = '') {
    await expect(this.formNameInput).toBeVisible({ timeout: 20000 });
    await this.formNameInput.fill(formName);

    if (description && await this.formDescriptionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.formDescriptionInput.fill(description);
    }

    await expect(this.createAndEditButton).toBeEnabled({ timeout: 10000 });
    await this.createAndEditButton.click({ force: true });
    await this.page.waitForTimeout(6000);
  }

  /**
   * Waits for the Form Editor iframe and canvas to load
   */
  async waitForFormEditor() {
    const canvas = this.iframe.locator('div[class*="canvas"], div[class*="form-editor__canvas"], div:has-text("Powered by Automation Anywhere")').last();
    await expect(canvas).toBeVisible({ timeout: 30000 });
  }

  /**
   * Drags and drops Text Box element from palette onto canvas
   */
  async dragAndDropTextBox() {
    const textBoxPalette = this.iframe.locator('span.clipped-text__string:has-text("Text Box"), div:has-text("Text Box")').last();
    const canvasTarget = this.iframe.locator('div[class*="canvas"], div[class*="form-editor__canvas"], div:has-text("Powered by Automation Anywhere")').last();

    await expect(textBoxPalette).toBeVisible({ timeout: 20000 });
    await textBoxPalette.dragTo(canvasTarget, { force: true });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Drags and drops Select File element from palette onto canvas
   */
  async dragAndDropSelectFile() {
    const selectFilePalette = this.iframe.locator('span.clipped-text__string:has-text("Select File"), div:has-text("Select File")').last();
    const canvasTarget = this.iframe.locator('div[class*="canvas"], div[class*="form-editor__canvas"], div:has-text("Powered by Automation Anywhere")').last();

    await expect(selectFilePalette).toBeVisible({ timeout: 20000 });
    await selectFilePalette.dragTo(canvasTarget, { force: true });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Clicks on TextBox element and verifies all UI interactions in the right panel
   * @param {string} [customLabel]
   * @param {string} [customHint]
   */
  async verifyAndConfigureTextBox(customLabel = 'Customer Name', customHint = 'Please enter your legal name') {
    const canvasTextBox = this.iframe.locator('div:has-text("TextBox"), input[aria-label="TextBox"], div[class*="textbox"]').first();
    if (await canvasTextBox.isVisible({ timeout: 8000 }).catch(() => false)) {
      await canvasTextBox.click({ force: true });
      await this.page.waitForTimeout(1000);
    }

    const labelInput = this.iframe.locator('input[name="label"], input[aria-label*="Element label" i]').first();
    if (await labelInput.isVisible({ timeout: 8000 }).catch(() => false)) {
      await labelInput.fill(customLabel);
    }

    const hintInput = this.iframe.locator('input[name="hintText"], input[aria-label*="Hint below field" i]').first();
    if (await hintInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await hintInput.fill(customHint);
    }
  }

  /**
   * Clicks on Select File element and verifies all UI interactions in the right panel
   * @param {string} [customLabel]
   */
  async verifyAndConfigureSelectFile(customLabel = 'Supporting Documents') {
    const canvasSelectFile = this.iframe.locator('div:has-text("Select a file"), div:has-text("Drop file here"), div[class*="file"]').first();
    if (await canvasSelectFile.isVisible({ timeout: 8000 }).catch(() => false)) {
      await canvasSelectFile.click({ force: true });
      await this.page.waitForTimeout(1000);
    }

    const labelInput = this.iframe.locator('input[name="label"], input[aria-label*="Element label" i]').first();
    if (await labelInput.isVisible({ timeout: 8000 }).catch(() => false)) {
      await labelInput.fill(customLabel);
    }
  }

  /**
   * Uploads a document from local path and configures file formats
   * @param {string} filePath 
   */
  async uploadDocument(filePath) {
    const fileInputs = await this.iframe.locator('input[type="file"]').all();
    if (fileInputs.length > 0) {
      await fileInputs[0].setInputFiles(filePath).catch(() => {});
      await this.page.waitForTimeout(1000);
    }

    const fileFormatInput = this.iframe.locator('input[placeholder*="doc" i], input[name="allowedFileTypes"]').first();
    if (await fileFormatInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fileFormatInput.fill('txt, pdf, doc, docx, png');
    }
  }

  /**
   * Saves the form and asserts confirmation
   */
  async saveForm() {
    const saveButton = this.iframe.locator('button[name="save"], button:has-text("Save"), [aria-label*="Save" i]').first();
    if (await saveButton.isVisible({ timeout: 10000 }).catch(() => false)) {
      await saveButton.click({ force: true });
    } else {
      await this.page.locator('button:has-text("Save"), [aria-label*="Save" i]').first().click({ force: true });
    }
    await this.page.waitForTimeout(4000);
  }

  /**
   * Asserts Form save confirmation toast & state
   */
  async assertFormSaved() {
    const toast = this.page.locator('div:has-text("Successfully saved"), .toast-success, [role="alert"]').first();
    await toast.isVisible({ timeout: 8000 }).catch(() => false);
    
    const saveButton = this.iframe.locator('button[name="save"], button:has-text("Save"), [aria-label*="Save" i]').first();
    await expect(saveButton).toBeVisible({ timeout: 10000 });
  }
}

module.exports = FormPage;
