# Chapter 30: Flaky Test Troubleshooting

## Metadata
* **Part**: Part 5: Enterprise Automation
* **Learning Objectives**:
  - Identify flaky test causes
  - Examine execution traces
  - Implement retry strategies
* **Prerequisites**:
  - Chapter 21: Playwright Test Runner Internals
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Flaky tests slow down pipelines and erode trust in automation. Finding and fixing flakes keeps CI builds reliable.

---

## 2. Conceptual Overview
Flakiness is often caused by race conditions, slow networks, or dynamic DOM states. Debugging flakes requires inspecting trace snapshots, checking API responses, and refining wait conditions. The chapter strictly forbids using page.waitForTimeout to patch flakiness. When testing asynchronous non-DOM systems, such as background worker operations, message brokers, or WebSockets, tests should use event listeners (page.waitForEvent) or poll status tables using expect.poll to wait for completion.

### Execution Flow Diagram
```
[Flaky Run] ──► Log trace ──► Inspect timeline gaps ──► Fix selector or wait gate
```

---

## 3. Implementation and Code Examples
```typescript
// 1. Wait for WebSocket message packet response instead of sleeping
const messagePromise = page.waitForEvent('websocket');
await page.getByRole('button', { name: 'Submit Query' }).click();
const ws = await messagePromise;

// 2. Poll a state database backend API status
await expect.poll(async () => {
  return await checkBackgroundJob();
}).toBe('COMPLETED');
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Inspect trace files to identify gaps in timelines.
* Ensure test assertions wait for dynamic elements to render.

### Don't
* Do not use arbitrary timeouts (page.waitForTimeout) to address flakiness.

---

## 5. Chapter Summary
* Debug race conditions by aligning assertions with state changes.
* Set up automatic retries for CI builds to handle infrastructure lag.
* Parse HTML results to isolate environment flakes from bugs.

---

## 6. Exercises & Mini-Project

### Exercises
1. Find the root cause of an intermittent assertion failure by analyzing its trace.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
// 1. Locate the test run report or trace viewer logs
// 2. Identify timelines with long gaps between actions (e.g. 5000ms idle)
// 3. Pinpoint the missing state transitions or unawaited elements.
```

</details>

2. Simulate a slow network response and verify the test handles it without failing.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('slow API network mock', async ({ page }) => {
  await page.route('**/api/data', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Delay mock response
    await route.fulfill({ status: 200, body: '{}' });
  });
  await page.goto('/dashboard');
  await expect(page.getByText('Data Loaded')).toBeVisible({ timeout: 5000 });
});
```

</details>

### Mini-Project
Create a script that parses test reports to find and tag flaky specs.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
import * as fs from 'fs';
interface TestResult { title: string; status: 'passed' | 'failed' | 'flaky'; }
function tagFlakes(results: TestResult[]) {
  return results.filter(r => r.status === 'flaky').map(r => r.title);
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Diagnose a flaky toggle test by checking for element stability gates:
```typescript
test("stable toggle check", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Flake fix");
  await input.press("Enter");

  const checkbox = page.getByRole("checkbox");
  // Ensure element is fully stable and visible before check
  await expect(checkbox).toBeVisible();
  await checkbox.click();
  await expect(page.getByTestId("todo-item")).toHaveClass(/completed/);
});
```

---

## 8. Interview Q&A Preparation

**Q1: How do you fix a flaky check caused by dynamic data loading?**
* **Expected Answer:** Replace hardcoded delays with Web-First assertions (like expect().toBeVisible()) or wait explicitly for network events.


---

## 9. Chapter Cheat Sheet
```
npx playwright test --retries=2
```