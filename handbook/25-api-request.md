# Chapter 33: APIRequestContext & HTTP Calls

## Metadata
* **Part**: Part 6: API Testing
* **Learning Objectives**:
  - Perform API requests using the request fixture
  - Validate API response states
  - Set up token headers
* **Prerequisites**:
  - Chapter 24: Test Data Management
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
API testing is faster than UI testing. Using direct API requests validates service layers and speeds up test setups.

---

## 2. Conceptual Overview
Using Playwright APIRequestContext, you can trigger HTTP calls directly inside your tests. This is useful for validating backend APIs and setting up test states.

### Execution Flow Diagram
```
[request Fixture] ──► HTTP POST request ──► API Server ──► Validate Status 200
```

---

## 3. Implementation and Code Examples
```typescript
test('verify API product creation', async ({ request }) => {
  const res = await request.post('/api/products', {
    data: { name: 'Wireless Mouse', price: 29.99 }
  });
  expect(res.status()).toBe(201);
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use the built-in request fixture for direct API calls.
* Verify status codes and response JSON payloads.

### Don't
* Do not use page-based routing to test standalone backend API endpoints.

---

## 5. Chapter Summary
* Trigger HTTP requests directly using request context.
* Verify server JSON payloads and response header configurations.
* Create hybrid setups combining UI flows and API verifications.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a POST request that registers a user and assert the response data.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('verify post user request', async ({ request }) => {
  const res = await request.post('/api/users', {
    data: { name: 'Alice', email: 'alice@test.com' }
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.id).toBeDefined();
});
```

</details>

2. Create an API test that validates error payloads on bad requests.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('bad request validator', async ({ request }) => {
  const res = await request.post('/api/users', { data: {} }); // Missing fields
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toContain('Validation failed');
});
```

</details>

### Mini-Project
Build a schema validator client for backend services.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
import { z } from 'zod';
const Schema = z.object({ status: z.string(), code: z.number() });
async function validateApi(response: any) {
  const data = await response.json();
  return Schema.safeParse(data).success;
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Use the `request` APIRequestContext to fetch the current app status and verify localStorage state:
```typescript
test("api status check", async ({ request }) => {
  const res = await request.get("https://demo.playwright.dev/todomvc");
  expect(res.status()).toBe(200);
});
```

---

## 8. Interview Q&A Preparation

**Q1: How is the request fixture isolated from the page context?**
* **Expected Answer:** The request fixture operates as a standalone HTTP client. It does not load page assets (HTML, CSS) or run browser engines, making it fast and lightweight.


---

## 9. Chapter Cheat Sheet
```
await request.get("/api/endpoint");
```