# Playwright Academy Cheat Sheet: Advanced Browser Controls

Quick reference for script evaluation, frame switches, alert dialogs, file operations, multi-tab popups, and clock control.

---

## 1. Syntax reference

### Script Evaluation inside Browser
```typescript
const storageVal = await page.evaluate(() => localStorage.getItem('token'));
```

### IFrames (FrameLocator)
```typescript
const creditCardInput = page.frameLocator('iframe#payment-frame').getByLabel('Card Number');
await creditCardInput.fill('4111222233334444');
```

### Native Browser Dialogs (Alert, Confirm, Prompt)
```typescript
page.on('dialog', async dialog => {
  expect(dialog.message()).toContain('unsaved changes');
  await dialog.accept(); // accept confirmation
});
```

---

## 2. File and Time Operations

### File Uploads
```typescript
await page.locator('input[type="file"]').setInputFiles('path/to/report.pdf');
```

### File Downloads
```typescript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Export Data' }).click()
]);
await download.saveAs('downloads/data.csv');
```

### Clocks Control (Mocking Time)
```typescript
await page.clock.install({ time: new Date('2026-07-02T12:00:00Z').getTime() });
await page.clock.fastForward(60000); // Fast forward 1 minute
```

---

## 3. Multi-Tab Scenarios
```typescript
const popupPromise = page.waitForEvent('popup');
await page.getByRole('button', { name: 'Open Terms in new tab' }).click();
const newTab = await popupPromise;
await newTab.waitForLoadState();
await expect(newTab.getByRole('heading')).toBeVisible();
await newTab.close();
```

---

## 4. Key Do's and Don'ts

### Do
* Await actions inside frames and popups just like you do for the main page.
* Register event listeners (`page.on('dialog')` or context popup promises) *before* triggering the event action.
* Use `page.clock` to test time-dependent alerts, tokens expirations, and calendar pickers.

### Don't
* Don't query iframe elements directly from the `page` context without using `frameLocator`.
* Don't forget to close new popups or tabs (`newTab.close()`) after executing assertions.
