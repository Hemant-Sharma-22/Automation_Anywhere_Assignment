const { defineConfig } = require('@playwright/test');
const fs = require('fs');
require('dotenv').config();

const hasStorageState = fs.existsSync('auth.json');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120000,
  workers: 1,
  expect: {
    timeout: 15000
  },
  use: {
    browserName: 'chromium',
    channel: 'chrome',
    headless: false,
    slowMo: 1000, // 1 second delay per action for visual step-by-step presentation on screen
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    storageState: hasStorageState ? 'auth.json' : undefined,
    actionTimeout: 25000,
    navigationTimeout: 60000,
  },
  reporter: [['html', { open: 'never' }], ['list']]
});
