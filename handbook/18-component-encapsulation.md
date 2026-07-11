# Chapter 26: Reusable UI Component Encapsulation

## Metadata
* **Part**: Part 4: Framework Design
* **Learning Objectives**:
  - Identify modular widgets
  - Scope locators to component roots
  - Compose Page Objects
* **Prerequisites**:
  - Chapter 17: Page Object Model (POM) Design
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
Duplicate selector definitions for common layouts (like navbars or tables) cause high code churn when headers change. Encapsulating them into components solves this.

---

## 2. Conceptual Overview
Encapsulating page widgets (headers, sidebars, lists) into standalone component classes allows you to reuse them across multiple pages. Composition is preferred over inheritance.

### Execution Flow Diagram
```
[Main Page Object]
   ├── Composition ──► [Navbar Component Class]
   └── Composition ──► [Footer Component Class]
```

---

## 3. Implementation and Code Examples
```typescript
export class NavbarComponent {
  readonly root: Locator;
  readonly profileLink: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.profileLink = root.getByRole('link', { name: 'Profile' });
  }

  async clickProfile() {
    await this.profileLink.click();
  }
}

export class DashboardPage {
  readonly page: Page;
  readonly navbar: NavbarComponent;

  constructor(page: Page) {
    this.page = page;
    this.navbar = new NavbarComponent(page.getByRole('navigation', { name: 'Main Menu' }));
  }
}
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Scope all component selectors to a parent root locator.
* Instantiate component sub-classes inside Page Object constructors.

### Don't
* Avoid deep class inheritance extensions (e.g. extends BasePage).

---

## 5. Chapter Summary
* Abstract repeating UI controls (navbars, cards) into component classes.
* Scope component selectors strictly to a parent root locator.
* Favor composition over inheritance to model layout relationships.

---

## 6. Exercises & Mini-Project

### Exercises
1. Encapsulate a table row layout into a TableRow component.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
export class TableRowComponent {
  readonly root: Locator;
  readonly editBtn: Locator;
  readonly deleteBtn: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.editBtn = root.getByRole('button', { name: 'Edit' });
    this.deleteBtn = root.getByRole('button', { name: 'Delete' });
  }
}
```

</details>

2. Build a Page Object composed of separate Sidebar and Header components.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
export class DashboardPage {
  readonly sidebar: SidebarComponent;
  readonly header: HeaderComponent;

  constructor(page: Page) {
    this.sidebar = new SidebarComponent(page.locator('aside'));
    this.header = new HeaderComponent(page.locator('header'));
  }
}
```

</details>

### Mini-Project
Build a component dashboard library with modular widget classes.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
export class DashboardLibrary {
  readonly statsWidget: StatsWidgetComponent;
  readonly chartWidget: ChartWidgetComponent;
  constructor(page: Page) {
    this.statsWidget = new StatsWidgetComponent(page.locator('.stats'));
    this.chartWidget = new ChartWidgetComponent(page.locator('.charts'));
  }
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Extract a `TodoItemComponent` for individual todo rows to isolate item elements:
```typescript
// components/TodoItemComponent.ts
import { Locator } from "@playwright/test";

export class TodoItemComponent {
  readonly root: Locator;
  readonly label: Locator;
  readonly toggleCheckbox: Locator;
  readonly destroyBtn: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.label = root.getByTestId("todo-title");
    this.toggleCheckbox = root.getByRole("checkbox");
    this.destroyBtn = root.getByRole("button", { name: "Delete" });
  }

  async toggle() {
    await this.toggleCheckbox.click();
  }

  async delete() {
    await this.root.hover();
    await this.destroyBtn.click();
  }
}
```

---

## 8. Interview Q&A Preparation

**Q1: Why should component class selectors be scoped to a parent root locator?**
* **Expected Answer:** Scoping prevents locator duplication errors. It ensures Playwright searches only within that widget region, even if other pages have matching elements.


---

## 9. Chapter Cheat Sheet
```
this.root = page.locator("selector");
```