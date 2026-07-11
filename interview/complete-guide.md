# Playwright Academy Complete Interview Guide

This guide compiles technical interview questions, coding challenges, evaluation criteria, and architectural patterns across four difficulty tiers. All content is derived strictly from the compiled Playwright Academy Knowledge Database.

---

## 1. Beginner Tier

### Q1: Explain the purpose of `const` and `let` in modern test script design.
* **Expected Answer**: `const` should be used by default for all variable declarations (e.g. baseline URLs, locator definitions) to enforce block-scoping and prevent accidental reassignment. `let` should be used only when a variable must be reassigned, such as for retry counters inside loop blocks.
* **Common Mistakes**: Recommending the legacy `var` keyword, which lacks block-scoping and can lead to shared state leakage between tests.
* **Follow-up**: Why does using `const` prevent silent side effects in test files?

### Q2: What is the difference between `page.goto()` and `page.locator()` in terms of execution?
* **Expected Answer**: `page.goto()` is an eager operation that immediately triggers a browser navigation request across the network and returns a Promise. `page.locator()` is a lazy operation that merely defines a query path; it does not query the browser DOM or perform any network calls until an action is executed on it.
* **Common Mistakes**: Attempting to prefix a locator definition with `await` (e.g. `const btn = await page.locator(...)`).
* **Follow-up**: What happens if you define a locator for an element that does not exist yet?

### Q3: What is the Locator Priority Ladder?
* **Expected Answer**: It is the official hierarchy for selectors, prioritizing accessibility indicators over brittle styling structures:
  1. `getByRole()` (Queries the ARIA accessibility tree)
  2. `getByLabel()` (Form input fields associated with label text)
  3. `getByPlaceholder()` (HTML placeholder texts)
  4. `getByText()` (Static content)
  5. `getByTestId()` (Dedicated testing ID escape hatch)
  6. `page.locator()` (CSS classes or XPath queries as a last resort)
* **Common Mistakes**: Relying on class names (`.btn-primary`) or full XPath trees as the primary selection strategy.
* **Follow-up**: Why are CSS classes considered brittle in automated tests?

### Q4: How do you verify that an element is visible using a Web-First assertion?
* **Expected Answer**: Use the `expect` wrapper on the locator object: `await expect(page.getByRole('heading')).toBeVisible();`. This assertion polls the DOM automatically until the condition passes or a timeout is reached.
* **Common Mistakes**: Writing `expect(await page.getByRole('heading').isVisible()).toBe(true);` which evaluates immediately and does not retry.
* **Follow-up**: What is the default polling timeout for Web-First assertions? (Answer: 5 seconds).

### Q5: How do you check a checkbox and verify its state?
* **Expected Answer**:
  ```typescript
  const checkbox = page.getByRole('checkbox', { name: 'Accept Terms' });
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  ```
* **Common Mistakes**: Simulating a raw click action on the checkbox rather than using `.check()`, or checking the `checked` attribute manually in the DOM.
* **Follow-up**: How do you uncheck a checkbox? (`.uncheck()`).

### Q6: How do you run tests in a specific browser project from the CLI?
* **Expected Answer**: Run the CLI command using the `--project` flag:
  ```bash
  npx playwright test --project=chromium
  ```
* **Common Mistakes**: Omitting project targets when debugging, which spins up Chromium, Firefox, and WebKit simultaneously.
* **Follow-up**: How do you run tests in headed mode? (`--headed`).

### Q7: What is the HTML Reporter and how do you view it?
* **Expected Answer**: The HTML reporter generates an interactive dashboard listing steps, times, screenshots, and logs of a test run. View it by running `npx playwright show-report`.
* **Common Mistakes**: Confusing the terminal console reporter with the HTML report generator.
* **Follow-up**: Can you configure Playwright to open the report automatically on failure? (Answer: Yes, in the config reporter array options).

