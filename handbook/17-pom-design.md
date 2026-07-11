# Chapter 25: Page Object Model (POM) Design

## Metadata
* **Part**: Part 4: Framework Design
* **Learning Objectives**:
  - Structure Page Objects cleanly
  - Declare locators inside constructors
  - Keep page methods focus to actions
* **Prerequisites**:
  - Chapter 16: Emulation & Advanced Browser Settings
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
A poor POM structure creates code duplication. Declaring locators in properties and keeping assertions inside tests ensures a maintainable framework.

---

## 2. Conceptual Overview
The Page Object Model (POM) abstracts page structures into reusable classes. Declaring locators as properties inside the constructor keeps selectors organized, and page methods handle business actions.

### Execution Flow Diagram
```
[Page Object Class]
   ├── Properties: readonly locators (Declared in constructor)
   └── Workflows: async actions (Click, fill, etc. No assertions)
```

---

## 3. Implementation and Code Examples
```typescript
export class ConfirmationPage {
  readonly page: Page;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successMessage = page.getByRole('alert');
  }
}

export class SettingsPage {
  readonly page: Page;
  readonly saveBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.saveBtn = page.getByRole('button', { name: 'Save Changes' });
  }

  // Action methods return target POM pages to chain flows cleanly
  async applySettings(): Promise<ConfirmationPage> {
    await this.saveBtn.click();
    return new ConfirmationPage(this.page);
  }
}
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Declare locators as readonly class properties.
* Ensure page actions return locators or state variables for tests to assert.

### Don't
* Do not write assertions (expect) inside Page Object methods.
* Do not declare locators as class methods.

---

## 5. Chapter Summary
* Declare readonly locator properties in the page constructors.
* Keep test assertions decoupled from POM action methods.
* Return child page references or locators to chain flows cleanly.

---

## 6. Exercises & Mini-Project

### Exercises
1. Build a Page Object class for a registration flow.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Full Name');
    this.emailInput = page.getByLabel('Email Address');
    this.submitBtn = page.getByRole('button', { name: 'Register' });
  }

  async registerUser(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.submitBtn.click();
  }
}
```

</details>

2. Refactor a script containing direct page queries to use a Page Object model instead.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('login using Page Object model', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('user', 'pass');
  await expect(page).toHaveURL(/dashboard/);
});
```

</details>

### Mini-Project
Construct a unified POM library for an application checkout funnel.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
class CheckoutPage {
  readonly page: Page;
  constructor(page: Page) { this.page = page; }
  async fillShipping() { /* ... */ }
  async pay(): Promise<ConfirmationPage> {
    await this.page.click('text=Pay');
    return new ConfirmationPage(this.page);
  }
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Build a Page Object class for the TodoMVC page:
```typescript
// pages/TodoPage.ts
import { Page, Locator, expect } from "@playwright/test";

export class TodoPage {
  readonly page: Page;
  readonly input: Locator;
  readonly todoItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.input = page.getByPlaceholder("What needs to be done?");
    this.todoItems = page.getByTestId("todo-title");
  }

  async navigate() {
    await this.page.goto("https://demo.playwright.dev/todomvc");
  }

  async addTodo(text: string) {
    await this.input.fill(text);
    await this.input.press("Enter");
  }
}
```

---

## 8. Interview Q&A Preparation

**Q1: Why is it an anti-pattern to include assertions inside Page Objects?**
* **Expected Answer:** It couples the page layout with test assertions. If the page is reused in negative test cases (e.g. testing input errors), internal assertions will cause the test to fail.


---

## 9. Chapter Cheat Sheet
```
class MyPage { constructor(page: Page) { ... } }
```