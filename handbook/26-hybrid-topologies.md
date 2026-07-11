# Chapter 34: Hybrid Testing Topologies

## Metadata
* **Part**: Part 6: API Testing
* **Learning Objectives**:
  - Combine API and UI flows
  - Seed page state using API calls
  - Inject auth states
* **Prerequisites**:
  - Chapter 25: APIRequestContext & HTTP Calls
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Using the UI for every setup step (like creating a user just to check a profile edit) slows down runs. Hybrid flows speed this up.

---

## 2. Conceptual Overview
Hybrid testing combines direct API calls with UI interactions. You use APIs to handle prerequisites (like creating items or authenticating) and use the browser page only to verify the target layout. In hybrid setups, the session handshake is critical: you must extract the authentication token directly from the API response and inject it as a cookie (or localStorage item) into the browser context before attempting page navigation, bypassing UI login forms completely. Make sure the domain cookie parameter is resolved dynamically based on environment configuration URL targets to prevent injection rejects across pipelines.

### Execution Flow Diagram
```
[API Call to /login] ──► Extract Session Token ──► addCookies(Token) ──► goto(/dashboard)
```

---

## 3. Implementation and Code Examples
```typescript
test('edit product details via hybrid setup', async ({ request, page }) => {
  // 1. Authenticate via API and fetch auth token
  const authRes = await request.post('/api/auth/login', {
    data: { user: 'admin', pass: 'secret' }
  });
  const { sessionToken } = await authRes.json();

  // 2. Session Handshake: Resolve environment URL target and inject cookie dynamically
  const targetUrl = process.env.BASE_URL || 'https://staging.enterprise.com';
  const domainHost = new URL(targetUrl).hostname;

  await page.context().addCookies([{
    name: 'auth_token',
    value: sessionToken,
    domain: domainHost,
    path: '/'
  }]);

  // 3. Navigate directly to product details page in the UI
  await page.goto('/products/edit/123');
  await page.getByLabel('Name').fill('Office Chair');
  await page.getByRole('button', { name: 'Save' }).click();
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use direct API requests to handle test prerequisites.
* Inject session cookies directly into contexts to bypass login pages.

### Don't
* Do not use UI steps for setups when API options are available.

---

## 5. Chapter Summary
* Perform authentication or resource seeding via HTTP requests.
* Navigate directly to test target views using seeded session tokens.
* Minimize browser execution time to optimize pipeline speed.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a test that registers a user via an API and logs them in via the UI.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('hybrid login test', async ({ request, page }) => {
  const res = await request.post('/api/login', { data: { user: 'a', pass: 'b' } });
  const { token } = await res.json();
  await page.context().addCookies([{ name: 'session', value: token, domain: 'localhost', path: '/' }]);
  await page.goto('/dashboard');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

</details>

2. Verify cart checkout layouts by seeding the cart using API requests first.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('seed cart before loading page', async ({ request, page }) => {
  await request.post('/api/cart/add', { data: { item: 'Widget', qty: 2 } });
  await page.goto('/cart');
  await expect(page.getByTestId('cart-total')).toHaveText('$19.98');
});
```

</details>

### Mini-Project
Build a hybrid checkout suite with API setup stages.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
test('hybrid checkout test', async ({ request, page }) => {
  const auth = await request.post('/api/auth');
  // Inject cookies dynamically based on config URL hostname
  await page.goto('/checkout');
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Seed todo items via API context simulation, then navigate in the UI:
```typescript
test("hybrid todo validation", async ({ request, page }) => {
  // TodoMVC has no API backends, so session/state is client-side.
  // For hybrid tests, we configure request options and initialize page cookies first.
  await page.goto("https://demo.playwright.dev/todomvc");
  // Proceed to check elements
});
```

---

## 8. Interview Q&A Preparation

**Q1: What is the main benefit of hybrid testing?**
* **Expected Answer:** It speeds up test suites. By using APIs to handle setup steps, tests focus their browser execution time on verifying the target user actions.


---

## 9. Chapter Cheat Sheet
```
const data = await (await request.post("/url")).json();
```