### Q8: What is the purpose of `page.pause()`?
* **Expected Answer**: It stops test execution at that point and launches the Playwright Inspector, letting you step through code and test locator queries interactively in a live browser.
* **Common Mistakes**: Running `page.pause()` in headless runs (it requires headed execution).
* **Follow-up**: What CLI command executes tests in debug mode directly? (`npx playwright test --debug`).

### Q9: How do you input text into a field using Playwright?
* **Expected Answer**: Use the `.fill()` method: `await page.getByLabel('Username').fill('myuser');`. This clears the existing value and inputs the new string.
* **Common Mistakes**: Using the deprecated `.type()` method.
* **Follow-up**: When would you use `.pressSequentially()` instead of `.fill()`?

### Q10: How do you verify that a button is disabled?
* **Expected Answer**: `await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();`.
* **Common Mistakes**: Manually retrieving the `disabled` property from the DOM node.
* **Follow-up**: What is the inverse assertion method? (`.toBeEnabled()`).

---

## 2. Intermediate Tier

### Q11: What is a Strict Mode violation, and how does Playwright react to it?
* **Expected Answer**: It is an exception thrown when a locator matches multiple elements in the DOM during an action execution (e.g. click). Playwright halts the action and fails the test to ensure you do not interact with the wrong element.
* **Common Mistakes**: Thinking strict mode affects read-only queries or list counts.
* **Follow-up**: How does Selenium handle multiple matching elements? (Answer: It acts on the first element, risking silent failures).

### Q12: How do you resolve a Strict Mode violation without using index overrides?
* **Expected Answer**: Refine the locator's scope. You can chain it to a specific parent element (e.g. `page.locator('#sidebar').getByRole('button')`) or filter by unique features (e.g. `.filter({ hasText: 'Logout' })`).
* **Common Mistakes**: Appending `.first()` or `.nth(0)` automatically, which makes the locator fragile if the order of elements changes.
* **Follow-up**: When is it safe to use `.first()`?

### Q13: How do you configure regular expressions inside text-matching locators?
* **Expected Answer**: Pass a RegExp literal directly as the argument:
  ```typescript
  await expect(page.getByText(/order has been shipped/i)).toBeVisible();
  ```
* **Common Mistakes**: Wrapping the RegExp literal inside quotes.
* **Follow-up**: What is the difference between a regex match and using `{ exact: true }`?

### Q14: What is locator chaining? Provide an example.
* **Expected Answer**: Chaining is appending locator queries sequentially to narrow down the search region:
  ```typescript
  const tableRow = page.getByRole('row').filter({ hasText: 'DOC-101' });
  await tableRow.getByRole('button', { name: 'Download' }).click();
  ```
* **Common Mistakes**: Believing chaining performs multiple separate lookups; it compiles into a single query evaluated at action execution.
* **Follow-up**: Can you chain a `frameLocator` with a standard locator? (Answer: Yes).

### Q15: How does Playwright handle interactive elements inside standard HTML `<iframe>` blocks?
* **Expected Answer**: It requires using the `frameLocator` API to switch query contexts inside the iframe. Standard page-level locators cannot cross iframe boundaries.
  ```typescript
  const cardFrame = page.frameLocator('iframe#stripe-payment');
  await cardFrame.getByLabel('Card Number').fill('4111...');
  ```
* **Common Mistakes**: Attempting to click the iframe element first to focus it, rather than using `frameLocator`.
* **Follow-up**: Do actions inside `frameLocator` support auto-waiting? (Answer: Yes).

### Q16: How do you handle native browser confirmation alerts?
* **Expected Answer**: Register a listener using `page.on('dialog')` before triggering the action that opens the alert:
  ```typescript
  page.on('dialog', async dialog => {
    expect(dialog.message()).toBe('Are you sure?');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Delete' }).click();
  ```
* **Common Mistakes**: Expecting Playwright to query the dialog box using standard locator selectors.
* **Follow-up**: What is the default action Playwright takes if no listener is registered? (Answer: It dismisses all dialogs).

