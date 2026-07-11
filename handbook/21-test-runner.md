# Chapter 29: Playwright Test Runner Internals

## Metadata
* **Part**: Part 5: Enterprise Automation
* **Learning Objectives**:
  - Explain parallel execution models
  - Configure worker allocations
  - Understand CPU thread setups
* **Prerequisites**:
  - Chapter 20: 4-Layer Architecture Topology
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Misconfiguring parallel worker limits can freeze system resources or cause dynamic test collisions. Optimizing workers keeps runs fast and stable.

---

## 2. Conceptual Overview
The Playwright test runner runs tests in parallel across isolated worker processes. Each worker starts its own browser context, ensuring tests do not interfere with one another.

### Execution Flow Diagram
```
[Runner Process] ──► Allocate CPU ──► Worker 1 (BrowserContext 1) ──► run test A
                                 └──► Worker 2 (BrowserContext 2) ──► run test B
```

---

## 3. Implementation and Code Examples
```typescript
// config workers allocations sample
export default {
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true
};
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Enable fullyParallel option to run tests concurrently.
* Limit worker count on CI servers to match available CPU cores.

### Don't
* Do not share global states across test files when running in parallel.

---

## 5. Chapter Summary
* Spawn independent worker processes to achieve concurrency.
* Run tests fullyParallel with independent browser contexts.
* Tune worker allocations to match physical CPU core counts.

---

## 6. Exercises & Mini-Project

### Exercises
1. Configure test runs to use a specific number of workers from the CLI.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
npx playwright test --workers=2
```

</details>

2. Measure the speed difference between running tests sequentially vs. in parallel.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
# Exercise 2 Solution:
# Run tests sequentially:
npx playwright test --workers=1
# Run tests in parallel:
npx playwright test --workers=4
# Compare the durations printed in the run summaries.
```

</details>

### Mini-Project
Build a monitor script that tracks CPU load during test execution.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// A helper process monitor reading os.cpus() load
import * as os from 'os';
console.log('CPU Load:', os.cpus());
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Configure worker allocations in your `playwright.config.ts` for TodoMVC tests:
```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true,
  use: {
    baseURL: "https://demo.playwright.dev/todomvc"
  }
});
```

---

## 8. Interview Q&A Preparation

**Q1: How does Playwright isolate parallel test runs?**
* **Expected Answer:** By running each test in a separate worker process with its own BrowserContext, isolating cookies, storage, and sessions.


---

## 9. Chapter Cheat Sheet
```
npx playwright test --workers=4
```