# Chapter 8: Your First Playwright Test

## Metadata
* **Part**: Phase 0: Prerequisites
* **Learning Objectives**:
  - Install Playwright in a project
  - Write and run your first automated test
  - Understand what happens when a test runs
* **Prerequisites**:
  - Chapter 0G: Reading Errors & Debugging
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Absolute Beginner

---

## 1. Why This Matters
This is the moment everything clicks. You will write a test, run it, see a real browser open, watch it perform actions automatically, and see the result. This is the foundation for everything that follows.

---

## 2. Conceptual Overview
This chapter walks you through installing Playwright and running your very first automated test step by step.

Step 1: Install Playwright
- Open your terminal in your project folder.
- Run: npm install -D @playwright/test
- Then run: npx playwright install
- This downloads the test framework AND the browser engines (Chromium, Firefox, WebKit).

Step 2: Create Your Test File
- Create a folder called tests inside your project.
- Inside tests, create a file called first.spec.ts (the .spec.ts extension tells Playwright this is a test file).
- Write a simple test that opens a website and checks the page title.

Step 3: Run Your Test
- In your terminal, run: npx playwright test
- Playwright will open a browser (in headless mode by default), visit the website, check the title, and report the result.
- To SEE the browser open visually, run: npx playwright test --headed

Step 4: Understand What Happened
- npx playwright test told the Playwright runner to find all .spec.ts files and execute them.
- The runner launched a headless Chromium browser.
- It navigated to the URL you specified.
- It checked the page title against your expectation.
- It reported PASS or FAIL in your terminal.

Congratulations — you just automated a browser!

### Execution Flow Diagram
```
[Install Playwright] ──► [Write test file] ──► [Run npx playwright test] ──► [Browser opens] ──► [Test passes/fails]
```

---

## 3. Implementation and Code Examples
```typescript
// File: tests/first.spec.ts
// This is your very first Playwright test!

import { test, expect } from '@playwright/test';

test('verify TodoMVC page title', async ({ page }) => {
  // Step 1: Navigate to the TodoMVC demo app
  await page.goto('https://demo.playwright.dev/todomvc');

  // Step 2: Check that the page title contains "TodoMVC"
  await expect(page).toHaveTitle(/TodoMVC/);

  // Step 3: Verify the main heading is visible
  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
});

// To run this test, type in your terminal:
// npx playwright test
//
// To see the browser open:
// npx playwright test --headed
//
// Expected output:
// Running 1 test using 1 worker
//   ✓ first.spec.ts:5:5 › verify TodoMVC page title (1.2s)
//   1 passed (2.5s)
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Run npx playwright test --headed the first time to see the browser in action.
* Read the terminal output after every run — it tells you exactly what passed and failed.
* Use npx playwright test --ui to open the interactive test viewer.

### Don't
* Do not skip npx playwright install — without it, there are no browser engines to run tests.
* Do not worry about understanding every keyword (async, await, expect) right now — they are explained in later chapters.

---

## 5. Chapter Summary
* Install Playwright with npm install -D @playwright/test and npx playwright install.
* Create test files in a tests/ folder with the .spec.ts extension.
* Run tests with npx playwright test. Add --headed to see the browser.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a second test in the same file that adds a todo item by typing in the input box and pressing Enter. Verify the todo appears in the list.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('add a new todo item', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');

  // Type a new todo in the input box and press Enter
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Buy groceries');
  await input.press('Enter');

  // Verify the todo appears in the list
  await expect(page.getByTestId('todo-title')).toHaveText('Buy groceries');
});
```

</details>

2. Run your tests with --headed flag and watch the browser perform the actions.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
# Exercise 2 Solution:
# Simply run this command in your terminal:
npx playwright test --headed
# Watch the browser open, navigate to TodoMVC, and perform the actions!
```

</details>

### Mini-Project
Write a small test suite (3 tests) that: (1) checks the page loads, (2) adds a todo and verifies it appears, (3) marks a todo as complete and verifies the strikethrough style.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution — tests/todomvc-basics.spec.ts
import { test, expect } from '@playwright/test';

test('page loads correctly', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  await expect(page).toHaveTitle(/TodoMVC/);
  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
});

test('add a todo item', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Learn Playwright');
  await input.press('Enter');
  await expect(page.getByTestId('todo-title')).toHaveText('Learn Playwright');
});

test('complete a todo item', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Complete this task');
  await input.press('Enter');

  // Click the toggle checkbox to mark as complete
  await page.getByRole('checkbox').click();

  // Verify the todo has the completed class
  await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: This IS the progressive project step! You just wrote your first real Playwright test against TodoMVC. From this point forward, every chapter will add a new capability to this test suite.

Your project folder should now look like:
```
todomvc-automation/
├── package.json
├── node_modules/
├── tests/
│   └── first.spec.ts
└── plan.js
```

---

## 8. Interview Q&A Preparation

**Q1: What does npx playwright test do?**
* **Expected Answer:** It launches the Playwright test runner, which scans for .spec.ts files, starts browser engines, executes each test in an isolated browser context, and reports pass/fail results to the terminal.


---

## 9. Chapter Cheat Sheet
```
npm install -D @playwright/test  # Install\nnpx playwright install            # Get browsers\nnpx playwright test               # Run tests\nnpx playwright test --headed      # See browser
```