### Q17: What are describe blocks and how do they benefit test organization?
* **Expected Answer**: `test.describe` groups related test specs. It allows you to run localized lifecycle hooks (`beforeEach`, `afterEach`) and configure parallel or sequential execution settings for that group.
* **Common Mistakes**: Declaring global variables inside describe blocks that get modified by tests, leading to state pollution during parallel runs.
* **Follow-up**: How do you mark a describe block to run its tests in a strict serial sequence? (`test.describe.configure({ mode: 'serial' })`).

### Q18: What are action and navigation timeouts, and where are they configured?
* **Expected Answer**: `actionTimeout` is the maximum time a browser action (click, fill) waits for actionability checks to pass. `navigationTimeout` is the limit for load resolutions (`page.goto`). They are configured inside the `use` block of `playwright.config.ts`.
* **Common Mistakes**: Not configuring these, allowing actions to default to the longer test timeout limit.
* **Follow-up**: What happens if `actionTimeout` is set longer than the test timeout?

### Q19: How do you verify the text of an element using a partial match assertion?
* **Expected Answer**: Use the `.toContainText()` matcher:
  ```typescript
  await expect(page.getByRole('status')).toContainText('Success');
  ```
* **Common Mistakes**: Confusing `.toHaveText()` (which checks for an exact match, excluding whitespaces) with `.toContainText()`.
* **Follow-up**: How can you perform a case-insensitive check with `toHaveText`? (Answer: Use a regular expression with the `i` flag).

### Q20: How do you clear cookies or local storage between tests?
* **Expected Answer**: Playwright does this automatically for every test because each test runs in its own isolated BrowserContext. You do not need to clean up cookies manually.
* **Common Mistakes**: Adding boilerplate `page.context().clearCookies()` inside beforeEach hooks.
* **Follow-up**: When would you need to share cookies between tests? (Answer: When sharing auth state via global setup).

---

## 3. Senior Tier

### Q21: Design a baseTest fixture configuration that injects Page Objects.
* **Expected Answer**:
  ```typescript
  // fixtures/baseTest.ts
  import { test as base } from '@playwright/test';
  import { LoginPage } from '../pages/LoginPage';

  export const test = base.extend<{ loginPage: LoginPage }>({
    loginPage: async ({ page }, use) => {
      const loginPage = new LoginPage(page);
      await use(loginPage);
    }
  });
  ```
* **Common Mistakes**: Instantiating Page Objects manually with `new` inside every spec file.
* **Follow-up**: How do you implement a fixture teardown step? (Answer: Put code after `await use(loginPage)`).

### Q22: Explain the visual testing workflow in Playwright. How do you handle dynamic content?
* **Expected Answer**: Use `expect(page).toHaveScreenshot('name.png')`. Playwright compares the current viewport against a saved baseline. For dynamic content (like live clocks or graphs), exclude them using the `mask` option:
  ```typescript
  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [page.getByTestId('live-chart')]
  });
  ```
* **Common Mistakes**: Not using masks, causing tests to fail whenever dynamic data updates on the page.
* **Follow-up**: How do you update baseline screenshots? (`npx playwright test --update-snapshots`).

### Q23: How do you write an accessibility test using AxeBuilder?
* **Expected Answer**:
  ```typescript
  import AxeBuilder from '@axe-core/playwright';
  
  test('accessibility check', async ({ page }) => {
    await page.goto('/form');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21aa'])
      .analyze();
    expect(results.violations.length).toBe(0);
  });
  ```
* **Common Mistakes**: Running AxeBuilder tests on empty pages or not waiting for loading states to complete first.
* **Follow-up**: How do you limit the scan to a specific page element instead of the entire page? (Using `.include('selector')`).

### Q24: How do you execute direct API requests inside a UI test spec?
* **Expected Answer**: Use the `request` fixture:
  ```typescript
  test('verify api integration', async ({ request, page }) => {
    const response = await request.post('/api/items', { data: { name: 'Item' } });
    expect(response.status()).toBe(201);
    
    await page.goto('/items');
    await expect(page.getByText('Item')).toBeVisible();
  });
  ```
