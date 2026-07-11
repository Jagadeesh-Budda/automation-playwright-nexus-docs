# Chapter 11: Asynchronous JS: Promises & Event Loop

## Metadata
* **Part**: Part 1: JavaScript & TypeScript for Automation
* **Learning Objectives**:
  - Understand JavaScript single-threaded event loop
  - Master Promises states
  - Implement async/await configurations
* **Prerequisites**:
  - Chapter 2: Functions, Closures, and Callbacks
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
Web automation actions are asynchronous network calls. Forgetting to await a Playwright execution returns a pending Promise, causing the test to pass or fail prematurely.

---

## 2. Conceptual Overview
JavaScript is a single-threaded execution runtime. It handles concurrent operations by delegating tasks via Promises. In Playwright, it is vital to understand the execution boundary:

1. Execution Boundary:
- Node.js Process: Runs your test script, manages configuration, runs assertions, and schedules queues.
- Browser Process (Chromium/Webkit): Renders the web application page under test.
- Communication Bridge: Node.js and the browser communicate asynchronously over a WebSocket connection using the Chrome DevTools Protocol (CDP).

2. The Async/Await Queue:
- When you invoke await page.click(), Node.js sends the click command over the WebSocket connection to the browser and registers a pending Promise. The Event Loop suspends the next line in Node.js until the browser signals that the click completed, which resolves the Promise. If you omit await, Node.js fires the event over the socket and immediately continues to the next line before the browser can execute the operation, causing runtime sync failures.

### Execution Flow Diagram
```
[Call Stack (Node.js Test Runner)]  ──► Send Command via CDP WebSocket ──► [Browser Process]
     ▲                                                                           │
     │                                                                           ▼
[Event Loop] ◄── [Queue (Microtasks)] ◄── Promise resolves/rejects ◄────── Execute page action
```

---

## 3. Implementation and Code Examples
```typescript
// ✅ Recommended Asynchronous Execution
test('verify details page', async ({ page }) => {
  await page.goto('/dashboard');
  const detailsBtn = page.getByRole('button', { name: 'Details' });
  await detailsBtn.click(); // Pauses Node.js execution thread until browser completes the click
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Precede every browser action with the await keyword.
* Return Promises from helper functions that interact with the page.

### Don't
* Never omit await on assertions or page actions.
* Avoid using .then() and async/await syntax in the same code block.

---

## 5. Chapter Summary
* Understand that JS is single-threaded and delegates async tasks via the Event Loop.
* Always prepend asynchronous page interactions with the await keyword.
* Differentiate pending, fulfilled, and rejected promise states in assertions.

---

## 6. Exercises & Mini-Project

### Exercises
1. Fix a test that exits instantly because page.goto is not awaited.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('fix unawaited goto', async ({ page }) => {
  // Before (broken): page.goto('/dashboard'); — exits instantly
  // After (fixed):
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/dashboard/);
});
```

</details>

2. Write a custom async function that waits for an API call and verify the result.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
async function waitForApiResult(page: Page, endpoint: string) {
  const response = await page.request.get(endpoint);
  const data = await response.json();
  return data;
}

test('verify API data', async ({ page }) => {
  const result = await waitForApiResult(page, '/api/status');
  expect(result.status).toBe('healthy');
});
```

</details>

### Mini-Project
Build a custom promise-based wait utility that checks system state.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
async function waitForCondition(
  checkFn: () => Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 500
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkFn()) return;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Condition not met within ' + timeoutMs + 'ms');
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Understand why `await` is required for every Playwright action:
```typescript
test("add todo with proper awaits", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Learn async/await"); // Must await!
  await input.press("Enter");            // Must await!
  // Without await, the test would exit before the browser acts
});
```

---

## 8. Interview Q&A Preparation

**Q1: Why does forgetting await on a page action cause flaky tests?**
* **Expected Answer:** Without await, the test runner proceeds to the next line immediately. The target element might not be located, clicked, or verified in time before the browser context is torn down.


---

## 9. Chapter Cheat Sheet
```
async function run() { await page.click(); }
```