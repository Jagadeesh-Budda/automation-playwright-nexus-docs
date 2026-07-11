# Playwright Academy Cheat Sheet: Synchronization & Timeouts

Quick reference for managing timeouts, actionability checks, and asynchronous network sync.

---

## 1. Actionability Checklist
Before any action (e.g. click, fill), Playwright checks that the element is:
1. **Attached** to the DOM.
2. **Visible** (non-empty bounding box, not display:none).
3. **Stable** (animations completed).
4. **Enabled** (not disabled).
5. **Editable** (not read-only, for inputs).
6. **Receives Events** (not covered by modal overlay backdrop).

---

## 2. Timeout Configurations

| Timeout Name | Scope | Default | Config File Path |
|---|---|---|---|
| **Test Timeout** | Limit for a single test run | 30,000ms | `timeout: 30000` |
| **Assertion Timeout** | Web-First polling assertions limit | 5,000ms | `expect: { timeout: 5000 }` |
| **Action Timeout** | Actionability check polling limit | No Limit | `use: { actionTimeout: 10000 }` |
| **Navigation Timeout** | Page load resolution limit | No Limit | `use: { navigationTimeout: 15000 }` |

---

## 3. Network Synchronization Patterns
```typescript
// Pattern 1: Wait for a specific background API response on click
const [response] = await Promise.all([
  page.waitForResponse(res => res.url().includes('/api/checkout') && res.status() === 200),
  page.getByRole('button', { name: 'Submit' }).click()
]);

// Pattern 2: Wait for loading spinner to appear and disappear
await expect(page.getByRole('progressbar')).toBeVisible();
await expect(page.getByRole('progressbar')).toBeHidden({ timeout: 10000 });
```

---

## 4. Key Do's and Don'ts

### Do
* Configure explicit `actionTimeout` and `navigationTimeout` limits inside `playwright.config.ts` to fail fast.
* Wait for loading progress bars/spinners to disappear after clicking pagination controls.
* Use `Promise.all` when coordinate page events (like popup openings) triggered by button clicks.

### Don't
* Don't use `page.waitForTimeout(ms)` to solve synchronization failures.
* Don't configure an action timeout that exceeds the overall test timeout.
