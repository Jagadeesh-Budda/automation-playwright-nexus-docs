# Playwright Academy Cheat Sheet: Core Automation & Runs

Quick reference for test initialization, runner execution, CLI switches, and debugging workflows.

---

## 1. Syntax Template
```typescript
import { test, expect } from '@playwright/test';

test('verify page interaction', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

## 2. CLI Execution Switches

| Command | Action |
|---|---|
| `npx playwright test` | Runs all tests in headless mode across all projects |
| `npx playwright test --headed` | Runs tests with visible browser windows |
| `npx playwright test --project=chromium` | Runs tests exclusively inside Chromium |
| `npx playwright test tests/login.spec.ts` | Executes tests in the specified spec file |
| `npx playwright test --grep "@smoke"` | Runs tests containing the tag `@smoke` in their name |
| `npx playwright show-report` | Launches the local server to display HTML run reports |
| `npx playwright test --ui` | Opens the UI Mode runner for trace debugging |

---

## 3. Debugging Commands
* **Playwright Inspector**: Pauses execution at a specific step in headed mode.
  ```typescript
  await page.pause();
  ```
* **Debug Script**: Run tests with debug logs enabled directly.
  ```bash
  npx playwright test --debug
  ```

---

## 4. Key Do's and Don'ts

### Do
* Run single files or single projects using CLI flags to speed up local debugging sessions.
* Check HTML execution reports to review visual traces and screenshots of failed runs.
* Use UI Mode (`--ui`) for time-travel debugging and inspecting API network payloads.

### Don't
* Don't commit `page.pause()` debug statements to master branches.
* Don't run headed mode across all browser projects concurrently (use `--project`).
