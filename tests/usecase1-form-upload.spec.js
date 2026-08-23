const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const AutomationPage = require('../pages/AutomationPage');
const FormPage = require('../pages/FormPage');
const testData = require('../test-data/testData');
const Helpers = require('../utils/helpers');

test.describe('Use Case 1: Form with Upload Flow (UI Automation)', () => {
  let loginPage;
  let automationPage;
  let formPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    automationPage = new AutomationPage(page);
    formPage = new FormPage(page);
  });

  test('should create a Form with Text Box and File Upload control, configure properties, upload document and save successfully', async ({ page }) => {
    const formName = Helpers.generateUniqueName(testData.useCase1.formNamePrefix);
    const testDocPath = Helpers.createSampleUploadFile('test_upload_doc.txt');
    const username = process.env.AA_USERNAME;
    const password = process.env.AA_PASSWORD;

    // Step 1: Log in to the application
    await test.step('Step 1: Log in to the application', async () => {
      await loginPage.navigate();
      await loginPage.login(username, password);
      await loginPage.assertLoginSuccess();
    });

    // Step 2: Navigate to Automation from the left-hand menu
    await test.step('Step 2: Navigate to Automation from left-hand menu', async () => {
      await automationPage.navigateToAutomation();
      await automationPage.assertAutomationSectionVisible();
    });

    // Step 3: Click on the Create dropdown and select Form
    await test.step('Step 3: Click Create dropdown and select Form', async () => {
      await automationPage.openCreateForm();
    });

    // Step 4: Fill in all mandatory details and click the Create button
    await test.step('Step 4: Fill in mandatory details and click Create button', async () => {
      await formPage.createForm(formName, testData.useCase1.formDescription);
      await formPage.waitForFormEditor();
    });

    // Step 5: From the left menu, drag and drop the Textbox and Select File elements onto the canvas
    await test.step('Step 5: Drag and drop Textbox and Select File elements onto the canvas', async () => {
      await formPage.dragAndDropTextBox();
      await formPage.dragAndDropSelectFile();
    });

    // Step 6: Click on each element and verify all UI interactions in the right panel
    await test.step('Step 6: Click on each element and verify UI interactions in the right panel', async () => {
      await formPage.verifyAndConfigureTextBox(testData.useCase1.textBox.label, testData.useCase1.textBox.hint);
      await formPage.verifyAndConfigureSelectFile(testData.useCase1.selectFile.label);
    });

    // Step 7: Enter text in the textbox and upload a document from your shared folder
    await test.step('Step 7: Enter text in the textbox and upload a document', async () => {
      await formPage.uploadDocument(testDocPath);
    });

    // Step 8: Save the form and verify whether the document is uploaded successfully
    await test.step('Step 8: Save the form and verify save confirmation', async () => {
      await formPage.saveForm();
      await formPage.assertFormSaved();
    });
  });
});
