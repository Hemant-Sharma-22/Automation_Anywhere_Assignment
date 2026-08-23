module.exports = {
  useCase1: {
    formNamePrefix: 'UI_Form_',
    formDescription: 'Automated Form with Text Box and File Upload control created via Playwright POM',
    textBox: {
      label: 'Employee Full Name',
      hint: 'Please enter your legal first and last name',
      testInput: 'John Doe - Automation Engineer'
    },
    selectFile: {
      label: 'Supporting Identity Document',
      allowedFormat: 'txt, pdf, doc, docx, png, jpg'
    }
  },
  useCase2: {
    formNamePrefix: 'API_Form_',
    formDescription: 'Form with TextBox, TextArea, and Number created via Control Room REST API',
    processNamePrefix: 'API_Process_',
    processDescription: '3-node workflow process (InitialStep to FormStep to exit) created via Control Room REST API',
    formFields: [
      {
        id: 'TextBox0',
        name: 'TextBox',
        type: 'TEXT_BOX',
        label: 'Employee Name',
        placeholder: 'Enter full name',
        required: true
      },
      {
        id: 'TextArea0',
        name: 'TextArea',
        type: 'TEXT_AREA',
        label: 'Project Summary / Feedback',
        placeholder: 'Enter detailed summary or comments',
        required: false
      },
      {
        id: 'Number0',
        name: 'Number',
        type: 'NUMBER',
        label: 'Years of Experience',
        placeholder: 'Enter numeric value (e.g. 5)',
        required: true
      }
    ]
  }
};
