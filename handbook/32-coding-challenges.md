# Chapter 40: Common Interview Coding Challenges

## Metadata
* **Part**: Part 8: Interview Preparation
* **Learning Objectives**:
  - Solve automated table pagination challenges
  - Mock MFA verification workflows
  - Validate column sorting
* **Prerequisites**:
  - Chapter 31: System Design Whiteboard Scenarios
* **Estimated Reading Time**: 25 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Coding challenges test your hands-on Playwright skills. Mastering common problems like sorting and paginating tables helps you clear technical interviews.

---

## 2. Conceptual Overview
This chapter compiles standard coding tasks, including iterating through paginated lists, verifying table column sorting, and mocking MFA/OTP authentication steps.

### Execution Flow Diagram
```
[Read table column cells] ──► Parse values ──► Verify order is sorted
```

---

## 3. Implementation and Code Examples
```typescript
// Coding Challenge: Verify table column sorting
test('check price column sorting', async ({ page }) => {
  await page.getByRole('columnheader', { name: 'Price' }).click();
  const prices = await page.getByRole('row').getByRole('cell').allTextContents();
  const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
  const isSorted = numericPrices.every((v, i, a) => !i || a[i - 1] <= v);
  expect(isSorted).toBe(true);
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use content-based filters (.filter()) instead of loops with hardcoded index numbers.
* Wait for loading indicators (progressbar) to disappear after actions that refresh data.

### Don't
* Avoid using nested loops or sleep statements to solve synchronization problems in tests.

---

## 5. Chapter Summary
* Solve paginated table scans by locating next-page buttons.
* Verify column sorting arrays by mapping DOM text to numbers.
* Handle complex OTP scenarios using API intercepts or mocks.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a script that navigates through a paginated list until it finds and clicks a target row.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
test('paginated scan check', async ({ page }) => {
  await page.goto('/paginated-table');
  let hasNext = true;
  while (hasNext) {
    const rows = await page.getByRole('row').allTextContents();
    console.log('Row count on page:', rows.length);
    const nextBtn = page.getByRole('button', { name: 'Next' });
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
    } else {
      hasNext = false;
    }
  }
});
```

</details>

2. Mock an OTP verification API response and check if the login succeeds.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test('mock OTP code', async ({ page }) => {
  await page.route('**/api/otp', (route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ code: '123456' }) });
  });
  await page.goto('/login');
  await page.getByLabel('OTP').fill('123456');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/dashboard/);
});
```

</details>

### Mini-Project
Build a collection of common automation coding challenge solutions.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// Unified challenge suite containing pagination, column verification, and dialog interceptors.
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Solve: navigate through active and completed filters to verify counts:
```typescript
test("todo count verification through filters", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Task 1");
  await input.press("Enter");
  await input.fill("Task 2");
  await input.press("Enter");

  // Complete first todo
  await page.getByRole("listitem").filter({ hasText: "Task 1" }).getByRole("checkbox").click();

  // Toggle Completed filter
  await page.getByRole("link", { name: "Completed" }).click();
  await expect(page.getByTestId("todo-title")).toHaveCount(1);

  // Toggle Active filter
  await page.getByRole("link", { name: "Active" }).click();
  await expect(page.getByTestId("todo-title")).toHaveCount(1);
});
```

---

## 8. Interview Q&A Preparation

**Q1: How do you select a button inside a specific table row containing a target text?**
* **Expected Answer:** Locate the row using page.getByRole("row").filter({ hasText: "target" }), and then search inside that row: row.getByRole("button", { name: "Action" }).click().


---

## 9. Chapter Cheat Sheet
```
row.filter({ hasText: "target" }).getByRole("button").click()
```