# Playwright Academy Cheat Sheet: Test Orchestration & CI/CD

Quick reference for GitHub Actions pipelines, Docker container execution, and test reporting.

---

## 1. GitHub Actions Pipeline Schema
```yaml
# .github/workflows/ci.yml
name: Playwright CI
on: [push, pull_request]

jobs:
  run-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
```

---

## 2. Docker Container CLI Run
Execute test suites inside a standardized Docker container environment:

```bash
# Pull official image
docker pull mcr.microsoft.com/playwright:v1.44.0-jammy

# Run the test suite inside the container
docker run --rm -v $(pwd):/work/ -w /work/ mcr.microsoft.com/playwright:v1.44.0-jammy npx playwright test
```

---

## 3. Configuration Properties

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Configure parallel workers inside CI vs Local
  workers: process.env.CI ? 2 : undefined,
  // Retries on CI runs only
  retries: process.env.CI ? 2 : 0,
  // Reporter setups
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results/junit.xml' }]
  ]
});
```

---

## 4. Key Do's and Don'ts

### Do
* Configure `retries` specifically for CI runs to reduce flakiness from minor network glitches.
* Limit CI worker threads (e.g. to 2) to prevent host server resource starvation.
* Output JUnit reports in CI to integrate test statistics dashboards.

### Don't
* Don't commit hardcoded API keys or passwords to repository branches; use secrets configuration variables.
* Don't execute visual comparison screenshots on local development OS environments without using Docker context.
