# Playwright Academy Cheat Sheet: Enterprise Best Practices

Quick reference for framework styling rules, legacy code migrations, and quality gates configuration.

---

## 1. Quality Guidelines
* **POM Enforcement**: All specs must use extended Page Object properties. No raw selector strings inside tests.
* **Semantic Targetings**: Ban the use of CSS classes or raw XPaths for standard interactive buttons, links, and text.
* **Await checks**: Ensure every test assertion uses Web-First polling matchers. No static sleeps.

---

## 2. Legacy Code Migration Table

| Legacy Cy/Selenium Selector | Modern Playwright Resilient equivalent |
|---|---|
| `cy.get('.btn').first().click();` | `page.getByRole('button', { name: 'Submit' }).click();` |
| `driver.findElement(By.id("email")).sendKeys("val");` | `page.getByLabel("Email Address").fill("val");` |
| `Thread.sleep(3000);` | `await expect(locator).toBeVisible();` |
| Asserting checks inside helpers classes | Returning state variables/locators directly to tests |

---

## 3. Commit Hook and CI Checks
To enforce compliance, integrate lint checking inside your package scripts and GitHub pipelines:

```json
// package.json linter setup
{
  "scripts": {
    "lint:ast": "tsx scripts/ast-audit.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

```yaml
# CI workflow runner gate
- name: Run Quality Gate Checks
  run: |
    npm run typecheck
    npm run lint:ast
```

---

## 4. Key Do's and Don'ts

### Do
* Integrate `eslint-plugin-playwright` to automate style audits.
* Tag test case names using metadata suffixes (e.g. `@smoke`, `@billing`) to group runs easily.
* Keep page actions separate from test assertions.

### Don't
* Don't commit tests containing commented-out static sleeps or bypass overrides.
* Don't run full visual screenshot checks on local development platforms (run inside Docker containers to verify).