* **Common Mistakes**: Confusing `page.request` (which inherits browser cookies/headers) with the global `request` fixture (which is clean and independent).
* **Follow-up**: When should you use `page.request` instead of the `request` fixture?

### Q25: How do you bypass UI login flows by injecting storage states?
* **Expected Answer**: Login once in a setup step, save the context storage state to a file, and configure the project to load it:
  ```typescript
  // Save state
  await page.context().storageState({ path: 'auth.json' });

  // Load state in config
  use: {
    storageState: 'auth.json'
  }
  ```
* **Common Mistakes**: Storing session states in git repositories or hardcoding tokens.
* **Follow-up**: How do you clear the auth state for a single test that specifically tests the login page? (Answer: Set `test.use({ storageState: { cookies: [], origins: [] } })` in that file).

### Q26: Code Challenge: Traverse a paginated list to locate a document ID.
* **Expected Answer**:
  ```typescript
  let found = false;
  while (!found) {
    const targetRow = page.getByRole('row').filter({ hasText: 'DOC-123' });
    if (await targetRow.isVisible()) {
      found = true;
      await targetRow.getByRole('button', { name: 'Delete' }).click();
    } else {
      const nextBtn = page.getByRole('button', { name: 'Next' });
      if (await nextBtn.isDisabled()) throw new Error('Not found');
      await nextBtn.click();
      await expect(page.getByRole('progressbar')).toBeHidden(); // Sync reload
    }
  }
  ```
* **Common Mistakes**: Not checking if the next button is disabled, leading to infinite loops.
* **Follow-up**: Why is waiting for the progressbar spinner crucial in pagination loops?

### Q27: How do you verify sorting on a dynamic table?
* **Expected Answer**:
  ```typescript
  await page.getByRole('columnheader', { name: 'Price' }).click();
  const firstPrice = await page.getByRole('row').nth(1).getByRole('cell').first().textContent();
  const lastPrice = await page.getByRole('row').last().getByRole('cell').first().textContent();
  expect(parseFloat(firstPrice!)).toBeLessThan(parseFloat(lastPrice!));
  ```
* **Common Mistakes**: Scraping every row in the table when checking boundary items (first and last) is sufficient and faster.
* **Follow-up**: How do you handle empty cells in sorting verification?

### Q28: How do you handle loading state spinners in single-page apps?
* **Expected Answer**: Assert the spinner's life cycle. Wait for it to become visible (to confirm the loading state started) and then wait for it to disappear:
  ```typescript
  const spinner = page.getByRole('progressbar');
  await expect(spinner).toBeVisible({ timeout: 1000 });
  await expect(spinner).toBeHidden({ timeout: 10000 });
  ```
* **Common Mistakes**: Relying on static sleeps or assuming the table updates instantly.
* **Follow-up**: What is the fallback check if the network call is too fast for the spinner to render? (Answer: Check for changes in the table row content count or items).

### Q29: What is a data factory in test engineering, and how does it prevent run conflicts?
* **Expected Answer**: A utility that generates unique mock payloads (e.g., dynamic usernames or emails using timestamps) for each test. This isolates data states and prevents concurrent tests from trying to register duplicate accounts simultaneously.
* **Common Mistakes**: Hardcoding users like `user@test.com` inside test suites running on multi-threaded parallel CI environments.
* **Follow-up**: How do you coordinate cleaning up data factory records after tests finish?

### Q30: How do you assert against an asynchronous API using `expect.poll()`?
* **Expected Answer**:
  ```typescript
  await expect.poll(async () => {
    const res = await request.get('/api/job/status');
    return res.status();
  }, {
    timeout: 10000,
    intervals: [1000]
  }).toBe(200);
  ```
* **Common Mistakes**: Using standard `expect()` inside a manual loop.
* **Follow-up**: How does `expect.poll()` differ from `expect.toPass()`?

---

