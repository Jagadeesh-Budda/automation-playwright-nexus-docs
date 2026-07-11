# Chapter 36: Docker & Cloud Execution

## Metadata
* **Part**: Part 7: CI/CD & Infrastructure
* **Learning Objectives**:
  - Run tests in Playwright Docker containers
  - Match local and CI execution states
  - Execute visual screenshot assertions
* **Prerequisites**:
  - Chapter 27: Reporting Ecosystems
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Tests passing locally can fail in CI due to OS-specific subpixel font rendering variations. Running tests and assertions inside Docker solves this, ensuring visual regression tests remain stable.

---

## 2. Conceptual Overview
Running tests inside Docker containers ensures your test environment matches local and CI setups. This is mandatory for Visual Snapshot testing. Under the hood, Playwright uses expect(page).toHaveScreenshot() to match the DOM state pixel-by-pixel. If screenshots are captured on macOS or Windows and run on Linux agents, subpixel font differences will trigger visual failures. Operating inside containers enforces identical rendering. For complex applications, you can configure pixel discrepancy thresholds (maxDiffPixels, threshold), mask moving elements (like calendars or banners), or integrate third-party AI-driven visual platforms like Applitools or Percy. Using multi-container platforms like Docker Compose coordinates dynamic setups by mounting local filesystems and matching environment configuration boundaries.

### Execution Flow Diagram
```
[Local Filesystem] ──► Mount Volume ──► [Docker Container (Playwright Image)]
                                                 ├── Run toHaveScreenshot()
                                                 └── Compare images against Linux baseline
```

---

## 3. Implementation and Code Examples
```typescript
import { test, expect } from '@playwright/test';

// Visual snapshot comparison with thresholds and masking
test('dashboard layout visual test', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Verify layout, masking dynamic graphs and counters
  await expect(page).toHaveScreenshot('dashboard-layout.png', {
    maxDiffPixels: 100, // Maximum pixels allowed to differ
    threshold: 0.2,     // Visual comparison sensitivity factor
    mask: [
      page.locator('.live-chart-container'),
      page.locator('.dynamic-clock')
    ]
  });
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Generate visual regression baseline snapshots inside the target Docker container.
* Use masking parameters to hide dynamic elements in visual assertions.

### Don't
* Do not verify visual screenshots locally on Windows/Mac against Linux baseline references.
* Avoid setting high pixel thresholds that mask actual UI alignment bugs.

---

## 5. Chapter Summary
* Run screenshot assertions in Docker to match fonts exactly.
* Emulate native headless environments in Linux containers.
* Integrate with third-party visual platforms like Applitools/Percy.

---

## 6. Exercises & Mini-Project

### Exercises
1. Run a containerized test suite and output visual baseline images.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
# 1. Create a baseline snapshot:
docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.44.0-jammy npx playwright test --update-snapshots
# 2. Subsequent runs compare against this baseline.
```

</details>

2. Write a visual assertion that masks a dynamic timestamp text block.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('masked element visual comparison', async ({ page }) => {
  await page.goto('/dynamic-content');
  await expect(page).toHaveScreenshot({
    mask: [page.locator('.dynamic-timestamp')]
  });
});
```

</details>

### Mini-Project
Build a docker-compose setup to orchestrate visual testing sweeps.

Here is a minimal docker-compose.yml configuration model for multi-container tests:

```yaml
version: '3.8'
services:
  playwright:
    image: mcr.microsoft.com/playwright:v1.44.0-jammy
    volumes:
      - .:/work
    working_dir: /work
    environment:
      - BASE_URL=http://app:3000
    command: npx playwright test
```

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// Save docker-compose.yml exactly as mapped in the requirements, and run:
// docker-compose up --exit-code-from playwright
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Write a visual screenshot test for the todo list layout to prevent regression:
```typescript
test("visual todo list layout", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  await page.getByPlaceholder("What needs to be done?").fill("Visual Test");
  await page.getByPlaceholder("What needs to be done?").press("Enter");
  await expect(page).toHaveScreenshot("todomvc-layout.png", {
    maxDiffPixels: 50,
    threshold: 0.1
  });
});
```

---

## 8. Interview Q&A Preparation

**Q1: Why do visual screenshot tests fail in CI when created on macOS or Windows?**
* **Expected Answer:** Operating systems smooth fonts differently at the subpixel level. Linux (CI runner) renders fonts slightly differently from Windows/Mac, resulting in high pixel mismatches. Standardizing runs inside Docker eliminates this variation.


---

## 9. Chapter Cheat Sheet
```
docker run -v $(pwd):/work mcr.microsoft.com/playwright:...
```