# Chapter 23: Handling IFrames & Tabs

## Metadata
* **Part**: Part 3: Advanced Playwright
* **Learning Objectives**:
  - Scope iframe contexts using frameLocator
  - Coordinate multi-tab pages
  - Manage navigation frames
* **Prerequisites**:
  - Chapter 14: Network Interception Patterns
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
Forgetting to switch contexts when dealing with frames or new tabs causes tests to fail, as page-level actions cannot access nested DOMs.

---

## 2. Conceptual Overview
Using frameLocator scopes actions inside an iframe. For multi-tab support, register listeners for the popup event on the browser context, returning a new page reference.

### Execution Flow Diagram
```
[Main Page]
   ├── frameLocator('iframe') ──► Access nested DOM elements
   └── context.waitForEvent('popup') ──► Access new tab context Page
```

---

## 3. Implementation and Code Examples
```typescript
// Handling switch contexts inside an iframe using frameLocator and popups
test('iframe nested form submission and popup handling', async ({ page }) => {
  await page.goto('/checkout');
  
  // Locate card element inside iframe scope
  const paymentFrame = page.frameLocator('#payment-iframe');
  await paymentFrame.getByLabel('Card Number').fill('4111222233334444');
  await paymentFrame.getByRole('button', { name: 'Submit Payment' }).click();

  // Handle a popup/tab context event resolution
  const popupPromise = page.context().waitForEvent('popup');
  await page.getByRole('link', { name: 'View Terms' }).click();
  const popupPage = await popupPromise;
  await popupPage.waitForLoadState();
  await expect(popupPage).toHaveTitle('Terms and Conditions');
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Register the popup event listener before triggering the popup action.
* Scope frame locators to unique container IDs.

### Don't
* Do not try to query nested frames without using frameLocator.

---

## 5. Chapter Summary
* Scope elements inside nested iframes with frameLocator.
* Listen for popup context events before dynamic tab creations.
* Switch pages seamlessly using page context event promises.

---

## 6. Exercises & Mini-Project

### Exercises
1. Interact with a checkbox inside an iframe.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('iframe checkbox interaction', async ({ page }) => {
  await page.goto('/settings');
  const frame = page.frameLocator('#preferences-iframe');
  await frame.getByRole('checkbox', { name: 'Enable Notifications' }).check();
  await expect(frame.getByRole('checkbox', { name: 'Enable Notifications' })).toBeChecked();
});
```

</details>

2. Click a link that opens a new tab and assert details on the new page.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('new tab assertion', async ({ page }) => {
  await page.goto('/links');
  const popupPromise = page.context().waitForEvent('page');
  await page.getByRole('link', { name: 'External Link' }).click();
  const newPage = await popupPromise;
  await newPage.waitForLoadState();
  await expect(newPage).toHaveTitle(/External/);
});
```

</details>

### Mini-Project
Build a multi-tab workspace flow manager.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
test('multi-tab workspace manager', async ({ page }) => {
  await page.goto('/workspace');
  // Open 3 tabs
  const tabs: Page[] = [];
  for (const name of ['Tab1', 'Tab2', 'Tab3']) {
    const p = page.context().waitForEvent('page');
    await page.getByRole('button', { name }).click();
    tabs.push(await p);
  }
  // Interact with each tab
  for (const tab of tabs) {
    await tab.waitForLoadState();
    console.log('Tab title:', await tab.title());
  }
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: TodoMVC does not use iframes or popups, so this is a knowledge checkpoint:
```
// TodoMVC is a single-page app with no iframes or popups.
// In real-world apps, you would use:
// page.frameLocator("iframe")  — for embedded payment forms
// context.waitForEvent("page") — for links opening new tabs
// Practice these patterns on apps that use them.
```

---

## 8. Interview Q&A Preparation

**Q1: Why must you register context.waitForEvent("popup") before clicking the link?**
* **Expected Answer:** To avoid race conditions. Registering the listener first ensures Playwright catches the popup event the moment the click triggers it.


---

## 9. Chapter Cheat Sheet
```
const frame = page.frameLocator("iframe");
```