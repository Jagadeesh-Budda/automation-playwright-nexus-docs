# Playwright Academy Cheat Sheet: Data-Driven Engineering

Quick reference for test loops parameterization, configuration project matrices, and fake data factories.

---

## 1. Test Parameterization Loop
Run the same test script against multiple data inputs dynamically:

```typescript
import { test, expect } from '@playwright/test';

const testCases = [
  { region: 'US', currency: '$' },
  { region: 'UK', currency: '£' },
  { region: 'EU', currency: '€' }
];

test.describe('Localization Checks', () => {
  for (const item of testCases) {
    test(`verify formatting for region ${item.region}`, async ({ page }) => {
      await page.goto(`/shop?locale=${item.region}`);
      await expect(page.getByTestId('price-tag')).toContainText(item.currency);
    });
  }
});
```

---

## 2. Configuration Project Matrices
Add projects inside `playwright.config.ts` to run your suite across environment matrices:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'Staging - Chrome',
      use: {
        browserName: 'chromium',
        baseURL: 'https://staging.myapp.com'
      }
    },
    {
      name: 'Production - Chrome',
      use: {
        browserName: 'chromium',
        baseURL: 'https://myapp.com'
      }
    }
  ]
});
```

---

## 3. Dynamic Data Factory Pattern
Generate isolated datasets on-demand to prevent conflict during parallel runs:

```typescript
// utils/DataFactory.ts
export class DataFactory {
  static makeUser() {
    const id = Date.now() + Math.floor(Math.random() * 100);
    return {
      username: `testuser_${id}`,
      email: `test_${id}@sandbox.com`
    };
  }
}
```

---

## 4. Key Do's and Don'ts

### Do
* Embed variables in test case names dynamically inside loop iterations (e.g. ``test(`check: ${item.region}`, ...)``).
* Generate unique emails and ids inside data factories to avoid constraint failures in parallel test executions.
* Keep large static configuration maps in external `.json` files.

### Don't
* Don't hardcode identical usernames or IDs inside tests running concurrently.
* Don't repeat the loop iteration logic *inside* a single `test` block; loop *around* the `test` declaration block to create separate run nodes.
