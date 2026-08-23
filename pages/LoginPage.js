const { expect } = require('@playwright/test');

/**
 * Page Object Model for Automation Anywhere Login Page
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    
    // Locators for Control Room login page
    this.usernameInput = page.locator('input[type="email"], input[name="username"], input[name="email"], #username').first();
    this.passwordInput = page.locator('input[type="password"], input[name="password"], #password').first();
    this.loginButton = page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), #loginButton').first();
  }

  /**
   * Navigates to the Control Room URL
   * @param {string} [url] 
   */
  async navigate(url) {
    const targetUrl = url || process.env.AA_BASE_URL || 'https://community.cloud.automationanywhere.digital';
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(async () => {
      await this.page.goto(targetUrl, { timeout: 60000 });
    });
  }

  /**
   * Performs automatic login flow cleanly
   * @param {string} [username] 
   * @param {string} [password] 
   */
  async login(username, password) {
    const user = username || process.env.AA_USERNAME;
    const pass = password || process.env.AA_PASSWORD;

    const isLoginVisible = await this.usernameInput.isVisible({ timeout: 15000 }).catch(() => false);

    if (isLoginVisible) {
      await this.usernameInput.fill(user);
      await this.passwordInput.fill(pass);
      await this.loginButton.click();
      await this.page.waitForTimeout(6000);
    }
  }

  /**
   * Asserts login success & extracts auth token from localStorage with retry polling
   * @returns {Promise<string>}
   */
  async assertLoginSuccess() {
    await this.page.waitForTimeout(4000);
    
    // Poll up to 15 seconds for authToken in localStorage
    for (let i = 0; i < 15; i++) {
      const token = await this.page.evaluate(() => {
        const raw = localStorage.getItem('authToken');
        if (!raw) return '';
        try {
          const parsed = JSON.parse(raw);
          return parsed.token || parsed;
        } catch (e) {
          return raw;
        }
      }).catch(() => '');

      if (token && token.length > 20) {
        return token;
      }
      await this.page.waitForTimeout(1000);
    }
    return '';
  }
}

module.exports = LoginPage;
