# Chapter 13: Installation & Core Architecture

## Metadata
* **Part**: Part 2: Playwright Fundamentals
* **Learning Objectives**:
  - Understand Browser, BrowserContext, and Page hierarchy
  - Explain Chrome DevTools Protocol (CDP) interactions
  - Configure basic test runner settings
* **Prerequisites**:
  - Chapter 4: TypeScript Types, Interfaces, & Generics
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Beginner

---

## 1. Why This Matters
Understanding browser context isolation explains why tests run concurrently without colliding, maximizing speed and efficiency.

---

## 2. Conceptual Overview
Playwright communicates with browser engines directly using the Chrome DevTools Protocol (CDP) over WebSockets. This removes the Selenium WebDriver REST API translation layer, enabling fast, bidirectional commands and native network interception. Because WebSocket protocols govern communications, Playwright provides APIs to intercept, inspect, and log all WebSocket traffic sent between the client application and browser engine.

### Execution Flow Diagram
```
[Browser Process]
   ├── [BrowserContext A] (Isolated Cookies, Cache, Storage) ──► [Page 1]
   └── [BrowserContext B] (Isolated Cookies, Cache, Storage) ──► [Page 2]
```

---

## 3. Implementation and Code Examples
```typescript
// Listen to page WebSocket connections and log client frames
test('track WebSocket messages', async ({ page }) => {
  page.on('websocket', (ws) => {
    console.log('WebSocket connection opened: ' + ws.url());
    
    // Extract and log frames received from the server
    ws.on('framereceived', (frame) => {
      const payloadStr = typeof frame.payload === 'string'
        ? frame.payload
        : frame.payload.toString('utf-8');
      console.log('Frame Received: ' + payloadStr);
    });

    // Extract and log frames sent from the client
    ws.on('framesent', (frame) => {
      const payloadStr = typeof frame.payload === 'string'
        ? frame.payload
        : frame.payload.toString('utf-8');
      console.log('Frame Sent: ' + payloadStr);
    });
  });
  
  await page.goto('/realtime-chat');
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Leverage BrowserContexts to isolate sessions.
* Use the page.on("websocket") event emitter to log active web socket packet payloads.

### Don't
* Do not share state between contexts.
* Avoid running multiple browsers in a single thread manually.

---

## 5. Chapter Summary
* Understand Browser, BrowserContext, and Page hierarchy.
* Leverage BrowserContexts to isolate cookies, cache, and state per test.
* Explain how CDP WebSocket communication replaces REST WebDriver.

---

## 6. Exercises & Mini-Project

### Exercises
1. Install Playwright inside a clean directory and run the initialization wizard.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
mkdir my-playwright-project
cd my-playwright-project
npm init -y
npm install -D @playwright/test
npx playwright install
npx playwright test  # Run the example tests
```

</details>

2. Add a new browser configuration project to playwright.config.ts.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution — playwright.config.ts:
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

</details>

### Mini-Project
Write a runner script that logs WebSocket communication protocols.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
page.on('websocket', (ws) => {
  console.log('WebSocket URL:', ws.url());
  ws.on('framereceived', (frame) => {
    const payload = typeof frame.payload === 'string' ? frame.payload : frame.payload.toString('utf-8');
    console.log('Received:', payload);
  });
  ws.on('framesent', (frame) => {
    const payload = typeof frame.payload === 'string' ? frame.payload : frame.payload.toString('utf-8');
    console.log('Sent:', payload);
  });
});
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Explore the Browser → Context → Page hierarchy by creating multiple contexts:
```typescript
test("understand context isolation", async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();
  // page1 and page2 have completely separate cookies and storage
  await page1.goto("https://demo.playwright.dev/todomvc");
  await page2.goto("https://demo.playwright.dev/todomvc");
  await context1.close();
  await context2.close();
});
```

---

## 8. Interview Q&A Preparation

**Q1: What is the structural difference between a Browser and a BrowserContext?**
* **Expected Answer:** A Browser represents the physical browser instance. A BrowserContext is an isolated session within that browser, similar to an Incognito window. It holds independent cookies, local storage, and caches.


---

## 9. Chapter Cheat Sheet
```
npx playwright install // Install browsers
```