# Playwright Academy Cheat Sheet: Fixtures & Dependency Injection

Quick reference for extending base test scripts, implementing dependency injection, and configuring fixture lifecycles.

---

## 1. Custom baseTest Configuration
Use `test.extend` to configure pre-instantiated page objects and auto-inject them into tests.

```typescript
// fixtures/baseTest.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  // Define the loginPage fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage); // Yield the fixture to the test spec
    // Teardown steps run here after test completion
  }
});

export { expect } from '@playwright/test';
```

---

## 2. Using Extended Fixtures
```typescript
import { test, expect } from '../fixtures/baseTest';

test('verify authenticated user flow', async ({ loginPage, page }) => {
  await loginPage.navigate();
  await loginPage.login('admin@mail.com');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

---

## 3. Fixture Scoping Reference

| Scope | Lifetime | Ideal Use Case |
|---|---|---|
| **`test`** *(Default)* | Re-created for every single test spec. | Page Object models, clean browser contexts. |
| **`worker`** | Created once per worker thread process. | Database connections, global setups, API auth tokens. |

```typescript
// Declaring a worker-scoped connection
export const test = base.extend<{}, { db: DbConn }>({
  db: [async ({}, use) => {
    const conn = await initDb();
    await use(conn);
    await conn.close();
  }, { scope: 'worker' }]
});
```

---

## 4. Key Do's and Don'ts

### Do
* Extend `baseTest` to eliminate manual `new LoginPage(page)` instantiations inside specs.
* Implement cleanup steps inside fixtures after the `await use()` statement.
* Build dependency chains (e.g. `authPage` fixture importing `loginPage` to execute setups).

### Don't
* Don't modify worker-scoped shared data states inside test-level fixtures, as this breaks parallel run isolation.
* Don't write test specs that import from `@playwright/test` directly if custom fixtures are configured.
