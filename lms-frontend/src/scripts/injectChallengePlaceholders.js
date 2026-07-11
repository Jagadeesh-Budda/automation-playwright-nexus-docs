const fs = require('fs');
const path = require('path');

const baseDir = 'd:/UIAutomation/ui-automation/docs/lms-frontend/src/app/courses/playwright';
const metadataPath = 'd:/UIAutomation/ui-automation/docs/lms-frontend/src/data/metadata.json';

// Load metadata
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

const snippetMap = {
  // Module 0: JS/TS
  '03-js-ts-es6': `// Refactor this legacy code to use ES6 destructuring and array methods (.map or .filter)
var config = { timeout: 30000, retries: 2, browserName: 'chromium' };
var timeout = config.timeout;
var retries = config.retries;

var users = [{ name: 'Admin', active: true }, { name: 'Guest', active: false }];
var activeUsers = [];
for (var i = 0; i < users.length; i++) {
  if (users[i].active == true) {
    activeUsers.push(users[i]);
  }
}`,
  '04-js-ts-objects': `// Challenge: Define a UserProfile interface and create an instance
// The instance must contain an email, shippingAddress, and optional billingAddress.
// FIX THE INCOMPLETE CODE BELOW:

interface UserProfile {
  email: string;
  shippingAddress: string;
  // Add optional billingAddress here:
}

const profile: UserProfile = {
  email: "user@example.com",
  // Complete the object properties below:
};`,
  '05-js-ts-async': `// Challenge: Fetch data from three distinct services concurrently using Promise.all()
// Do NOT fetch them sequentially (which is slow!).
// FIX THE SEQUENTIAL CODE BELOW:

const fetchUsers = () => Promise.resolve(['Alice', 'Bob']);
const fetchConfig = () => Promise.resolve({ timeout: 5000 });
const fetchStatus = () => Promise.resolve('System OK');

const loadDashboard = async () => {
  // BUG: These run sequentially! Refactor to run in parallel using Promise.all:
  const users = await fetchUsers();
  const config = await fetchConfig();
  const status = await fetchStatus();
  
  return { users, config, status };
};`,
  '08-js-ts-control-flow': `// Challenge: Handle network connection errors gracefully
// Wrap the apiRequest function inside a try/catch block. If an error occurs, log it and return null.
// FIX THE UNPROTECTED CODE BELOW:

const apiRequest = () => {
  throw new Error("503 Service Unavailable");
};

const executeTest = () => {
  // Wrap this call in try/catch:
  const response = apiRequest();
  return response;
};`,

  // Module 1 & 2: Playwright Basics
  '11-navigating-clicking': `import { test, expect } from '@playwright/test';

test('checkout flow challenge', async ({ page }) => {
  // BUG: Missing await on navigation
  page.goto('https://store.example.com');

  // BUG: Using a brittle CSS selector and missing await
  page.locator('#search-input').fill('laptop');
  page.locator('#search-btn').click();

  // BUG: Using hardcoded sleep instead of web-first assertions
  await page.waitForTimeout(3000);
  
  // BUG: Add to cart button click
  await page.locator('.btn-primary').click();
});`,
  '15-getbyrole': `import { test, expect } from '@playwright/test';

test('role selector challenge', async ({ page }) => {
  await page.goto('https://portal.example.com');

  // BUG: Refactor these brittle CSS locators to use semantic getByRole locators
  await page.locator('#email-input-field').fill('admin@portal.com');
  await page.locator('.submit-btn-primary').click();

  // Assert dashboard is visible using role
  await expect(page.locator('#dashboard-h1-header')).toBeVisible();
});`,
  '18-strict-mode': `import { test, expect } from '@playwright/test';

test('strict mode challenge', async ({ page }) => {
  await page.goto('https://dashboard.example.com');

  // BUG: This locator resolves to multiple buttons, causing a strict mode violation error!
  // Refactor it using .first() or .filter() to target the correct button.
  await page.getByRole('button', { name: 'Details' }).click();
});`,

  // POM & Test Org
  '21-before-after': `import { test, expect } from '@playwright/test';

// Challenge: Clean up test duplication using hooks
// Move the page setup and authentication steps into a beforeEach hook.
// FIX THE REPETITIVE CODE BELOW:

test('view profile', async ({ page }) => {
  await page.goto('https://app.com/login');
  await page.getByLabel('User').fill('test');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.goto('https://app.com/profile');
  await expect(page).toHaveURL(/.*profile/);
});

test('view settings', async ({ page }) => {
  await page.goto('https://app.com/login');
  await page.getByLabel('User').fill('test');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.goto('https://app.com/settings');
  await expect(page).toHaveURL(/.*settings/);
});`,
  '23-js-ts-ts-oop': `// Challenge: Encapsulate locators and methods inside a POM class
// Complete the Page Object Model class implementation below:

import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly themeDropdown: Locator;
  readonly saveBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    // Define settings page locators here:
    this.themeDropdown = page.________________________;
    this.saveBtn = page.________________________;
  }

  async selectDarkTheme() {
    // Write the method implementation here:
  }
}`,

  // Sync & Reliability
  '36-auto-waiting': `import { test, expect } from '@playwright/test';

test('auto-waiting challenge', async ({ page }) => {
  await page.goto('https://slow-app.com');

  // BUG: The button takes 8 seconds to become attached and enabled.
  // Rely on Playwright's auto-waiting action instead of a hardcoded delay!
  await page.waitForTimeout(8000);
  await page.getByRole('button', { name: 'Confirm' }).click();
});`,
  '37-assertions-vs-waits': `import { test, expect } from '@playwright/test';

test('assertions vs waits challenge', async ({ page }) => {
  await page.goto('https://dynamic-app.com');
  await page.getByRole('button', { name: 'Load' }).click();

  // BUG: The developer is retrieving state manually and making a static assertion.
  // This causes flakiness if the text is delayed! Refactor to a web-first assertion.
  await page.waitForTimeout(2000);
  const text = await page.getByTestId('status').textContent();
  expect(text).toBe('Loaded');
});`,
  '38-timeouts': `import { test, expect } from '@playwright/test';

test('override custom timeout', async ({ page }) => {
  await page.goto('https://heavy-reports.com');
  await page.getByRole('button', { name: 'Export PDF' }).click();

  // BUG: The PDF generation takes 15 seconds, exceeding the default 5s assertion timeout.
  // Override the timeout limit for this assertion only, setting it to 20 seconds.
  await expect(page.getByText('PDF Generation Complete')).toBeVisible();
});`,
  '39-network-sync': `import { test, expect } from '@playwright/test';

test('network synchronization', async ({ page }) => {
  await page.goto('https://analytics.com');

  // BUG: Clicking the refresh button triggers a background API fetch.
  // Synchronize using waitForResponse to catch the target request before asserting!
  await page.getByRole('button', { name: 'Refresh' }).click();
  
  await expect(page.getByText('Data Synced')).toBeVisible();
});`,

  // Enterprise SDET Practices
  '41-fundamentals-cli': `// Challenge: Write a script snippet that overrides Playwright configuration variables via command line.
// npx playwright test --config=playwright.config.ts ...
// Set: headed mode, run 3 workers, and run only tests tagged with '@smoke'
// Write your command below:`,
  '42-fundamentals-exec': `// Challenge: Write Git commands to sync local branch with main by rebasing.
// Retrieve latest updates from origin, then perform a linear rebase onto origin/main.
// Write the commands below:`,
  '46-codegen': `// Challenge: Refactor this brittle raw codegen output into a clean POM script.
// Raw: await page.locator('.login-form-input-email').fill('user');
// Raw: await page.locator('.btn-submit-login').click();

// Write your refactored Page Object method call and visibility assertion here:`,
  '47-migration-guide': `// Challenge: Convert Selenium locator/assertion to Playwright web-first locator/assertion.
// Selenium: WebElement btn = driver.findElement(By.id("submit")); btn.click();
// Selenium: assertEquals(driver.getCurrentUrl(), "https://dashboard.com");

// Write your Playwright conversion below:`,
  '48-js-execution-context': `// Challenge: Handle asynchronous execution safely in afterEach hook
// If multiple teardowns fail, they should not crash the execution thread.
// Use Promise.allSettled() to execute all teardowns.
// FIX THE REPEAT TEARDOWNS BELOW:

const teardown1 = () => Promise.resolve();
const teardown2 = () => Promise.reject("Teardown Failed");

// Complete the teardown execution using Promise.allSettled:`,
  '49-browser-network-mechanics': `// Challenge: Intercept and mock API request payloads
// Intercept a GET request to '**/api/v1/profile' and fulfill with a mocked user object.
// FIX the incorrect routing syntax below:

// Write page.route() interceptor below:`,

  // Advanced Locators & Iframes
  '52-locators-code': `// Challenge: Select the 'Edit' button in the row containing the user 'Sarah'
// Use child/parent locator filtering (.filter)
// FIX THE SELECTOR BELOW:

const row = page.getByRole('row').filter({ hasText: 'Sarah' });
// Click the Edit button in this specific row:`,
  '55-iframes-dialogs': `// Challenge: Interact with elements inside an iframe and handle dialog alert prompts.
// Locate iframe '#editor-frame', fill text, click submit, and accept the dialog prompt.
// Complete the script below:`,
  '56-file-handling': `// Challenge: Download an exported test log and assert that the file is not empty.
// Complete the download handler script below:`,
  '57-multi-tab': `// Challenge: Handle popup page events when clicking a link that opens a new tab
// Complete the promise handler below:`,

  // Advanced Architecture & APIs
  '62-anti-patterns': `import { test, expect } from '@playwright/test';

test('anti-patterns challenge', async ({ page }) => {
  await page.goto('https://app.com');
  
  // BUG: The developer is using hardcoded timeouts and manual sleep loops!
  // Refactor this to use web-first assertions and retryable expect.poll
  await page.waitForTimeout(5000);
  const text = await page.locator('.message-box').textContent();
  expect(text).toContain('Success');
});`,
  '64-adv-assertions': `import { test, expect } from '@playwright/test';

test('retry billing api status', async ({ page }) => {
  // Challenge: Poll an API status endpoint until it returns 'COMPLETED'
  // Use expect.poll() to poll the status function.
  
  const getStatus = async () => {
    const response = await page.request.get('/api/status');
    const data = await response.json();
    return data.status;
  };

  // Write your expect.poll block here:
});`,

  // Accessibility & Emulation
  '68-accessibility': `import { test, expect } from '@playwright/test';

test('accessibility checks', async ({ page }) => {
  await page.goto('https://accessible.org');
  // Challenge: Retrieve all buttons and assert that every button has a non-empty accessible name
  // Complete the script below:
});`,
  '70-clock-emulation': `import { test, expect } from '@playwright/test';

test('clock emulation', async ({ page }) => {
  // Challenge: Install a fake clock and fast-forward 30 minutes to verify session timeout
  // Complete the emulation calls below:
});`,

  // E-Sign & Security Specialist
  '72-esign-compliance': `// Challenge: Verify rejection on document submission without password signature
// Navigate to settings, open sign dialog, leave signature empty, and click confirm.
// Write the compliance test script here:`,
  '79-api-hybrid': `import { test, expect } from '@playwright/test';

test('api hybrid mocking', async ({ page }) => {
  // Challenge: Intercept and mock API requests to simulate heavy payload delay
  // Add a 2 second delay inside page.route() before completing the request.
  // Complete the interceptor below:
});`,

  // API Interceptions
  '102-api-mocking': `import { test, expect } from '@playwright/test';

test('api mocking challenge', async ({ page }) => {
  // Challenge: Intercept a POST to **/api/login and force a 401 Unauthorized status
  // Complete the route interceptor below:
});`,
  '103-adv-auth': `import { test, expect } from '@playwright/test';

// Challenge: Create a browser context that pre-loads authentication state from a JSON file
// Write the context creation call below:
`
};

