# Chapter 17: Test Organization & Hooks

## Metadata
* **Part**: Part 2: Playwright Fundamentals
* **Learning Objectives**:
  - Create describe scopes
  - Implement lifecycle hooks
  - Configure serial and parallel run settings
* **Prerequisites**:
  - Chapter 8: Web-First Assertions
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Beginner

---

## 1. Why This Matters
Correct test grouping isolates specs, shares preconditions cleanly, and ensures tests run safely in parallel.

---

## 2. Conceptual Overview
Use test.describe blocks to group related tests. Lifecycle hooks (beforeAll, beforeEach, afterEach, afterAll) set up preconditions and clean up environments, keeping tests decoupled.

### Execution Flow Diagram
```
[describe Block]
   ├── test.beforeEach() ──► test A ──► test.afterEach()
   └── test.beforeEach() ──► test B ──► test.afterEach()
```

---

## 3. Implementation and Code Examples
```typescript
test.describe('Payment Funnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout');
  });

  test('validate credit card input', async ({ page }) => {
    const cardInput = page.getByRole('textbox', { name: 'Card Details' });
    await cardInput.fill('4111222233334444');
    console.log('Action complete: card number filled.');
  });
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Group tests by feature areas.
* Declare beforeEach hooks to navigate to base URLs.

### Don't
* Do not share runtime data states across tests.
* Avoid running tests serially unless strictly necessary.

---

## 5. Chapter Summary
* Group related tests inside describe blocks.
* Use hook lifecycles (beforeEach, afterAll) to isolate setups.
* Enforce serial or parallel structures depending on data dependence.

---

## 6. Exercises & Mini-Project

### Exercises
1. Create a nested describe block mapping cart addition and payment actions.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test.describe('Cart', () => {
  test.describe('Add to Cart', () => {
    test('add single item', async ({ page }) => {
      await page.goto('/products');
      await page.getByRole('button', { name: 'Add' }).first().click();
      await expect(page.getByTestId('cart-count')).toHaveText('1');
    });
  });

  test.describe('Payment', () => {
    test('enter card details', async ({ page }) => {
      await page.goto('/checkout');
      await page.getByLabel('Card').fill('4111222233334444');
    });
  });
});
```

</details>

2. Set a custom timeout for a single test block.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('slow operation with custom timeout', async ({ page }) => {
  test.setTimeout(60000); // 60 second timeout for this test only
  await page.goto('/long-process');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Done')).toBeVisible({ timeout: 55000 });
});
```

</details>

### Mini-Project
Construct a state isolation wrapper for parallel tests.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
test.describe('Isolated State Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    // Each test starts fresh due to isolated BrowserContext
  });

  test('user A actions', async ({ page }) => {
    await page.getByLabel('Name').fill('User A');
  });

  test('user B actions', async ({ page }) => {
    // No contamination from User A's state
    await expect(page.getByLabel('Name')).toHaveValue('');
  });
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Organize TodoMVC tests into describe blocks with beforeEach navigation:
```typescript
test.describe("TodoMVC CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://demo.playwright.dev/todomvc");
  });

  test("add todo", async ({ page }) => {
    const input = page.getByPlaceholder("What needs to be done?");
    await input.fill("Organized test");
    await input.press("Enter");
    await expect(page.getByTestId("todo-title")).toHaveText("Organized test");
  });

  test("delete todo", async ({ page }) => { /* ... */ });
});
```

---

## 8. Interview Q&A Preparation

**Q1: Why should global variables be avoided in describe blocks?**
* **Expected Answer:** Since Playwright runs tests in parallel across separate workers, modifying a shared outer variable in one test will corrupt the state in another, causing intermittent failures.


---

## 9. Chapter Cheat Sheet
```
test.describe("Group Name", () => { ... });
```