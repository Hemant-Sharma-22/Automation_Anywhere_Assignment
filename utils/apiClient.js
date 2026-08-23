const { expect } = require('@playwright/test');

/**
 * Reusable REST API Client for Automation Anywhere Control Room v2 Repository APIs (Use Case 2)
 */
class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   * @param {string} baseUrl 
   * @param {string} token 
   */
  constructor(request, baseUrl, token) {
    this.request = request;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  /**
   * Common headers including X-Authorization
   */
  get headers() {
    return {
      'X-Authorization': this.token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Step 2: Retrieve the private workspace folder ID for the authenticated user
   * @returns {Promise<string>}
   */
  async getPrivateWorkspaceFolderId() {
    const res = await this.request.get(`${this.baseUrl}/v2/repository/workspace/defaults`, {
      headers: this.headers
    });
    expect(res.status(), 'Workspace defaults should return 200 OK').toBe(200);
    const data = await res.json();
    expect(data.privateFolderId, 'Private workspace folder ID should be present and valid').toBeTruthy();
    return data.privateFolderId;
  }

  /**
   * Step 3: Create a Form file in the private workspace via API
   * @param {string} folderId 
   * @param {string} formName 
   * @param {string} [description] 
   * @returns {Promise<{id: string, path: string}>}
   */
  async createFormFile(folderId, formName, description = 'Form created via API') {
    const res = await this.request.post(`${this.baseUrl}/v2/repository/files`, {
      headers: this.headers,
      data: {
        parentFolderId: folderId,
        name: formName,
        description: description,
        contentType: 'application/vnd.aa.form'
      }
    });
    expect(res.status(), 'Create Form File should return 201 Created').toBe(201);
    const data = await res.json();
    expect(data.id, 'Form creation response must contain a valid ID').toBeTruthy();
    return data;
  }

  /**
   * Step 4: Save the form content with three fields: TextBox, TextArea, and Number
   * @param {string} formId 
   * @param {Array<any>} fields 
   */
  async saveFormContent(formId, fields) {
    const formSchema = {
      form: {
        properties: {
          title: `Form_${formId}`,
          dimension: { height: 600, width: 600 },
          font: { fontType: 'System', fontSize: 'MEDIUM' }
        },
        elements: fields
      }
    };

    const res = await this.request.put(`${this.baseUrl}/v2/repository/files/${formId}/content?hasErrors=false`, {
      headers: {
        'X-Authorization': this.token,
        'Content-Type': 'application/vnd.aa.form'
      },
      data: JSON.stringify(formSchema)
    });
    expect(res.status(), 'Save Form Content should return 200 OK').toBe(200);
    return res;
  }

  /**
   * Step 5: Save the form's file dependencies via API
   * @param {string} formId 
   */
  async saveFormDependencies(formId) {
    const res = await this.request.put(`${this.baseUrl}/v2/repository/files/${formId}/dependencies`, {
      headers: this.headers,
      data: {
        childFileIds: []
      }
    });
    expect(res.status(), 'Save Form Dependencies should return 200 OK').toBe(200);
    return res;
  }

  /**
   * Step 6: Create a Process file in the private workspace via API
   * @param {string} folderId 
   * @param {string} procName 
   * @param {string} [description] 
   * @returns {Promise<{id: string, path: string}>}
   */
  async createProcessFile(folderId, procName, description = 'Workflow process created via API') {
    const res = await this.request.post(`${this.baseUrl}/v2/repository/files`, {
      headers: this.headers,
      data: {
        parentFolderId: folderId,
        name: procName,
        description: description,
        contentType: 'application/vnd.aa.workflow'
      }
    });
    if (res.status() !== 201) {
      console.error('createProcessFile failed with status:', res.status(), 'body:', await res.text());
    }
    expect(res.status(), 'Create Process File should return 201 Created').toBe(201);
    const data = await res.json();
    expect(data.id, 'Process creation response must contain a valid ID').toBeTruthy();
    return data;
  }

  /**
   * Step 7: Save the process content with a 3-node workflow: InitialStep -> FormStep -> exit
   * @param {string} procId 
   * @param {string} formId 
   * @param {string} formPath 
   */
  async saveProcessContent(procId, formId, formPath = '') {
    const workflowSchema = {
      workflow: {
        nodes: [
          {
            id: 'InitialStep',
            name: 'Start',
            type: 'START',
            next: 'FormStep',
            formId: formId
          },
          {
            id: 'FormStep',
            name: 'User Form Review',
            type: 'FORM_STEP',
            next: 'exit',
            formId: formId,
            formPath: formPath
          },
          {
            id: 'exit',
            name: 'End',
            type: 'END'
          }
        ]
      }
    };

    const res = await this.request.put(`${this.baseUrl}/v2/repository/files/${procId}/content?hasErrors=false`, {
      headers: {
        'X-Authorization': this.token,
        'Content-Type': 'application/vnd.aa.workflow'
      },
      data: JSON.stringify(workflowSchema)
    });
    expect(res.status(), 'Save Process Content should return 200 OK').toBe(200);
    return res;
  }

  /**
   * Step 8: Save the process's file dependencies via API, linking the form file
   * @param {string} procId 
   * @param {string} formId 
   */
  async saveProcessDependencies(procId, formId) {
    const res = await this.request.put(`${this.baseUrl}/v2/repository/files/${procId}/dependencies`, {
      headers: this.headers,
      data: {
        childFileIds: [formId]
      }
    });
    expect(res.status(), 'Save Process Dependencies should return 200 OK').toBe(200);
    return res;
  }
}

module.exports = ApiClient;
