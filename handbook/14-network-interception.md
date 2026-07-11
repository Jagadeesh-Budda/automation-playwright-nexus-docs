# Chapter 22: Network Interception Patterns

## Metadata
* **Part**: Part 3: Advanced Playwright
* **Learning Objectives**:
  - Mock HTTP APIs using page.route
  - Interchange headers and bodies
  - Fulfill mock responses
* **Prerequisites**:
  - Chapter 13: Storage State & Auth Strategies
* **Estimated Reading Time**: 25 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
Mocking APIs speeds up execution and isolates layouts, but relying purely on static mocks leads to a major trap: it can mask integration errors, schema mismatches, and contract drift.

---

## 2. Conceptual Overview
Playwright supports network routing. Using page.route, you can intercept outgoing calls, mock responses, modify headers, and simulate offline scenarios. However, relying too heavily on mocks creates a major drawback: over-mocking can mask critical integration failures, schema drift (where backend API contracts change but tests continue to pass because they use stale mock data), and real environment bugs. To avoid this mocking trap, frameworks should implement contract validation (using tools like Zod to validate live mock shapes against actual schemas) and follow a balanced hybrid approach: use mocks for fast UI state testing, but run real, unmocked end-to-end integration tests nightly. When schema checks fail, report the telemetry payload to a monitoring endpoint for framework engineer diagnostics before failing the test.

### Execution Flow Diagram
```
[Browser API Call] ──► page.route() ──► [ Zod Schema Check ] ──► Return Mock Response
                                                 │
                                                 └── (Mismatched Schema) ──► Post Telemetry & Fail Test
```

---

## 3. Implementation and Code Examples
```typescript
import { test, expect } from '@playwright/test';
import { z } from 'zod';

// Schema representation to prevent contract drift
const UserProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

test('mock api with zod contract verification and logging', async ({ page }) => {
  // Setup route interception first, validating payload during resolution
  await page.route('**/api/profile', async (route) => {
    const mockPayload = { id: 1, name: 'John Doe', email: 'john@drift.com' };
    const validation = UserProfileSchema.safeParse(mockPayload);
    
    if (!validation.success) {
      // Log schema validation failure telemetry to central monitor
      await page.request.post('https://telemetry.enterprise.com/api/errors', {
        data: {
          service: 'profile-service',
          errors: validation.error.errors,
          timestamp: Date.now()
        }
      });
      await route.abort();
      throw new Error('Schema Drift Detected! Mock data does not match runtime contracts: ' + validation.error.message);
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPayload)
    });
  });
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use exact URL matching to avoid intercepting unrelated requests.
* Enforce type contract checks (like Zod or JSON Schema) to keep mocks updated.

### Don't
* Do not rely on mocked endpoints for all end-to-end integration flows.
* Never skip unmocked staging/production tests before major releases.

---

## 5. Chapter Summary
* Intercept HTTP calls with page.route to mock payloads.
* Warn against over-mocking to prevent masking integration drifts.
* Enforce Zod or JSON schema contract checks to match live APIs.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a test that intercepts an API call and returns a mock 500 status code.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('mock 500 error', async ({ page }) => {
  await page.route('**/api/data', (route) => {
    route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
  });
  await page.goto('/dashboard');
  await expect(page.getByText('Something went wrong')).toBeVisible();
});
```

</details>

2. Fulfill an API request with mock JSON data and verify it renders in the UI.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('mock product list', async ({ page }) => {
  await page.route('**/api/products', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ name: 'Widget', price: 9.99 }])
    });
  });
  await page.goto('/products');
  await expect(page.getByText('Widget')).toBeVisible();
  await expect(page.getByText('$9.99')).toBeVisible();
});
```

</details>

### Mini-Project
Build an offline mode testing simulator for an application.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
test('offline mode simulator', async ({ page }) => {
  // Load page normally first
  await page.goto('/app');
  await expect(page.getByText('Online')).toBeVisible();

  // Block all network requests to simulate offline
  await page.route('**/*', (route) => route.abort());
  await page.reload();
  await expect(page.getByText('Offline')).toBeVisible();
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Mock the TodoMVC API to simulate a pre-loaded todo list:
```typescript
test("mock pre-loaded todos", async ({ page }) => {
  // TodoMVC uses localStorage, so we inject data directly:
  await page.addInitScript(() => {
    const todos = [
      { title: "Mocked Todo 1", completed: false, id: "1" },
      { title: "Mocked Todo 2", completed: true, id: "2" }
    ];
    localStorage.setItem("react-todos", JSON.stringify(todos));
  });
  await page.goto("https://demo.playwright.dev/todomvc");
  await expect(page.getByTestId("todo-title")).toHaveCount(2);
});
```

---

## 8. Interview Q&A Preparation

**Q1: When should you use route.abort() instead of route.fulfill()?**
* **Expected Answer:** Use abort() to simulate network disruptions, connection failures, or to block heavy, non-functional third-party scripts (like analytics).


---

## 9. Chapter Cheat Sheet
```
await page.route("**/pattern", route => route.fulfill());
```