# Playwright Academy Cheat Sheet: Architecture & Design Patterns

Quick reference for the 4-Layer Page Object Architecture, widget encapsulation, and page composition.

---

## 1. The 4-Layer Architecture Map

```
Layer 1: Test Specs (Business assertions only. No selector strings or URL paths)
   │
   ▼
Layer 2: Page Objects (Represent pages, coordinate flows. No assertions)
   │
   ▼
Layer 3: UI Components (Reusable widget wrappers like Tables, DatePickers, Autocompletes)
   │
   ▼
Layer 4: Data Shapes/Entities (TypeScript interfaces representing test data payload states)
```

---

## 2. Reusable Component Template
Locate elements inside the widget boundaries using a root locator:
```typescript
// components/Autocomplete.ts
import { Locator, Page } from '@playwright/test';

export class Autocomplete {
  readonly root: Locator;
  readonly input: Locator;
  readonly options: Locator;

  constructor(page: Page, labelName: string) {
    this.root = page.getByRole('group', { name: labelName });
    this.input = this.root.getByRole('combobox');
    this.options = page.getByRole('listbox').getByRole('option');
  }

  async select(term: string) {
    await this.input.fill(term);
    await this.options.filter({ hasText: term }).first().click();
  }
}
```

---

## 3. Composition Page Object Template
```typescript
// pages/DocumentPage.ts
import { Page } from '@playwright/test';
import { Autocomplete } from '../components/Autocomplete';

export class DocumentPage {
  readonly page: Page;
  readonly categoryFilter: Autocomplete;

  constructor(page: Page) {
    this.page = page;
    // Nest components via composition
    this.categoryFilter = new Autocomplete(page, 'Document Category');
  }

  async navigate() {
    await this.page.goto('/documents');
  }
}
```

---

## 4. Key Do's and Don'ts

### Do
* Scope all component queries to the component's `root` locator to prevent duplicate selectors match exceptions.
* Expose Page Object workflows that return other Page Objects or components.
* Define interfaces in Layer 4 for mock data payloads.

### Don't
* Don't build deep Page Object inheritance structures (`class AddUser extends AuthenticatedPage extends BasePage`). Use composition instead.
* Don't include assertions (`expect`) in UI Components or Page Object actions.
