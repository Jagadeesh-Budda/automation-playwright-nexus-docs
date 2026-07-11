module.exports = {
  "onboarding": {
    "Analyzing trace: [{'action':'click','duration':30005,'error':'Timeout'}]. What is the root cause?": "Action timeout exceeded default 30s",
    "Which ASA guideline prevents flaky tests caused by dynamic content?": "Resilient Locators (getByRole)",
    "What is the core technical tool used for our UI automation?": "Playwright",
    "Trace analysis: [{'action':'goto','status':'failed','error':'net::ERR_CONNECTION_REFUSED'}]. Identify the issue:": "Backend server is not running",
    "In the 5-day cycle, when should you start writing your first test?": "Day 3",
    "Why does the framework forbid hardcoded sleeps?": "Causes instability in CI/CD",
    "What is the 'Definition of Done' for a technical PR at Automation Skill Authority (ASA)?": "AST Auditor clears in --strict mode"
  },
  "fundamentals-debug": {
    "Trace analysis: [{'method':'rebase','status':'conflict'}]. Best resolution?": "Manual merge and continue rebase"
  },
  "quality-gates": {
    "Trace snippet: [{'step':'AST Validation','error':'ERR_WAIT_FOR_TIMEOUT'}]. Why did it fail?": "Code contains prohibited waitForTimeout"
  },
  "core-debug": {
    "Analyzing trace: [{'action':'click','selector':'#btn-submit','duration':500}]. Status: Succeed, but UI didn't change. Why?": "Missing await on the action"
  },
  "locators-debug": {
    "Trace snippet: [{'action':'click','selector':'.btn','error':'strict mode violation: resolved to 5 elements'}]. Fix?": "Use getByRole with name option"
  },
  "esign-debug": {
    "Trace analysis: [{'action':'click','selector':'#sign-btn','error':'Element is obscured by <div class=modal-overlay>'}]. Resolution?": "Wait for overlay to disappear or use force:true"
  },
  "ast-gate": {
    "Audit Trace: [{'rule':'No-Op Assertion','node':'expect(true).toBeTruthy()'}]. Why is this a 'Hard Fail'?": "Assertion does not validate UI state",
    "Audit Trace: [{'rule':'Brittle Selector','selector':'div > span > nth-child(2)'}]. Recommended fix:": "Use getByTestId or getByRole",
    "Audit Trace: [{'rule':'Missing Await','node':'page.click()'}]. Impact on CI:": "Flaky results due to race condition"
  },
  "capstone-audit": {
    "Final Trace Analysis: [{'step':'E2E Flow','action':'sign','status':'success'},{'step':'DB Check','status':'not_found'}]. Why the discrepancy?": "UI signature did not trigger backend persistence",
    "What is the final step before a test is considered 'Production-Grade'?": "It passes the automated Quality Gate"
  }
};