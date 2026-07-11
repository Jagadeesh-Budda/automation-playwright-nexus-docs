# Chapter 37: GitHub Actions End-to-End

## Metadata
* **Part**: Part 7: CI/CD & Infrastructure
* **Learning Objectives**:
  - Build a GitHub Actions workflow
  - Configure node caching
  - Upload report artifacts
* **Prerequisites**:
  - Chapter 28: Docker & Cloud Execution
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Automating tests on Pull Requests checks code changes immediately, preventing broken builds from merging into main branches.

---

## 2. Conceptual Overview
Configure GitHub Actions workflows to run test suites on push or pull requests. Use action steps to cache dependencies, install browsers, run tests, and upload reports. To prevent pipeline credential leaks, secret tokens or passwords must never be stored in plain text. Instead, fetch them from vault stores and map them as masked environment variables directly within runner steps.

### Execution Flow Diagram
```
[Git Commit Push] ──► Trigger GitHub Action Workflow ──► Map Secrets ──► Run tests ──► Upload artifacts
```

---

## 3. Implementation and Code Examples
```typescript
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      
      # ✅ Map masked secrets securely as environment variables
      - name: Run Test Suite
        env:
          ENTERPRISE_API_KEY: ${{ secrets.API_KEY }}
        run: npx playwright test
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Cache node_modules in the runner to speed up build setup steps.
* Configure upload-artifact steps to save HTML reports on failures.
* Securely map vault keys into masked GitHub Secrets variables.

### Don't
* Do not omit browser installation dependencies (--with-deps).
* Never print plain text credentials directly to the console or job logs.

---

## 5. Chapter Summary
* Construct GHA workflows triggering on code check-ins.
* Cache node_modules to accelerate pipeline execution speeds.
* Archive test reports and screenshot outputs as run artifacts.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a GitHub Actions workflow that runs your tests on every pull request.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
# Create .github/workflows/playwright.yml:
# on: [pull_request]
# jobs:
#   test:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-node@v4
#       - run: npm ci
#       - run: npx playwright install --with-deps
#       - run: npx playwright test
```

</details>

2. Configure build alerts to notify the team when a test suite fails.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
# Exercise 2 Solution:
# Add steps to the workflow:
# - name: Send Alert
#   if: failure()
#   run: curl -X POST -H 'Content-type: application/json' --data '{"text":"Pipeline failed!"}' https://hooks.slack.com/services/T00/B00/X00
```

</details>

### Mini-Project
Build a pull request validation check with automated reports.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// Complete workflow configuration utilizing:
// - uses: actions/upload-artifact@v4
//   if: always()
//   with:
//     name: playwright-report
//     path: playwright-report/
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Create a GitHub Actions workflow for the TodoMVC suite:
```yaml
# .github/workflows/todomvc.yml
name: TodoMVC CI
on: [push, pull_request]
jobs:
  run-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

---

## 8. Interview Q&A Preparation

**Q1: Why should you cache npm dependencies inside CI runners?**
* **Expected Answer:** Caching avoids downloading packages from scratch on every run, saving bandwidth and reducing build durations.


---

## 9. Chapter Cheat Sheet
```
uses: actions/upload-artifact@v4
```