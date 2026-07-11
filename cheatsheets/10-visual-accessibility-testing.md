# Playwright Academy Cheat Sheet: Visual & Accessibility Testing

Quick reference for visual snapshot comparison testing, element masking, and automated WCAG accessibility audits.

---

## 1. Visual Testing (Snapshots)
Playwright captures a baseline on first run and asserts pixel equivalence on subsequent runs.

```typescript
import { test, expect } from '@playwright/test';

test('verify home layout screenshots', async ({ page }) => {
  await page.goto('/');
  // Full page visual comparison
  await expect(page).toHaveScreenshot('home-layout.png');
});
```

### Masking Dynamic Content
Exclude dynamic page segments (clocks, username banners, dynamic grids) from regression checks:
```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.getByTestId('live-chart'),
    page.getByRole('heading', { name: /welcome/i })
  ]
});
```

---

## 2. Accessibility Auditing (Axe-Builder)
Integrate `@axe-core/playwright` to run automated WCAG audits:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('accessibility scan', async ({ page }) => {
  await page.goto('/form');
  
  // Perform WCAG 2.1 AA audit scan
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag21aa'])
    .analyze();

  expect(results.violations.length).toBe(0);
});
```

### Scoping Scans to Elements
```typescript
const componentResults = await new AxeBuilder({ page })
  .include('.checkout-card') // Scope scan to component classes
  .analyze();
```

---

## 3. Key Do's and Don'ts

### Do
* Run visual test suites inside identical environments (e.g. Docker containers) to prevent cross-OS subpixel font differences.
* Set explicit targets for WCAG audits (`withTags`) to align with project requirements.
* Scope accessibility scans to specific modules during component level checks.

### Don't
* Don't run visual comparison checks without masks on pages that contain real-time timestamps.
* Don't neglect visual baselines updates on design refactors (`npx playwright test --update-snapshots`).
