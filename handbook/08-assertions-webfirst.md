# Chapter 16: Web-First Assertions

## Metadata
* **Part**: Part 2: Playwright Fundamentals
* **Learning Objectives**:
  - Master Web-First assertions polling rules
  - Implement soft assertions
  - Configure polling loops using expect.poll
* **Prerequisites**:
  - Chapter 7: Locators & Selector Engines
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Beginner

---

## 1. Why This Matters
Using assertions that do not retry leads to race conditions. Web-First assertions wait for elements to match, ensuring robust tests.

---

## 2. Conceptual Overview
Playwright introduces Web-First assertions. By passing locators directly to expect, assertions automatically check conditions in a loop until the state matches or the timeout limit is reached. For checking background server tasks, databases, or REST APIs that update outside the DOM, expect.poll allows running real asynchronous checks continuously.

### Execution Flow Diagram
```
expect(loc).toBeVisible() ──► Check DOM ──► Match? ──► YES ──► Pass
                                 │
                                 ▼ (NO)
                              Retry (up to 5s) ──► Timeout ──► Fail
```

---

## 3. Implementation and Code Examples
```typescript
// Asynchronous database state verification using API polling
await expect.poll(async () => {
  const response = await page.request.get('/api/job-status/456', {
    headers: {
      'Authorization': 'Bearer token123',
      'Accept': 'application/json'
    }
  });
  if (response.status() !== 200) {
    throw new Error('API server returned error code: ' + response.status());
  }
  const result = await response.json();
  return result.status;
}, {
  timeout: 10000,
  intervals: [1000, 2000]
}).toBe('SUCCESS');
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Always pass locator objects directly to expect().
* Use expect.soft() when validating secondary elements.

### Don't
* Avoid assertions against static variables, e.g. expect(await loc.isVisible()).toBe(true).

---

## 5. Chapter Summary
* Pass locator objects directly to expect for auto-retry validations.
* Use expect.soft to track secondary failures without halting runs.
* Configure expect.poll to wait dynamically for database/API states.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a validation suite using expect.soft to inspect card layout details.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('soft assert card layout', async ({ page }) => {
  await page.goto('/dashboard');
  const card = page.locator('.product-card').first();
  await expect.soft(card.getByRole('img')).toBeVisible();
  await expect.soft(card.getByRole('heading')).toHaveText(/.+/);
  await expect.soft(card.getByText('$')).toBeVisible();
});
```

</details>

2. Configure expect.toPass to repeat a refresh action until a result appears.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('wait for data refresh', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(async () => {
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByTestId('result')).toHaveText(/data-loaded/);
  }).toPass({ timeout: 15000, intervals: [1000, 2000] });
});
```

</details>

### Mini-Project
Build a dashboard checker page with soft assertions.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
test('dashboard soft assertion checker', async ({ page }) => {
  await page.goto('/dashboard');
  const cards = page.locator('.dashboard-card');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    await expect.soft(cards.nth(i).getByRole('heading')).toBeVisible();
    await expect.soft(cards.nth(i).getByText('$')).toBeVisible();
  }
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Assert todo count and visibility using Web-First assertions:
```typescript
test("verify todo state with assertions", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Learn assertions");
  await input.press("Enter");

  // Web-First: auto-retries until condition matches
  await expect(page.getByTestId("todo-title")).toHaveText("Learn assertions");
  await expect(page.getByTestId("todo-title")).toHaveCount(1);
  await expect(page.getByText("1 item left")).toBeVisible();
});
```

---

## 8. Interview Q&A Preparation

**Q1: What is the main benefit of Web-First assertions over basic assertions?**
* **Expected Answer:** Web-First assertions auto-retry. They query the element state continuously up to a timeout, resolving race conditions when elements render asynchronously.


---

## 9. Chapter Cheat Sheet
```
await expect(locator).toBeVisible();
```