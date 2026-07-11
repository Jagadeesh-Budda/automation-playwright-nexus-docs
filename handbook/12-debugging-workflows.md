# Chapter 20: Debugging Workflows

## Metadata
* **Part**: Part 3: Advanced Playwright
* **Learning Objectives**:
  - Step through executions using the Inspector
  - Trace locator hits interactively
  - Run projects selectively
* **Prerequisites**:
  - Chapter 11: Trace Viewer & Observability
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
To write robust test flows, stepping through them interactively allows you to verify that CSS/XPath/ARIA elements are matched before continuing.

---

## 2. Conceptual Overview
Debugging in Playwright uses the Playwright Inspector, headed browser projects, and terminal console logs, helping you test selectors and step through actions in real-time.

### Execution Flow Diagram
```
[Console Script] ──► npx playwright test --debug ──► Launch Inspector ──► Step Actions
```

---

## 3. Implementation and Code Examples
```typescript
// Insert page.pause during dynamic flows
test('run inspector debugging', async ({ page }) => {
  await page.goto('/profile');
  await page.pause(); // Interactive debugger breakpoint
  await page.getByRole('button', { name: 'Edit' }).click();
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Run single tests with the --debug flag.
* Verify locator expressions inside the inspector console.

### Don't
* Do not use console.log statements as your primary debugging tool.

---

## 5. Chapter Summary
* Pause executions with page.pause to open the inspector.
* Debug selector engines directly using browser devtools terminal.
* Isolate single failing projects via targeted CLI runs.

---

## 6. Exercises & Mini-Project

### Exercises
1. Debug a test using the Playwright Inspector.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
# Run with debug flag:
npx playwright test tests/login.spec.ts --debug
# The Playwright Inspector opens. Step through each action.
# Hover over locators in the Inspector to verify they match.
```

</details>

2. Locate and fix a failing button selector in a login spec.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('fix failing login button', async ({ page }) => {
  await page.goto('/login');
  // Before: page.locator('#btn-login') — brittle ID selector
  // After: semantic role-based locator
  const loginBtn = page.getByRole('button', { name: 'Sign In' });
  await loginBtn.click();
});
```

</details>

### Mini-Project
Design a script that automatically pauses tests on assertion failures.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// Auto-pause on failure using test.afterEach hook:
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    console.log('Test failed! Pausing for inspection...');
    await page.pause(); // Opens Inspector on failure
  }
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Debug a failing todo deletion test using the Inspector:
```typescript
test("debug deletion", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Debug me");
  await input.press("Enter");
  await page.pause(); // Inspector opens here!
  // Use Inspector to verify locators before continuing
});
```

---

## 8. Interview Q&A Preparation

**Q1: What is the purpose of the --debug CLI flag?**
* **Expected Answer:** It forces headed execution, sets the test timeout to infinity, and launches the Playwright Inspector to step through the test.


---

## 9. Chapter Cheat Sheet
```
npx playwright test --debug
```