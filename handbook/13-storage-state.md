# Chapter 21: Storage State & Auth Strategies

## Metadata
* **Part**: Part 3: Advanced Playwright
* **Learning Objectives**:
  - Save authenticated browser cookies
  - Inject storageState into contexts
  - Manage token expirations
* **Prerequisites**:
  - Chapter 12: Debugging Workflows
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
Logging in via the UI before every test slows down runs. Reusing session storage cookies cuts auth setup times.

---

## 2. Conceptual Overview
Injecting storageState bypasses UI login pages by loading cookies, local storage values, and session data directly into browser contexts during initialization. In production pipelines, session tokens age and expire. To make auth setups robust, tests should evaluate token expiry timestamps parsed from cookies or localStorage and trigger an automated re-auth sequence prior to injection.

### Execution Flow Diagram
```
[Auth Session Setup] ──► Save Context cookies ──► [auth.json] ──► Inject into new Contexts ──► Bypass Login page
```

---

## 3. Implementation and Code Examples
```typescript
import * as fs from 'fs';
import { Browser } from '@playwright/test';

// Setup authenticated context, refreshing tokens dynamically if expired
async function setupAuthenticatedContext(browser: Browser, authFilePath: string) {
  let needsLogin = true;
  
  if (fs.existsSync(authFilePath)) {
    const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf-8'));
    const expiryCookie = authData.cookies.find((c: any) => c.name === 'session_expiry');
    
    // Check if token has expired compared to the current timestamp
    if (expiryCookie && Date.now() < Number(expiryCookie.value)) {
      needsLogin = false; // Cookie is still valid!
    }
  }

  const options = needsLogin ? {} : { storageState: authFilePath };
  const context = await browser.newContext(options);

  if (needsLogin) {
    const page = await context.newPage();
    await page.goto('/login');
    await page.getByLabel('User').fill('admin');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL('/dashboard');
    await context.storageState({ path: authFilePath });
  }
  
  return context;
}
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Configure globalSetup storage paths in playwright.config.ts.
* Clear storage state files when testing user logout scenarios.
* Inspect storage JSON files programmatically to evaluate and refresh aged authentication tokens.

### Don't
* Do not commit storage state JSON files to source control.

---

## 5. Chapter Summary
* Save cookie and localStorage states to static JSON files.
* Inject storageState into contexts to bypass repetitive UI logins.
* Handle token expiration by scheduling proactive login refreshes.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write an auth script that saves a session, then use it in a separate test file.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
// File: auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('User').fill('admin');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'auth.json' });
});
```

</details>

2. Verify that browser storage is populated with cookies after setup.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('verify storage populated', async ({ page }) => {
  await page.goto('/dashboard');
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session_id');
  expect(sessionCookie).toBeDefined();
  console.log('Session cookie:', sessionCookie?.value);
});
```

</details>

### Mini-Project
Build a multi-user storage state manager for a project.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
const users = ['admin', 'editor', 'viewer'];

for (const role of users) {
  setup('auth-' + role, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('User').fill(role);
    await page.getByLabel('Password').fill(role + '_pass');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.context().storageState({ path: role + '.auth.json' });
  });
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Save and restore todo state using localStorage storage state:
```typescript
test("save todo state", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Persisted todo");
  await input.press("Enter");
  // Save the browser state (including localStorage with todos)
  await page.context().storageState({ path: "todo-state.json" });
});
```

---

## 8. Interview Q&A Preparation

**Q1: How does storageState speed up test execution?**
* **Expected Answer:** It saves browser sessions (cookies, localStorage) to a file. Subsequent tests load this file to start pre-authenticated, avoiding slow UI login flows.


---

## 9. Chapter Cheat Sheet
```
await page.context().storageState({ path: "auth.json" });
```