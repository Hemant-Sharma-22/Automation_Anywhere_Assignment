# Automation Anywhere Community Edition — End-to-End Automation Framework

[![Playwright](https://img.shields.io/badge/Framework-Playwright_v1.62.1-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Design Pattern](https://img.shields.io/badge/Pattern-Page_Object_Model_(POM)-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://playwright.dev/docs/pom)
[![API Testing](https://img.shields.io/badge/API-REST_Control_Room_v2-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://docs.automationanywhere.com/)
[![Browser](https://img.shields.io/badge/Browser-Google_Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![Test Status](https://img.shields.io/badge/Tests-2%20Passed%20(100%25)-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white)]()

---

## 📌 **Executive Summary**

This repository contains an enterprise-grade automated testing solution for **Automation Anywhere Community Edition Control Room**, covering:
1. **Use Case 1 (UI Automation)**: End-to-end Form creation with drag-and-drop elements (**Text Box** and **Select File**), right-panel properties configuration, document upload, and save verification.
2. **Use Case 2 (API Automation + UI Verification)**: An 8-step REST API flow creating private workspace Forms (with `TextBox`, `TextArea`, `Number` schema), Process workflows, and dependency linkages, followed by live browser verification inside the Control Room Automation repository.

Both use cases are engineered using **Playwright (JavaScript)**, adhering strictly to the **Page Object Model (POM)** pattern, deterministic waits, schema validation, and test asset isolation.

---

## 📸 **Test Execution & Verification Report**

All test suites have been verified with a **100% pass rate** in headed mode against live Automation Anywhere Community Edition servers:

![Playwright Test Results](C:\Users\91724\OneDrive\Desktop\AutomationAnywhere-main\docs\images\img2.png)
![Playwright Test successfull](C:\Users\91724\OneDrive\Desktop\AutomationAnywhere-main\docs\images\img3.png)
![Playwright automation](C:\Users\91724\OneDrive\Desktop\AutomationAnywhere-main\docs\images\img1.png)

```text
Running 2 tests using 1 worker

  ✅ ok 1 tests/usecase1-form-upload.spec.js (Use Case 1: Form with Upload Flow UI Automation) [1.4m]
  ✅ ok 2 tests/usecase2-process-api.spec.js (Use Case 2: Create Process with Form via API + UI Verification) [54.3s]

  2 passed (100% Success Rate)
```

---

## 🧠 **Developer's Perspective & Technical Journey**

### 1. **Initial Assessment & Architectural Strategy**
When reading the assignment specifications, I structured the solution into two distinct layers:
- **UI Interaction Layer (POM)**: For complex Single-Page Application (SPA) interactions, iframe boundaries, canvas drag-and-drop operations, and reactive side-panel property validations.
- **REST API Client Layer**: For high-speed repository asset manipulation, schema definitions, workflow node declarations, and dependency management.

Rather than writing procedural, brittle scripts with hardcoded selectors, I designed a **modular, maintainable framework** separating page selectors, test datasets, API abstractions, and test execution specs.

---

### 2. **Engineering Challenges Faced & Problem-Solving Deep Dive**

#### ⚡ **Challenge 1: Form Editor Iframe Boundary & Canvas Drag-and-Drop**
- **Issue**: Automation Anywhere renders the Form Editor inside an isolated attended client iframe (`iframe[src*="modules/attended"]`). Standard page locators failed to interact with palette items or the central canvas. Furthermore, native browser drag-and-drop events often fail across cross-frame shadow DOM trees.
- **Solution**: 
  - Utilized Playwright's `page.frameLocator('iframe[src*="modules/attended"], iframe').first()` to securely scope all palette items, canvas containers, and property panels.
  - Implemented precise element drag targets (`span.clipped-text__string:has-text("Text Box")` and `div[class*="canvas"]`) using `.dragTo(canvasTarget, { force: true })` with synchronized event settling.

#### ⚡ **Challenge 2: Client-Side Public Key Authentication & Bearer Tokens**
- **Issue**: Standard REST endpoints like `POST /v1/authentication` return `404 Not Found` in Automation Anywhere Community Edition because login relies on a client-side public-key RSA handshake (`/v1/authentication/publicKeyExchange` ➔ `/v2/authentication`).
- **Solution**: 
  - Extracted the active JSON Web Token (JWT) directly from authenticated browser session storage (`localStorage.getItem('authToken')`).
  - Created a dedicated `ApiClient` wrapper that automatically passes the `X-Authorization` header and `Accept: application/json` across all subsequent REST API calls.

#### ⚡ **Challenge 3: Control Room REST API JSON Schema Constraints (`[^<>]*`)**
- **Issue**: When creating Process files via `POST /v2/repository/files`, the server returned `400 Bad Request` with `Validation failed for 'description'. Reason: must match pattern [^<>]*` when the description contained arrow characters (`->`).
- **Solution**: 
  - Sanitized all test data models in `testData.js` to adhere to Automation Anywhere's strict regex validation rules while preserving comprehensive semantic descriptions.

#### ⚡ **Challenge 4: Dynamic SPA Dropdown Menus & Unicode Ellipsis**
- **Issue**: The Control Room repository "Create" button renders options with Unicode ellipsis (`Form…` / `Task Bot…` using `\u2026`). In addition, the Home dashboard contains multiple create buttons which caused selector ambiguity.
- **Solution**: 
  - Scoped navigation in `AutomationPage.js` to ensure the route is settled at `#/bots/repository`.
  - Filtered create buttons using `.filter({ hasNotText: /task bot|process|instance/i })` and matched dropdown labels using robust regexes (`/^Form/`).

---

## 🏗️ **Repository Architecture**

```text
Automation_Anywhere/
├── docs/
│   └── images/
│       └── test-results-report.png     # Test run verification screenshot
├── pages/                              # Page Object Model (POM) Layer
│   ├── LoginPage.js                    # Auth, credentials injection & token polling
│   ├── AutomationPage.js               # Navigation & Create dropdown management
│   └── FormPage.js                     # Form Editor, iframe drag & drop, properties & upload
├── test-data/                          # Test Data & Mock Assets
│   ├── testData.js                     # Centralized datasets, form schemas & workflow JSON
│   └── sample_document.txt             # Verified test document for upload assertions
├── tests/                              # Test Execution Specs
│   ├── usecase1-form-upload.spec.js    # Use Case 1: UI Automation
│   └── usecase2-process-api.spec.js    # Use Case 2: API Automation + UI Verification
├── utils/                              # Reusable Utilities & Helpers
│   ├── apiClient.js                    # Control Room v2 REST API Client Wrapper
│   └── helpers.js                      # Timestamped name generator & file utilities
├── .env.example                        # Template for required environment variables
├── .env                                # Protected local credentials
├── .gitignore                          # Excludes secrets, traces, videos, node_modules
├── package.json                        # Scripts & dependencies
├── playwright.config.js                # Playwright execution, timeouts & reporter config
└── README.md                           # Comprehensive documentation & report
```

---

## 📋 **Detailed Use Case Specifications**

### 🎨 **Use Case 1: Form with Upload Flow (UI Automation)**
| Step | Action | Assertion / Verification |
| :--- | :--- | :--- |
| **Step 1** | Log in to Automation Anywhere Control Room | Assert successful login and authenticated session state |
| **Step 2** | Navigate to Automation from left sidebar | Assert Automation repository toolbar and table are visible |
| **Step 3** | Open Create dropdown and select **Form…** | Assert Create Form modal is rendered |
| **Step 4** | Fill Form Name & Description, click **Create & edit** | Assert transition into Form Editor iframe (`modules/attended`) |
| **Step 5** | Drag & drop **Text Box** and **Select File** onto canvas | Assert both controls are rendered on the canvas container |
| **Step 6** | Select elements and verify right configuration panel | Update Element Labels (`Employee Full Name`, `Supporting Identity Document`), hint text, and file formats |
| **Step 7** | Enter text and upload sample document | Attach `test-data/sample_document.txt` and configure allowed formats |
| **Step 8** | Click **Save** in Form Editor | Assert backend response and `"Successfully saved"` confirmation toast |

---

### ⚡ **Use Case 2: Create a Process with a Form via API (API Automation)**
| Step | REST API Endpoint / Action | Method | Assertion / Expected Status |
| :--- | :--- | :---: | :--- |
| **Step 1** | Session Authentication Token Capture | `Storage` | Token exists and `token.length > 20` |
| **Step 2** | `GET /v2/repository/workspace/defaults` | `GET` | **`200 OK`** — Capture valid `privateFolderId` |
| **Step 3** | `POST /v2/repository/files` (`contentType: application/vnd.aa.form`) | `POST` | **`201 Created`** — Valid Form `id` generated |
| **Step 4** | `PUT /v2/repository/files/{formId}/content?hasErrors=false` | `PUT` | **`200 OK`** — Schema saved (`TextBox`, `TextArea`, `Number`) |
| **Step 5** | `PUT /v2/repository/files/{formId}/dependencies` | `PUT` | **`200 OK`** — Child dependencies registered |
| **Step 6** | `POST /v2/repository/files` (`contentType: application/vnd.aa.workflow`) | `POST` | **`201 Created`** — Valid Process `id` generated |
| **Step 7** | `PUT /v2/repository/files/{procId}/content?hasErrors=false` | `PUT` | **`200 OK`** — 3-node workflow (`InitialStep` ➔ `FormStep` ➔ `exit`) |
| **Step 8** | `PUT /v2/repository/files/{procId}/dependencies` | `PUT` | **`200 OK`** — Form file linked as dependency |
| **Step 9** | **Live UI Verification**: Navigate to Automation repository | `Browser` | Search & highlight created Process and Form in repository table |

---

## 💻 **Prerequisites & Installation**

### 1. **System Requirements**
- **Node.js**: `v16.0.0` or higher (recommended: `v18.x` / `v20.x`)
- **NPM**: `v8.x` or higher
- **Google Chrome**: Installed locally on your operating system

### 2. **Installation**
Clone the repository and install all required dependencies:
```bash
# Navigate to the project directory
cd Automation_Anywhere_Assignment-main/Automation_Anywhere_Assignment-main

# Install dependencies
npm install
```

### 3. **Environment Configuration**
Create a `.env` file in the root directory (refer to `.env.example`):
```env
AA_USERNAME=aviralmishra131005@gmail.com
AA_PASSWORD=your_password_here
AA_BASE_URL=https://community.cloud.automationanywhere.digital
```

---

## 🚀 **Test Execution Commands**

### **1. Run Full Test Suite (Both Use Cases Together)**
```bash
npm test
```
*Direct Playwright command:*
```bash
npx playwright test
```

---

### **2. Run Use Case 1 (UI Automation in Headed Chrome)**
```bash
npm run test:usecase1
```
*Direct Playwright command:*
```bash
npx playwright test tests/usecase1-form-upload.spec.js --headed
```

---

### **3. Run Use Case 2 (API Automation + Live UI Verification in Headed Chrome)**
```bash
npm run test:usecase2
```
*Direct Playwright command:*
```bash
npx playwright test tests/usecase2-process-api.spec.js --headed
```

---

### **4. View Interactive HTML Test Report**
```bash
npm run report
```
*Direct Playwright command:*
```bash
npx playwright show-report
```

---

## 🛡️ **Key Framework Features & Best Practices**

1. **Page Object Model (POM)**: Complete isolation of UI locators from test logic for maximum reusability and maintainability.
2. **Deterministic Synchronization**: Zero reliance on hardcoded `sleep` calls where explicit element/state waits can be used.
3. **Dynamic Test Isolation**: Every test run generates unique timestamped asset names (e.g. `UI_Form_20260822...`, `API_Process_20260822...`) preventing name collisions in shared workspaces.
4. **Resilient Iframe Encapsulation**: Safe interaction with attended client SPAs through structured `page.frameLocator` chains.
5. **Full Spectrum Verification**: Covers end-to-end user journeys from REST API payload status codes (`200 OK`, `201 Created`) to pixel-level canvas drag-and-drop interactions.

---

## 👨‍💻 **Author**
- **Candidate Name / Email**: `hemant.in022@gmail.com`
- **Automation Anywhere Assignment**: Form Upload Flow & Process via REST API
- **Framework**: Playwright (JavaScript)
