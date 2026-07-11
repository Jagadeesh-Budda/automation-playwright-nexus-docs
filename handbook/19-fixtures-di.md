# Chapter 27: Fixtures & Dependency Injection

## Metadata
* **Part**: Part 4: Framework Design
* **Learning Objectives**:
  - Configure custom fixtures using test.extend
  - Auto-inject Page Objects
  - Manage fixture lifecycles
* **Prerequisites**:
  - Chapter 18: Reusable UI Component Encapsulation
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Instantiating page classes manually inside every beforeEach hook is repetitive. Custom fixtures automate this setup, keeping test specs clean.

---

## 2. Conceptual Overview
Playwright fixtures provide dependency injection. By extending test, we configure page objects that are automatically instantiated and injected into test arguments.

### Execution Flow Diagram
```
[test.extend] ──► Inject page dependencies ──► Test runs ──► Run post-test teardown
```

---

## 3. Implementation and Code Examples
```typescript
import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SettingsPage } from '../pages/SettingsPage';

export const test = base.extend<{ homePage: HomePage; settingsPage: SettingsPage }>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  }
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use extended fixtures to inject page objects into tests.
* Define test-level cleanup steps after the await use() statement.

### Don't
* Do not call manual page class instantiations inside spec test files.

---

## 5. Chapter Summary
* Use test.extend to configure automatic POM instances.
* Run fixture setups and teardowns automatically around tests.
* Define worker-level fixtures to share heavy backend clients.

---

## 6. Exercises & Mini-Project

### Exercises
1. Extend a base test setup to inject a custom settings page object.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
import { test as base } from './fixtures';
import { SettingsPage } from './pages/SettingsPage';

export const test = base.extend<{ settingsPage: SettingsPage }>({
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  }
});
```

</details>

2. Implement an authenticated page fixture that handles login setups automatically.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'auth.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});
```

</details>

### Mini-Project
Build a fixture composition layer for an enterprise test suite.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// Composition of fixtures:
export const test = base.extend<{ adminPage: AdminPage; userPage: UserPage }>({
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  userPage: async ({ page }, use) => {
    await use(new UserPage(page));
  }
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Create a custom fixture that injects the `TodoPage` instance automatically:
```typescript
// fixtures/todo-fixture.ts
import { test as base } from "@playwright/test";
import { TodoPage } from "../pages/TodoPage";

export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.navigate();
    await use(todoPage);
  }
});

// Then write tests cleanly:
// test("test using POM fixture", async ({ todoPage }) => {
//   await todoPage.addTodo("Auto-injected");
// });
```

---

## 8. Interview Q&A Preparation

**Q1: What is the lifecycle of a test-scoped fixture?**
* **Expected Answer:** It is instantiated before the test begins, injected into the test arguments, and any code after the await use() call executes as cleanup when the test finishes.


---

## 9. Chapter Cheat Sheet
```
export const test = base.extend<{
  homePage: HomePage;
  settingsPage: SettingsPage;
}>({
  homePage: async ({ page }, use) => { await use(new HomePage(page)); },
  settingsPage: async ({ page }, use) => { await use(new SettingsPage(page)); }
});
```