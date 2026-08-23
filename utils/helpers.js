const fs = require('fs');
const path = require('path');

/**
 * Helper utilities for generating unique test names and test assets
 */
class Helpers {
  /**
   * Generates a unique string appended with a timestamp for test execution isolation.
   * @param {string} prefix 
   * @returns {string}
   */
  static generateUniqueName(prefix = 'Test_') {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${timestamp}_${random}`;
  }

  /**
   * Ensures a sample test file exists on disk for file upload testing.
   * @param {string} [filename]
   * @returns {string} Absolute path to the created file
   */
  static createSampleUploadFile(filename = 'sample_document.txt') {
    const dir = path.join(__dirname, '..', 'test-data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, `Automation Anywhere Community Edition - Test Document Upload\nCreated: ${new Date().toISOString()}\nContent: Verified document upload flow for Use Case 1.`);
    return filePath;
  }
}

module.exports = Helpers;
