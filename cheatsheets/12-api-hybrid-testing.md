# Playwright Academy Cheat Sheet: API & Hybrid Testing

Quick reference for direct API HTTP calls, authentication state cookies injection, and network response intercept mocking.

---

## 1. Direct API Request Context
Execute requests separate from the browser process context:

```typescript
import { test, expect } from '@playwright/test';

test('verify api creation', async ({ request }) => {
  const res = await request.post('/api/items', {
    data: { name: 'Automation Item' },
    headers: { 'Authorization': 'Bearer test-token' }
  });

  expect(res.status()).toBe(201);
  const data = await res.json();
  expect(data.id).toBeDefined();
});
```

---

## 2. Authentication Storage State Injection
Execute authentication once in a global setup hook or a specialized pre-test stage, write cookies to a JSON file, and load them to bypass UI login:

```typescript
// 1. Authenticate and save state
await page.context().storageState({ path: 'playwright/.auth/user.json' });

// 2. Load storageState in config
// playwright.config.ts
export default defineConfig({
  use: {
    storageState: 'playwright/.auth/user.json',
  }
});
```

To clean auth state for single files:
```typescript
// Overwrite state locally in spec file
test.use({ storageState: { cookies: [], origins: [] } });
```

---

## 3. Network Response Interception (`page.route()`)
Intercept browser requests and mock responses:
```typescript
await page.route('**/api/products', async (route) => {
  const mockPayload = [
    { id: 1, name: 'Mock Laptop', price: 999 },
    { id: 2, name: 'Mock Phone', price: 499 }
  ];
  
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockPayload)
  });
});
```

---

## 4. Key Do's and Don'ts

### Do
* Use `globalSetup` to perform authentication once and share the `storageState.json` file across parallel threads.
* Match URL intercepts as strictly as possible (avoid generic search matching patterns like `**/*` which capture all network requests).
* Return correct mock headers and content types inside `route.fulfill()`.

### Don't
* Don't commit the generated `storageState.json` authentication token files into git repositories.
* Don't duplicate login form input steps inside every UI spec file.
