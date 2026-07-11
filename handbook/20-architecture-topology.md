# Chapter 28: 4-Layer Architecture Topology

## Metadata
* **Part**: Part 4: Framework Design
* **Learning Objectives**:
  - Organize automation projects in 4 levels
  - Define boundaries between layers
  - Map mock data schemas
* **Prerequisites**:
  - Chapter 19: Fixtures & Dependency Injection
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Unstructured frameworks quickly become hard to maintain. A 4-layer architecture isolates test files, page flows, widgets, and data schemas.

---

## 2. Conceptual Overview
The 4-Layer Page Object Architecture separates files by responsibility. This structure isolates assertions, page navigation, reusable widgets, and typing schemas, ensuring a clean codebase.

### Execution Flow Diagram
```
[Layer 1: Test Specs] ──────► [Layer 2: Page Objects]
                                       │
                                       ▼
[Layer 4: Data/Entities] ◄── [Layer 3: UI Components]
```

---

## 3. Implementation and Code Examples
```typescript
// ══════════════════════════════════════════════════
// LAYER 4: Entity Schemas (File: types/UserPayload.ts)
// ══════════════════════════════════════════════════
export interface UserPayload {
  name: string;
  email: string;
}

// ══════════════════════════════════════════════════
// LAYER 3: Components (File: components/ProfileForm.ts)
// ══════════════════════════════════════════════════
import { Locator } from '@playwright/test';
export class ProfileFormComponent {
  readonly root: Locator;
  constructor(root: Locator) { this.root = root; }
  async fillForm(data: UserPayload) {
    await this.root.getByLabel('Name').fill(data.name);
    await this.root.getByLabel('Email').fill(data.email);
  }
}

// ══════════════════════════════════════════════════
// LAYER 2: Pages (File: pages/ProfilePage.ts)
// ══════════════════════════════════════════════════
import { Page } from '@playwright/test';
export class ProfilePage {
  readonly page: Page;
  readonly profileForm: ProfileFormComponent;
  constructor(page: Page) {
    this.page = page;
    this.profileForm = new ProfileFormComponent(page.locator('form#profile'));
  }
}

// ══════════════════════════════════════════════════
// LAYER 1: Specs (File: specs/profile.spec.ts)
// ══════════════════════════════════════════════════
import { test } from '@playwright/test';
test('validate profile form update', async ({ page }) => {
  const profilePage = new ProfilePage(page);
  const data: UserPayload = { name: 'Alice', email: 'alice@test.com' };
  await page.goto('/profile');
  await profilePage.profileForm.fillForm(data);
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Isolate specs, pages, components, and data schemas in separate folders.
* Verify that data schema definitions (Layer 4) remain clean.

### Don't
* Do not mix test spec assertions (Layer 1) inside page classes (Layer 2).

---

## 5. Chapter Summary
* Isolate specs, pages, components, and typing layers.
* Maintain clean boundaries: specs assert, components locate.
* Type data payloads with TypeScript interfaces to avoid syntax errors.

---

## 6. Exercises & Mini-Project

### Exercises
1. Restructure a basic project directory into a 4-layer folder structure.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
# Restructure your files as follows:
# - Move *.spec.ts to /specs
# - Move page classes to /pages
# - Move reusable widgets to /components
# - Move interfaces/types to /types
```

</details>

2. Map static API JSON models into TypeScript interfaces.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
export interface UserJsonModel {
  id: string;
  name: string;
  preferences: {
    theme: 'light' | 'dark';
  };
}
```

</details>

### Mini-Project
Restructure a legacy repository using 4-layer design guidelines.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// Organized structure setup with imports mapping boundaries:
import { test } from '../fixtures/todo-fixture';
import { UserPayload } from '../types/UserPayload';
// Test specs import Layer 2 page/fixture layers correctly.
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Organize the TodoMVC automation project into a 4-layer structure:
```
todomvc-automation/
├── specs/
│   └── todo.spec.ts          (Layer 1: Test Specs)
├── pages/
│   └── TodoPage.ts           (Layer 2: Page Objects)
├── components/
│   └── TodoItemComponent.ts  (Layer 3: UI Components)
├── types/
│   └── TodoItem.ts           (Layer 4: Data Models/Entities)
├── package.json
└── playwright.config.ts
```

---

## 8. Interview Q&A Preparation

**Q1: How does a 4-layer architecture simplify design updates?**
* **Expected Answer:** By separating concerns. If a table widget changes, you only update the Component class in Layer 3; Layer 1 (Specs) and Layer 2 (Pages) remain untouched.


---

## 9. Chapter Cheat Sheet
```
Folder structure: specs/, pages/, components/, types/
```