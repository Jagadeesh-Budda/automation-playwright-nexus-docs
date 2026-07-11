# Playwright Academy Cheat Sheet: Locators & Assertions

Quick reference for accessing elements semantically and asserting states using Web-First polling.

---

## 1. The Locator Priority Ladder
Prioritize user-facing, accessibility-centric markers over implementation details like CSS selectors.

1. **`page.getByRole(role, options)`**: Target links, buttons, headers.
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   ```
2. **`page.getByLabel(text)`**: Target input elements via label associations.
   ```typescript
   page.getByLabel('User Email Address')
   ```
3. **`page.getByPlaceholder(text)`**: Target form fields via placeholder text.
   ```typescript
   page.getByPlaceholder('Search...')
   ```
4. **`page.getByText(text)`**: Locate static texts, notes, and paragraphs.
   ```typescript
   page.getByText('File Upload Complete')
   ```
5. **`page.getByTestId(id)`**: Fallback identifier (`data-testid`).
   ```typescript
   page.getByTestId('user-avatar-menu')
   ```
6. **`page.locator(selector)`**: Raw CSS class/XPath query (Avoid where possible).
   ```typescript
   page.locator('.brittle-class')
   ```

---

## 2. Assertion reference

| Web-First Assertion | Purpose |
|---|---|
| `await expect(locator).toBeVisible();` | Waits for element to render and become visible |
| `await expect(locator).toBeEnabled();` | Waits for form input/button to be enabled |
| `await expect(locator).toBeChecked();` | Verifies checkbox or radio button is checked |
| `await expect(locator).toHaveText(/regex/);` | Validates element text matches expression |
| `await expect(locator).toHaveAttribute('k', 'v');` | Confirms element contains attribute key/value |
| `await expect.soft(locator).toBeVisible();` | Non-fatal assertion (logs failure, continues run) |

---

## 3. Chaining and Filtering
```typescript
// Chaining: Narrow search scope to a container
const formButton = page.locator('#login-form').getByRole('button');

// Filtering: Select a row by child text
const row = page.getByRole('row').filter({ hasText: 'DOC-123' });
await row.getByRole('button', { name: 'Delete' }).click();

// Positioning: Select by index (use with caution)
const secondItem = page.getByRole('listitem').nth(1);
```

---

## 4. Key Do's and Don'ts

### Do
* Always pass a `Locator` directly to `expect()` assertions to enable Web-First auto-retries.
* Resolve `Strict Mode Violations` by narrowing locator scopes rather than using `.first()`.
* Combine `.filter({ hasText: ... })` with standard roles to automate dynamic tables.

### Don't
* Don't assert against immediate boolean values, e.g. `expect(await loc.isVisible()).toBe(true)`.
* Don't use positional index queries (`.first()`, `.nth()`) in sorting lists.