// Generic Playwright Code Challenge Template
const genericCodeTemplate = `import { test, expect } from '@playwright/test';

test('challenge exercise', async ({ page }) => {
  // Challenge: Refactor this code to follow industry best practices
  // 1. Avoid hardcoded sleeps (waitForTimeout)
  // 2. Use web-first assertions (expect().toBeVisible)
  // 3. Ensure all asynchronous calls are properly awaited
  
  page.goto('https://example.com');
  await page.waitForTimeout(2000);
  const element = page.locator('.submit-btn');
  element.click();
});`;

// Generic JS/TS Concept Challenge Template
const genericJsTsTemplate = `// Challenge: Refactor and correct the code below
// 1. Declare variables using let or const (avoid var)
// 2. Ensure syntax is valid and logic is clean

var status = "active";
console.log("Status: " + status);`;

// Generic CLI Challenge Template
const genericCliTemplate = `# Challenge: Complete the command line task
# Write the correct command below:
`;

function findCodeEditors(content) {
  const editors = [];
  let pos = 0;
  while (true) {
    const startIdx = content.indexOf('<CodeEditor', pos);
    if (startIdx === -1) break;

    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplate = false;
    let braceDepth = 0;
    let endIdx = -1;

    for (let i = startIdx + 11; i < content.length; i++) {
      const char = content[i];
      const prev = content[i - 1];
      const next = content[i + 1];

      if (char === "'" && prev !== '\\' && !inDoubleQuote && !inTemplate) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && prev !== '\\' && !inSingleQuote && !inTemplate) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === '`' && prev !== '\\' && !inSingleQuote && !inDoubleQuote) {
        inTemplate = !inTemplate;
      }

      if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
        } else if (char === '/' && next === '>' && braceDepth === 0) {
          endIdx = i + 2;
          break;
        }
      }
    }

    if (endIdx !== -1) {
      editors.push({
        start: startIdx,
        end: endIdx,
        text: content.substring(startIdx, endIdx)
      });
      pos = endIdx;
    } else {
      pos = startIdx + 11;
    }
  }
  return editors;
}

