# Playwright Academy Cheat Sheet: Interview & Portfolio Projects

Quick reference for system design whiteboard architectures, domain patterns, and code review checkpoints.

---

## 1. System Design Whiteboard Checklist
When designing test architecture in senior interviews, structure your explanation around these layers:

1. **Environment Setup & Configuration**: BASE_URL configuration, browser context settings, parallel worker threads configuration.
2. **Data Orchestration**: Database seeding scripts, API setup routes, data isolated factories.
3. **Execution Pipeline**: Headless docker container containers, CI runner triggers (GitHub Actions).
4. **Telemetry & Artifacts**: Trace file captures, visual screenshots, JUnit metrics reporting.

---

## 2. Industry Domain Automation Patterns

### Retail Banking Portal
* **Challenges**: MFA OTP checks, dynamic transaction ledger state variations.
* **Resilient Approach**: Intercept OTP verify calls using `page.route()`, verify balance math before/after transfer transactions using content-based row filters:
  ```typescript
  const row = page.getByRole('row').filter({ hasText: 'Savings' });
  const val = await row.getByRole('cell').nth(2).textContent();
  ```

### E-Commerce Cart Checkout
* **Challenges**: Dynamic stock quantities, card authorization modal states.
* **Resilient Approach**: Wait for spinner/progressbar invisibility after order submission, select card inputs using accessibility labels:
  ```typescript
  await page.getByLabel('Card Number').fill('4111222233334444');
  await expect(page.getByRole('progressbar')).toBeHidden({ timeout: 15000 });
  ```

---

## 3. Portfolio Repository Checklist
Before publishing a repository:
* **0 compilation errors**: Confirm clean runs of `npx tsc --noEmit`.
* **Zero static sleeps**: Double check that no files contain `page.waitForTimeout()`.
* **Zero hardcoded credentials**: All keys and credentials must load from environment parameters (`process.env`).
* **Semantic locators**: Ensure Page Objects use `getByRole()` & friends as a priority.

---

## 4. Key Do's and Don'ts

### Do
* Mock external network integrations (third-party payment/OTP gates) to keep runs fast.
* Group Page Objects inside components folders using page composition rules.
* Save execution trace attachments on CI failures for debugging.

### Don't
* Don't use indexing `.first()` or `.nth()` to select items in sorted lists.
* Don't mix test validation assertions (`expect()`) inside Page Object helper files.
