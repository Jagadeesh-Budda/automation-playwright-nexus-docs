# Chapter 24: Emulation & Advanced Browser Settings

## Metadata
* **Part**: Part 3: Advanced Playwright
* **Learning Objectives**:
  - Configure geolocation and timezones
  - Mock locale parameters
  - Emulate mobile layout viewports
* **Prerequisites**:
  - Chapter 15: Handling IFrames & Tabs
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
Testing localized content, time zones, or mobile responsive layouts requires browser-level emulation, which Playwright context configurations support.

---

## 2. Conceptual Overview
Browser emulation configures location coordinates, timezones, language locales, and responsive viewports, ensuring pages render correctly across devices and regions.

### Execution Flow Diagram
```
[Config File] ──► Set geolocation, timezone, viewport ──► Launch Context ──► Localized UI rendered
```

---

## 3. Implementation and Code Examples
```typescript
// Emulating mobile settings in playwright.config.ts
import { devices } from '@playwright/test';
export default {
  projects: [
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
};
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use Playwright built-in devices catalog to configure viewports.
* Test locale-specific layouts by updating locale context variables.

### Don't
* Do not change viewports mid-test unless testing responsive layouts specifically.

---

## 5. Chapter Summary
* Configure geographic locations, timezones, and language locales.
* Match viewports and touch parameters to device profiles.
* Validate dark/light themes using color-scheme emulation.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a test that emulates a specific timezone and verify time displays.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('timezone emulation', async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: 'America/New_York' });
  const page = await context.newPage();
  await page.goto('/clock');
  const time = await page.getByTestId('clock').textContent();
  console.log('NY Time:', time);
  await context.close();
});
```

</details>

2. Emulate mobile screen sizes and test collapsible sidebar menus.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('mobile sidebar collapse', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('/dashboard');
  await expect(page.getByTestId('sidebar')).not.toBeVisible();
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByTestId('sidebar')).toBeVisible();
  await context.close();
});
```

</details>

### Mini-Project
Build a localization testing sweep for dynamic applications.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
const locales = ['en-US', 'fr-FR', 'de-DE', 'ja-JP'];
for (const locale of locales) {
  test('locale test: ' + locale, async ({ browser }) => {
    const ctx = await browser.newContext({ locale });
    const page = await ctx.newPage();
    await page.goto('/app');
    const dateText = await page.getByTestId('date-display').textContent();
    console.log(locale + ':', dateText);
    await ctx.close();
  });
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Emulate a mobile viewport and verify the TodoMVC responsive layout:
```typescript
import { devices } from "@playwright/test";

test("mobile TodoMVC layout", async ({ browser }) => {
  const context = await browser.newContext({
    ...devices["iPhone 12"]
  });
  const page = await context.newPage();
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Mobile todo");
  await input.press("Enter");
  await expect(page.getByTestId("todo-title")).toBeVisible();
  await context.close();
});
```

---

## 8. Interview Q&A Preparation

**Q1: How does Playwright emulate a mobile device context?**
* **Expected Answer:** It configures mobile viewports, enables touch events, and updates the user-agent string to match the targeted mobile browser.


---

## 9. Chapter Cheat Sheet
```
use: { locale: "fr-FR", timezoneId: "Europe/Paris" }
```