## 4. Architect Tier

### Q31: Describe the 4-Layer Page Object Model Architecture.
* **Expected Answer**: It divides the automation framework into four distinct levels of abstraction:
  * **Layer 1: Test Specs**: Purely functional tests containing only actions and assertions. No selector strings or URL paths are defined here.
  * **Layer 2: Page Objects**: Map logical pages and expose high-level actions/workflows (e.g., `login`).
  * **Layer 3: UI Components**: Encapsulate reusable widgets and tables (e.g., `DataTableComponent`, `DatePicker`).
  * **Layer 4: Data Shapes/Entities**: Define TypeScript interfaces and schemas for test payloads and API endpoints.
* **Common Mistakes**: Mixing Page Object actions with test assertions, or repeating complex table selection queries in multiple Page Classes.
* **Follow-up**: How does Layer 3 prevent code churn during design system updates?

### Q32: Design a reusable Date Picker component class.
* **Expected Answer**:
  ```typescript
  // components/DatePicker.ts
  import { Locator, Page } from '@playwright/test';

  export class DatePicker {
    readonly root: Locator;
    readonly trigger: Locator;
    readonly calendar: Locator;

    constructor(page: Page, labelName: string) {
      this.root = page.getByRole('group', { name: labelName });
      this.trigger = this.root.getByRole('button');
      this.calendar = page.getByRole('dialog', { name: 'Calendar' });
    }

    async selectDate(day: number) {
      await this.trigger.click();
      await this.calendar.getByRole('gridcell', { name: String(day) }).click();
    }
  }
  ```
* **Common Mistakes**: Not scoping locators inside a parent root locator, which causes strict mode errors if multiple date pickers exist on the page.
* **Follow-up**: How would you extend this to support navigating between months?

### Q33: How do you mock a Multi-Factor Authentication (MFA) SMS OTP gateway using route interception?
* **Expected Answer**: Use `page.route()` to intercept the verify request and return a mocked successful session payload:
  ```typescript
  await page.route('**/api/auth/mfa/verify', async (route) => {
    const payload = route.request().postDataJSON();
    if (payload.code === '123456') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ verified: true, session: 'valid-session' })
      });
    } else {
      await route.fulfill({ status: 400 });
    }
  });
  ```
* **Common Mistakes**: Designing real-world Twilio integrations inside automated UI runs, which introduces flakiness and high costs.
* **Follow-up**: How does route mocking speed up parallel execution pipelines?

### Q34: How do you coordinate multiple tabs and popups within a Page Object class?
* **Expected Answer**: Expose a page-retrieval method in the POM that returns a new page instance by resolving the browser context's `popup` event:
  ```typescript
  async triggerPopup(): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('popup');
    await this.page.getByRole('button', { name: 'Open Window' }).click();
    const newTab = await popupPromise;
    await newTab.waitForLoadState();
    return newTab;
  }
  ```
* **Common Mistakes**: Assuming the parent page locator context updates focus to the tab automatically.
* **Follow-up**: How does the test verify details on the returned page object?

### Q35: How do you use AST (Abstract Syntax Tree) parsing to enforce custom framework rules?
* **Expected Answer**: Write a Node check script using a parser (like `acorn` or `@typescript-eslint/parser`) to inspect the syntax tree. Traverse the nodes to detect prohibited patterns, such as `page.waitForTimeout` or using `expect` statements inside helper classes under the `pages/` directory:
  ```typescript
  // scripts/lint-rules.ts
  if (
    node.type === 'CallExpression' &&
    node.callee.property?.name === 'waitForTimeout'
  ) {
    console.error('❌ Prohibited waitForTimeout found');
    process.exitCode = 1;
  }
  ```
  Run this check as part of a pre-commit git hook or inside the CI quality gate pipeline.
* **Common Mistakes**: Attempting to write regular expression checks to find keywords, which produces high false-positive rates on comments or string properties.
* **Follow-up**: What is the performance overhead of running AST checks on pre-commits?