function parseAttributes(attrStr) {
  const attrs = {};
  let i = 0;
  while (i < attrStr.length) {
    while (i < attrStr.length && /\s/.test(attrStr[i])) {
      i++;
    }
    if (i >= attrStr.length) break;

    let nameStart = i;
    while (i < attrStr.length && /[a-zA-Z0-9_\-]/.test(attrStr[i])) {
      i++;
    }
    const name = attrStr.substring(nameStart, i);
    if (!name) {
      i++;
      continue;
    }

    while (i < attrStr.length && /\s/.test(attrStr[i])) {
      i++;
    }

    if (i < attrStr.length && attrStr[i] === '=') {
      i++;
      while (i < attrStr.length && /\s/.test(attrStr[i])) {
        i++;
      }

      if (i < attrStr.length) {
        const char = attrStr[i];
        if (char === '"' || char === "'") {
          const quote = char;
          let valStart = i + 1;
          i++;
          while (i < attrStr.length && (attrStr[i] !== quote || attrStr[i - 1] === '\\')) {
            i++;
          }
          const value = attrStr.substring(valStart, i);
          attrs[name] = { type: 'string', raw: quote + value + quote, value };
          i++;
        } else if (char === '{') {
          let braceDepth = 1;
          let valStart = i;
          i++;
          let inSingleQuote = false;
          let inDoubleQuote = false;
          let inTemplate = false;

          while (i < attrStr.length && braceDepth > 0) {
            const c = attrStr[i];
            const prev = attrStr[i - 1];

            if (c === "'" && prev !== '\\' && !inDoubleQuote && !inTemplate) {
              inSingleQuote = !inSingleQuote;
            } else if (c === '"' && prev !== '\\' && !inSingleQuote && !inTemplate) {
              inDoubleQuote = !inDoubleQuote;
            } else if (c === '`' && prev !== '\\' && !inSingleQuote && !inDoubleQuote) {
              inTemplate = !inTemplate;
            }

            if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
              if (c === '{') braceDepth++;
              else if (c === '}') braceDepth--;
            }
            i++;
          }
          const raw = attrStr.substring(valStart, i);
          const value = attrStr.substring(valStart + 1, i - 1).trim();
          attrs[name] = { type: 'expression', raw, value };
        } else {
          let valStart = i;
          while (i < attrStr.length && !/\s/.test(attrStr[i])) {
            i++;
          }
          const raw = attrStr.substring(valStart, i);
          attrs[name] = { type: 'unquoted', raw, value: raw };
        }
      }
    } else {
      attrs[name] = { type: 'boolean', raw: '', value: true };
    }
  }
  return attrs;
}

function processMdxFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processMdxFiles(fullPath);
    } else if (file.endsWith('.mdx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const editors = findCodeEditors(content);
      if (editors.length > 0) {
        const dirName = path.basename(dir);
        let metaEntry = metadata.find(m => m.id === dirName || m.url.endsWith('/' + dirName));
        if (!metaEntry) {
          metaEntry = metadata.find(m => m.id.toLowerCase() === dirName.toLowerCase());
        }
        const primaryModuleId = metaEntry ? metaEntry.id : dirName;
        const moduleType = metaEntry?.meta?.type || 'Code';

        // We only modify the last editor (the challenge editor) if there are multiple editors
        if (editors.length > 1) {
          const challengeIdx = editors.length - 1;
          const editor = editors[challengeIdx];
          const attrStr = editor.text.substring(12, editor.text.length - 2);
          const attrs = parseAttributes(attrStr);

          // Get template broken code
          let templateCode = snippetMap[primaryModuleId];
          if (!templateCode) {
            if (primaryModuleId.includes('js-ts')) {
              templateCode = genericJsTsTemplate;
            } else if (moduleType === 'Execution' || moduleType === 'Debug') {
              templateCode = genericCliTemplate;
            } else {
              templateCode = genericCodeTemplate;
            }
          }

          // Format placeholder correctly for template literal expression in MDX/JSX
          const rawPlaceholder = '`' + templateCode.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`';
          attrs['placeholder'] = { type: 'expression', raw: `{${rawPlaceholder}}`, value: templateCode };

          // Construct new rewritten tag
          let newTag = `<CodeEditor\n  moduleId="${primaryModuleId}"\n  taskIndex={${challengeIdx}}`;
          for (const name of Object.keys(attrs)) {
            if (name === 'moduleId' || name === 'taskIndex') continue;
            const attr = attrs[name];
            if (attr.type === 'boolean') {
              newTag += `\n  ${name}`;
            } else {
              newTag += `\n  ${name}=${attr.raw}`;
            }
          }
          newTag += '\n/>';

          // Apply replacement taking care of offsets
          const before = content.substring(0, editor.start);
          const after = content.substring(editor.end);
          content = before + newTag + after;

          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Injected challenge broken code template into MDX: ${path.relative(baseDir, fullPath)}`);
        }
      }
    }
  }
}

console.log('--- Injecting Challenge Placeholders with Broken/Incomplete Code ---');
processMdxFiles(baseDir);
console.log('Done!');
