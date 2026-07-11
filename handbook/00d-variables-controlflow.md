# Chapter 4: Variables, Conditions & Loops

## Metadata
* **Part**: Phase 0: Prerequisites
* **Learning Objectives**:
  - Store values in variables
  - Make decisions with if/else
  - Repeat actions with for loops
* **Prerequisites**:
  - Chapter 0C: Your First JavaScript Program
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Absolute Beginner

---

## 1. Why This Matters
Every test stores values (URLs, usernames), makes decisions (did the button appear?), and repeats actions (check every row in a table). These are the three pillars of programming.

---

## 2. Conceptual Overview
This chapter teaches the three building blocks that every program uses.

1. Variables — Storing Data:
- A variable is a named container that holds a value.
- const name = "Alice"; — creates a constant (cannot be changed).
- let age = 25; — creates a variable that can be updated.
- You can store text (strings), numbers, true/false (booleans), and more.

2. Conditions — Making Decisions:
- if checks whether something is true, and runs code accordingly.
- else runs when the condition is false.
- else if adds additional checks.
- Comparison operators: === (equals), !== (not equals), > (greater than), < (less than).

3. Loops — Repeating Actions:
- A for loop repeats a block of code a specific number of times.
- It has three parts: start (let i = 0), condition (i < 5), and step (i++).
- i++ means "add 1 to i after each loop".
- Loops are essential for checking every item in a list or every row in a table.

### Execution Flow Diagram
```
[Store Data] ──► [Make Decision] ──► [Repeat if needed]
     │                 │                     │
 let x = 5      if (x > 3) { }      for (let i=0; i<5; i++)
```

---

## 3. Implementation and Code Examples
```typescript
// 1. VARIABLES — Storing data
const websiteUrl = "https://demo.playwright.dev/todomvc";
let todoCount = 0;
const isLoggedIn = false;

console.log("Website:", websiteUrl);
console.log("Todos:", todoCount);
console.log("Logged in:", isLoggedIn);

// 2. CONDITIONS — Making decisions
const statusCode = 404;

if (statusCode === 200) {
  console.log("Success! Page loaded.");
} else if (statusCode === 404) {
  console.log("Error! Page not found.");
} else {
  console.log("Unknown status:", statusCode);
}

// 3. LOOPS — Repeating actions
console.log("Checking 5 table rows:");
for (let i = 1; i <= 5; i++) {
  console.log("Checking row", i);
}
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use const for values that never change (URLs, config) and let for values that do (counters, flags).
* Always use === (triple equals) for comparisons, not == (double equals).
* Read loop code from left to right: start → condition → step.

### Don't
* Do not use var — it causes scope bugs (you will learn why in Chapter 1).
* Do not create infinite loops — always ensure the loop condition will eventually be false.

---

## 5. Chapter Summary
* Variables store data: const for fixed values, let for changing values.
* Conditions (if/else) let code make decisions based on runtime states.
* Loops (for) repeat actions a specific number of times.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write a script that stores a test score in a variable and prints "PASS" if it is 70 or above, and "FAIL" otherwise.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
const testScore = 85;

if (testScore >= 70) {
  console.log("PASS");
} else {
  console.log("FAIL");
}
```

</details>

2. Write a loop that prints the numbers 1 through 10, and for each number prints whether it is even or odd.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) {
    console.log(i, "is even");
  } else {
    console.log(i, "is odd");
  }
}
```

</details>

### Mini-Project
Build a password strength checker: store a password string, check its length, and print "Weak" (under 6 chars), "Medium" (6-10 chars), or "Strong" (over 10 chars).

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution — password-checker.js
const password = "MySecretPass123";

if (password.length < 6) {
  console.log("Weak — password is too short (" + password.length + " chars)");
} else if (password.length <= 10) {
  console.log("Medium — password is okay (" + password.length + " chars)");
} else {
  console.log("Strong — password is solid (" + password.length + " chars)");
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Create `todo-validator.js` that validates todo titles before they are added:
```javascript
const todoTitle = "Buy groceries";

if (todoTitle.length === 0) {
  console.log("Error: Todo title cannot be empty");
} else if (todoTitle.length > 100) {
  console.log("Error: Todo title is too long");
} else {
  console.log("Valid todo: " + todoTitle);
}

// Bonus: Loop through multiple todos
const todos = ["Buy groceries", "", "Read Playwright docs", "A very long todo item that exceeds one hundred characters and should be rejected by our validation logic here"];
for (let i = 0; i < todos.length; i++) {
  console.log("Checking todo " + (i + 1) + ": " + (todos[i].length === 0 ? "EMPTY" : todos[i].length > 100 ? "TOO LONG" : "VALID"));
}
```

---

## 8. Interview Q&A Preparation

**Q1: What is the difference between const and let?**
* **Expected Answer:** const creates a variable that cannot be reassigned. let creates a variable that can be updated. const is preferred for values that should not change.


---

## 9. Chapter Cheat Sheet
```
const x = 5;            // Constant\nlet y = 10;              // Mutable\nif (x === 5) { }         // Condition\nfor (let i=0; i<5; i++)  // Loop
```