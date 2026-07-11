# Chapter 6: Functions & Importing Files

## Metadata
* **Part**: Phase 0: Prerequisites
* **Learning Objectives**:
  - Write reusable functions
  - Understand arrow function syntax
  - Split code across multiple files using import/export
* **Prerequisites**:
  - Chapter 0E: Objects, Arrays & JSON
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Absolute Beginner

---

## 1. Why This Matters
Tests are built from reusable functions. Page Objects, helpers, and utilities are all functions organized in separate files. Understanding import/export is how you structure a real project.

---

## 2. Conceptual Overview
A function is a reusable block of code that performs a specific task. Instead of writing the same code over and over, you write it once inside a function and call it whenever you need it.

1. Basic Functions:
- function greet(name) { return "Hello, " + name; }
- Call it: greet("Alice") returns "Hello, Alice".
- Parameters are inputs. Return values are outputs.

2. Arrow Functions:
- A shorter way to write functions: const greet = (name) => "Hello, " + name;
- Arrow functions are used everywhere in Playwright (callbacks, event handlers).
- For single expressions, you can omit the curly braces and return keyword.

3. Splitting Code Across Files:
- As your project grows, you will have hundreds of lines of code.
- Organize code by putting related functions in separate files.
- Use export to make a function available to other files.
- Use import to bring a function from another file into the current file.
- This is how Page Objects and test helpers are structured in real projects.

### Execution Flow Diagram
```
[helpers.js]                    [test.js]
  export function login()  ──►   import { login } from "./helpers.js"
  export function logout() ──►   login(); logout();
```

---

## 3. Implementation and Code Examples
```typescript
// --- File: helpers.js ---
// Export functions so other files can use them
export function createTodoTitle() {
  const timestamp = Date.now();
  return "Todo-" + timestamp;
}

export function isValidTitle(title) {
  return title.length > 0 && title.length <= 100;
}

// --- File: main.js ---
// Import the functions from helpers.js
import { createTodoTitle, isValidTitle } from "./helpers.js";

const title = createTodoTitle();
console.log("Generated:", title);
console.log("Is valid:", isValidTitle(title));

// Arrow function example
const double = (n) => n * 2;
console.log("Double of 5:", double(5)); // 10
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Give functions clear, descriptive names that explain what they do.
* Use arrow functions for short, inline operations.
* Keep each file focused on one responsibility.

### Don't
* Do not write functions that do too many things — split them up.
* Do not forget the return keyword if your function needs to give back a value.

---

## 5. Chapter Summary
* Functions are reusable blocks of code with inputs (parameters) and outputs (return values).
* Arrow functions (=>) are a concise syntax used extensively in Playwright.
* Use export/import to organize code across multiple files.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a function called multiply that takes two numbers and returns their product. Call it with 3 different pairs of numbers.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
function multiply(a, b) {
  return a * b;
}

console.log(multiply(3, 4));   // 12
console.log(multiply(7, 8));   // 56
console.log(multiply(10, 0));  // 0
```

</details>

2. Create two files: math-helpers.js (export an add and subtract function) and app.js (import and use them).

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
// --- File: math-helpers.js ---
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// --- File: app.js ---
import { add, subtract } from "./math-helpers.js";
console.log("5 + 3 =", add(5, 3));       // 8
console.log("10 - 4 =", subtract(10, 4)); // 6
```

</details>

### Mini-Project
Build a string utilities module with functions: capitalize(str), truncate(str, maxLen), and countWords(str). Export them and use them in a separate file.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// --- File: string-utils.js ---
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "...";
}
export function countWords(str) {
  return str.split(" ").filter(w => w.length > 0).length;
}

// --- File: use-utils.js ---
import { capitalize, truncate, countWords } from "./string-utils.js";
console.log(capitalize("hello"));           // Hello
console.log(truncate("A very long title", 10)); // A very lon...
console.log(countWords("Buy groceries today")); // 3
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Create `todo-helpers.js` — reusable functions for your automation project:
```javascript
export function generateTodoTitle() {
  return "Todo-" + Date.now();
}

export function formatTodoList(todos) {
  return todos.map((t, i) => (i + 1) + ". [" + (t.completed ? "x" : " ") + "] " + t.title).join("
");
}
```
This module will evolve into your Page Object helper layer.

---

## 8. Interview Q&A Preparation

**Q1: What is the difference between a regular function and an arrow function?**
* **Expected Answer:** Arrow functions use concise syntax (=>) and inherit the this context from their parent scope. Regular functions bind their own this context. Arrow functions are preferred for callbacks and inline operations.


---

## 9. Chapter Cheat Sheet
```
function name(param) { return val; }  // Regular\nconst fn = (p) => p * 2;               // Arrow\nexport function fn() { }               // Export\nimport { fn } from "./file.js";        // Import
```