# Playwright Academy Cheat Sheet: Test Organization & POM

Quick reference for describe blocks, execution hooks, and Page Object Model structure.

---

## 1. Structure Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Suite', () => {
  // Hooks
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('executes action', async ({ page }) => {
    // Test code
  });
});
```

---

## 2. Page Object Model Template
```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly userInput: Locator;
  readonly loginBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    // Locators as properties, resolved lazily
    this.userInput = page.getByLabel('Username');
    this.loginBtn = page.getByRole('button', { name: 'Log In' });
  }

  // Workflows (business actions)
  async navigate() {
    await this.page.goto('/login');
  }

  async login(user: string) {
    await this.userInput.fill(user);
    await this.loginBtn.click();
  }
}
```

---

## 3. Reference Table

| Setup Hook | Scope | Execution Timing |
|---|---|---|
| `test.beforeAll` | Describe Block | Runs once before any tests start |
| `test.beforeEach` | Individual Test | Runs before every single test |
| `test.afterEach` | Individual Test | Runs immediately after every test completes |
| `test.afterAll` | Describe Block | Runs once after all tests in the block finish |

---

## 4. Key Do's and Don'ts

### Do
* Declare locators as `readonly` class properties inside constructors.
* Return state indicators or locators from POM methods, letting the test spec assert outcomes.
* Structure page objects to mirror the user's business workflows (e.g. `.login()`).

### Don't
* Don't include `expect()` statements inside Page Object helper methods.
* Don't declare locators as methods (e.g. `getBtn() { return this.page.locator(...) }`) because this recreates the locator on every call.
* Don't share runtime state variables between tests inside hooks.
