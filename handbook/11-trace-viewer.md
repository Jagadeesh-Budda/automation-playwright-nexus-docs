# Chapter 19: Trace Viewer & Observability

## Metadata
* **Part**: Part 3: Advanced Playwright
* **Learning Objectives**:
  - Configure trace capture options
  - Inspect console calls and network timelines
  - Diagnose failures using DOM snapshots
* **Prerequisites**:
  - Chapter 10: Auto-Wait Internals
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
CI runs fail without browser screens. Traces let you step through DOM snapshots at the exact moment of failure to locate bugs.

---

## 2. Conceptual Overview
The Trace Viewer captures browser interactions. It records action steps, API calls, browser logs, and DOM snapshots, letting you debug test runs locally or from CI builds.

### Execution Flow Diagram
```
[CI Failure] ──► Zip Artifact Generated ──► npx playwright show-trace ──► Interactive Timeline UI
```

---

## 3. Implementation and Code Examples
```typescript
// playwright.config.ts trace options
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    trace: 'retain-on-failure',
  }
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Enable traces on failure in CI/CD.
* Inspect network tab streams inside the trace viewer.

### Don't
* Do not capture traces for all passing runs, as it slows down executions.

---

## 5. Chapter Summary
* Capture execution snapshots on retry/failure inside CI pipelines.
* Extract network call logs and console prints from trace files.
* Inspect DOM snapshots interactively to pinpoint layout bugs.

---

## 6. Exercises & Mini-Project

### Exercises
1. Run a failing test locally with traces enabled.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
# 1. Add to playwright.config.ts:
# use: { trace: 'on' }
# 2. Run a failing test:
npx playwright test --headed
# 3. Open the trace:
npx playwright show-trace test-results/test-name/trace.zip
```

</details>

2. Open a generated trace zip file using the Playwright CLI.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
# Exercise 2 Solution:
npx playwright show-trace path/to/trace.zip
# This opens the interactive Trace Viewer in your browser
# Navigate the timeline, inspect DOM snapshots, and check network calls
```

</details>

### Mini-Project
Build a trace parsing script that counts API calls.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// Script that reads trace zip and counts API calls
import * as fs from 'fs';
// In practice, traces are zip files containing JSON action logs
// Parse the trace to count network requests:
console.log('Trace analysis: Count network calls from the trace timeline');
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Enable trace capture for your TodoMVC tests and inspect a run:
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: "retain-on-failure"
  }
});
```
Run a failing test, then open the trace:
```
npx playwright show-trace test-results/.../trace.zip
```

---

## 8. Interview Q&A Preparation

**Q1: What details are saved inside a Playwright trace archive?**
* **Expected Answer:** A zip archive containing screen actions, network requests, console outputs, source maps, and interactive DOM snapshots for every step.


---

## 9. Chapter Cheat Sheet
```
npx playwright show-trace path/to/trace.zip
```