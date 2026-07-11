# Chapter 14: Navigating & Basic Actions

## Metadata
* **Part**: Part 2: Playwright Fundamentals
* **Learning Objectives**:
  - Master page navigation events
  - Differentiate action methods
  - Understand page actionability sequence
* **Prerequisites**:
  - Chapter 5: Installation & Core Architecture
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Beginner

---

## 1. Why This Matters
Page interactions require elements to meet actionability standards. If elements are hidden or blocked, actions fail, signaling design bugs.

---

## 2. Conceptual Overview
Playwright does not click blindly. For every action, it checks if the target element is attached, visible, stable, enabled, and not covered. However, a major source of flakiness in Single Page Applications (SPAs) and micro-frontends is the "Hydration click gap". In modern frontend frameworks, elements are drawn on screen quickly (Server-Side Rendered or Static HTML) but their JavaScript event handlers have not finished downloading or executing. When this occurs, the element passes all actionability checks, but the click event is lost because the click listener is not bound yet. To solve this, tests should wait for specific hydration attributes (e.g., checking data attributes like data-hydrated="true") rather than executing repetitive clicks that could trigger duplicate network requests if the button is partially bound.

### Execution Flow Diagram
```
[Element Rendered] ──► Passes Actionability (Visible/Stable) ──► Click Triggered ──► JS Event Listener Not Bound (Hydration Delay) ──► Click Lost
```

---

## 3. Implementation and Code Examples
```typescript
test('execute user interactions with hydration safety', async ({ page }) => {
  await page.goto('/form');
  
  const submitBtn = page.getByRole('button', { name: 'Submit' });
  
  // Wait for explicit hydration attribute before execution
  await expect(submitBtn).toHaveAttribute('data-hydrated', 'true', { timeout: 5000 });
  await submitBtn.click();
  
  await expect(page.getByText('Form Submitted')).toBeVisible();
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use the correct action method (.check(), .fill(), .hover()) instead of generic clicks.
* Mitigate hydration click gaps in SPAs by waiting for hydration states.

### Don't
* Do not insert arbitrary page timeouts after navigations.
* Avoid forcing clicks unless absolutely necessary.
* Do not wrap click operations in repeating toPass retry loops as they can cause duplicate submissions.

---

## 5. Chapter Summary
* Master Playwright's actionability checks (visible, stable, enabled).
* Use page.goto and direct action methods instead of blind clicks.
* Avoid hardcoded timers; leverage auto-waiting on load states.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a test that navigates to a form, fills inputs, and clicks submit.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('fill and submit a form', async ({ page }) => {
  await page.goto('/form');
  await page.getByLabel('Username').fill('testuser');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

</details>

2. Intercept navigation load states using page.waitForLoadState.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('intercept navigation states', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  console.log('Network idle — all resources loaded');
  await page.waitForLoadState('domcontentloaded');
  console.log('DOM ready');
});
```

</details>

### Mini-Project
Build an interactive form checking page and validate input states.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
test('interactive form with hydration check', async ({ page }) => {
  await page.goto('/checkout');
  const submitBtn = page.getByRole('button', { name: 'Pay Now' });
  await expect(submitBtn).toHaveAttribute('data-hydrated', 'true', { timeout: 5000 });
  await page.getByLabel('Name').fill('Alice');
  await page.getByLabel('Card').fill('4111222233334444');
  await submitBtn.click();
  await expect(page.getByText('Payment confirmed')).toBeVisible();
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Navigate to TodoMVC and add a todo using page actions:
```typescript
test("add todo using fill and keyboard", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Navigate and act");
  await input.press("Enter");
  await expect(page.getByTestId("todo-title")).toHaveText("Navigate and act");
});
```

---

## 8. Interview Q&A Preparation

**Q1: What does Playwright verify before clicking a button?**
* **Expected Answer:** It checks if the button is attached to the DOM, visible on screen, stable (not animating), enabled (not disabled), and can receive pointer events at the click coordinates.


---

## 9. Chapter Cheat Sheet
```
await page.goto("/url");
await locator.click();
```