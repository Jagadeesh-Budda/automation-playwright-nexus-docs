# Chapter 10: Functions, Closures, and Callbacks

## Metadata
* **Part**: Part 1: JavaScript & TypeScript for Automation
* **Learning Objectives**:
  - Master arrow function expressions
  - Understand callbacks in event handling
  - Write lexical closures
* **Prerequisites**:
  - Chapter 1: Modern JS/TS Variables & Scoping
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Beginner

---

## 1. Why This Matters
Playwright utilizes callback arguments extensively (e.g. inside page.route checks or expect.poll). Knowing how lexical scopes bind values resolves evaluation bugs.

---

## 2. Conceptual Overview
To transition from writing basic linear scripts to creating reusable helpers, you must understand how functions carry information. In automation, a function is a reusable block of instructions.

Let's break these down step-by-step:

1. Arrow Functions (() => {}):
- These are a modern, concise way to write functions in JavaScript.
- Instead of writing function() { return page.click(); }, you write () => page.click().
- They are extremely useful in class methods because they do not bind their own this context, instead inheriting it lexically.

2. Callbacks:
- A callback is a function passed as an argument to another function, to be executed later.
- In Playwright, when we wait for a condition or inspect network routes, we pass a callback specifying what to check once the event occurs.

3. Lexical Closures:
- A closure is created when an inner function retains access to its parent's outer variables, even after the parent function has finished executing. Think of it as a backpack: the inner function carries the parent's variables wherever it goes.

### Execution Flow Diagram
```
[Parent Context]
   └── [Lexical Closure] ── Holds reference to Parent scope variables
          └── [Callback Execution] ── Evaluates dynamically
```

---

## 3. Implementation and Code Examples
```typescript
// Callback: Passed as an inline arrow function to page.route
await page.route('**/api/config', (route) => {
  route.fulfill({ status: 200, body: JSON.stringify({ theme: 'dark' }) });
});

// Lexical Closure: Returns a function retaining access to 'minScore'
function createScoreChecker(minScore: number) {
  return (score: number) => score >= minScore;
}
const passesLimit = createScoreChecker(80);
console.log(passesLimit(85)); // true
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use arrow functions for lightweight, inline callback parameters.
* Capture snapshot variables in closures for dynamic waits.

### Don't
* Do not lose contextual bindings by misusing traditional function closures.

---

## 5. Chapter Summary
* Master arrow functions to write concise, inline test callbacks.
* Understand how callbacks allow Playwright functions to execute steps asynchronously.
* Leverage closures to retain access to outer variables within async event scopes.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a function returning a closure that filters page logs by key strings.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
function createLogFilter(keyword: string) {
  return (logEntry: string) => logEntry.toLowerCase().includes(keyword.toLowerCase());
}

const errorFilter = createLogFilter('error');
const logs = ['Info: started', 'Error: timeout', 'Error: crash', 'Info: done'];
const errors = logs.filter(errorFilter);
console.log(errors); // ['Error: timeout', 'Error: crash']
```

</details>

2. Refactor a standard function block callback into a concise arrow expression.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
// Before (standard function):
page.route('**/api', function(route) {
  return route.fulfill({ status: 200, body: '{}' });
});

// After (arrow function):
page.route('**/api', (route) => route.fulfill({ status: 200, body: '{}' }));
```

</details>

### Mini-Project
Create a dynamic logger middleware wrapper using closures.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
function createLogger(prefix: string) {
  let count = 0;
  return (message: string) => {
    count++;
    console.log('[' + prefix + ' #' + count + '] ' + message);
  };
}

const testLog = createLogger('TEST');
testLog('Started login flow');  // [TEST #1] Started login flow
testLog('Clicked submit');       // [TEST #2] Clicked submit
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Write a closure that generates unique todo titles with an incrementing counter:
```typescript
function createTodoGenerator(prefix: string) {
  let counter = 0;
  return () => {
    counter++;
    return prefix + "-" + counter + "-" + Date.now();
  };
}

const genTodo = createTodoGenerator("Task");
console.log(genTodo()); // Task-1-1719999...
console.log(genTodo()); // Task-2-1719999...
```

---

## 8. Interview Q&A Preparation

**Q1: How do arrow functions handle the this context inside Page Objects?**
* **Expected Answer:** Arrow functions do not bind their own this context; they inherit it lexically from the enclosing scope. This is useful in classes to preserve access to class properties.


---

## 9. Chapter Cheat Sheet
```
const myFunc = () => { ... }; // Arrow function
```