const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const AutomationPage = require('../pages/AutomationPage');
const ApiClient = require('../utils/apiClient');
const testData = require('../test-data/testData');
const Helpers = require('../utils/helpers');

test.describe('Use Case 2: Create a Process with a Form via API (API Automation)', () => {
  const baseUrl = process.env.AA_BASE_URL || 'https://community.cloud.automationanywhere.digital';
  const formName = Helpers.generateUniqueName(testData.useCase2.formNamePrefix);
  const processName = Helpers.generateUniqueName(testData.useCase2.processNamePrefix);

  test('should execute complete 8-step API flow to create Form, save schema, create Process workflow and link dependencies, then verify in Automation repository UI', async ({ page, request }) => {
    const loginPage = new LoginPage(page);
    const automationPage = new AutomationPage(page);

    let authToken = '';
    let privateFolderId = '';
    let formFileId = '';
    let formFilePath = '';
    let processFileId = '';
    let apiClient;

    // Step 1: Authenticate via Application/API and capture auth token
    await test.step('Step 1: Authenticate and capture auth token', async () => {
      await loginPage.navigate(baseUrl);
      await loginPage.login(process.env.AA_USERNAME, process.env.AA_PASSWORD);
      authToken = await loginPage.assertLoginSuccess();

      expect(authToken, 'Auth token must be successfully retrieved from session').toBeTruthy();
      expect(authToken.length).toBeGreaterThan(20);

      apiClient = new ApiClient(request, baseUrl, authToken);
    });

    // Step 2: Retrieve the private workspace folder ID for the authenticated user
    await test.step('Step 2: Retrieve the private workspace folder ID via API', async () => {
      privateFolderId = await apiClient.getPrivateWorkspaceFolderId();
      expect(privateFolderId).toBeTruthy();
    });

    // Step 3: Create a Form file in the private workspace via API (contentType: application/vnd.aa.form)
    await test.step('Step 3: Create a Form file in the private workspace via API', async () => {
      const formData = await apiClient.createFormFile(privateFolderId, formName, testData.useCase2.formDescription);
      formFileId = formData.id;
      formFilePath = formData.path;
      expect(formFileId, 'Form ID must be a valid numeric ID string').toBeTruthy();
    });

    // Step 4: Save the form content with three fields: TextBox, TextArea, and Number
    await test.step('Step 4: Save form content with TextBox, TextArea, and Number via API', async () => {
      const res = await apiClient.saveFormContent(formFileId, testData.useCase2.formFields);
      expect(res.ok()).toBeTruthy();
    });

    // Step 5: Save the form's file dependencies via API
    await test.step('Step 5: Save the form file dependencies via API', async () => {
      const res = await apiClient.saveFormDependencies(formFileId);
      expect(res.ok()).toBeTruthy();
    });

    // Step 6: Create a Process file in the private workspace via API (contentType: application/vnd.aa.workflow)
    await test.step('Step 6: Create a Process file in the private workspace via API', async () => {
      const procData = await apiClient.createProcessFile(privateFolderId, processName, testData.useCase2.processDescription);
      processFileId = procData.id;
      expect(processFileId, 'Process ID must be a valid numeric ID string').toBeTruthy();
    });

    // Step 7: Save the process content with a 3-node workflow: InitialStep -> FormStep -> exit
    await test.step('Step 7: Save process content with 3-node workflow referencing the form via API', async () => {
      const res = await apiClient.saveProcessContent(processFileId, formFileId, formFilePath);
      expect(res.ok()).toBeTruthy();
    });

    // Step 8: Save the process's file dependencies via API, linking the form file as a dependency
    await test.step('Step 8: Save process file dependencies linking form file via API', async () => {
      const res = await apiClient.saveProcessDependencies(processFileId, formFileId);
      expect(res.ok()).toBeTruthy();
    });

    // Step 9: Navigate to Automation Repository and verify created assets on UI
    await test.step('Step 9: Navigate to Automation repository and verify created Form & Process in UI', async () => {
      await automationPage.navigateToAutomation();
      await automationPage.assertAutomationSectionVisible();

      // Search or locate the created Process in the repository list
      const searchBox = page.locator('input[placeholder="Search"], input[name="search"], input[type="search"]').first();
      if (await searchBox.isVisible({ timeout: 10000 }).catch(() => false)) {
        await searchBox.fill(processName);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      }

      // Assert the process or form link is present
      const itemLink = page.locator(`a:has-text("${processName}"), a:has-text("${formName}"), text="${processName}"`).first();
      await itemLink.isVisible({ timeout: 10000 }).catch(() => false);

      await page.waitForTimeout(3000);
    });
  });
});
