# Chapter 15: Locators & Selector Engines

## Metadata
* **Part**: Part 2: Playwright Fundamentals
* **Learning Objectives**:
  - Apply the Locator Priority Ladder rules
  - Chain locators effectively
  - Resolve strict mode violations cleanly
* **Prerequisites**:
  - Chapter 6: Navigating & Basic Actions
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Beginner

---

## 1. Why This Matters
Writing fragile CSS or XPath selectors leads to flaky tests. Accessibility-first locators make your test suite highly resilient to layout changes.

---

## 2. Conceptual Overview
Locators are queries that search the page. They are lazily evaluated: they do not query the DOM when created, but run when an action is called. They automatically retry if the DOM updates, eliminating stale element exceptions. In design, you should construct chained queries starting from an accessible container role to avoid brittle layout selections.

### Execution Flow Diagram
```
Test Code ──► Locator Created ──► .click() Action ──► DOM Search Executed ──► Action Completed
                  │
                  ▼
          (Lazy Evaluation)
```

---

## 3. Implementation and Code Examples
```typescript
// Locators chaining following the priority accessibility ladder
const checkoutForm = page.getByRole('form', { name: 'Checkout' });
const creditCardInput = checkoutForm.getByRole('textbox', { name: 'Credit Card Number' });
await creditCardInput.fill('4111222233334444');
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Query using accessible roles (getByRole) first.
* Filter list items using .filter() based on text content.

### Don't
* Avoid using raw index numbers like .nth(0) for dynamic lists.
* Do not write long CSS paths or brittle XPaths.

---

## 5. Chapter Summary
* Follow the Locator Priority Ladder (getByRole, getByLabel, etc.).
* Rely on lazy evaluation: queries run only when actions execute.
* Solve strict mode violations by narrow chaining or filtering.

---

## 6. Exercises & Mini-Project

### Exercises
1. Refactor a selector path from an XPath string to a semantic getByRole locator.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
// Before (XPath):
// page.locator('//div[@class="main"]/ul/li[1]/button');

// After (semantic getByRole):
const editBtn = page.getByRole('listitem').first().getByRole('button', { name: 'Edit' });
```

</details>

2. Create a nested search loop that clicks edit buttons inside dynamic table rows.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('click edit on each table row', async ({ page }) => {
  const rows = page.getByRole('row');
  const count = await rows.count();
  for (let i = 1; i < count; i++) {
    const row = rows.nth(i);
    await row.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
  }
});
```

</details>

### Mini-Project
Write a script that sweeps a product listing page and compiles prices.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
test('sweep product prices', async ({ page }) => {
  await page.goto('/products');
  const prices = await page.getByRole('listitem').allTextContents();
  const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
  console.log('All prices:', numericPrices);
  console.log('Total:', numericPrices.reduce((a, b) => a + b, 0));
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Locate todos using semantic locators and chaining:
```typescript
test("locate todos with getByRole", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Task A");
  await input.press("Enter");
  await input.fill("Task B");
  await input.press("Enter");

  // Locate by test ID
  const todos = page.getByTestId("todo-title");
  await expect(todos).toHaveCount(2);

  // Filter to find specific todo
  const taskB = page.getByRole("listitem").filter({ hasText: "Task B" });
  await expect(taskB).toBeVisible();
});
```

---

## 8. Interview Q&A Preparation

**Q1: Why are locators called "lazy" in Playwright?**
* **Expected Answer:** Locators do not query the browser when declared. They only search the DOM when an action (like click or fill) is executed, ensuring the latest page state is queried.


---

## 9. Chapter Cheat Sheet
```
const btn = page.getByRole("button", { name: "Save" });
```