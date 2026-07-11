# Chapter 7: Reading Errors & Debugging

## Metadata
* **Part**: Phase 0: Prerequisites
* **Learning Objectives**:
  - Identify common JavaScript error types
  - Read and understand stack traces
  - Use console.log to debug problems
* **Prerequisites**:
  - Chapter 0F: Functions & Importing Files
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Absolute Beginner

---

## 1. Why This Matters
Errors are not failures — they are messages. Every professional developer reads errors hundreds of times per day. Learning to read them calmly is the single most important skill for self-sufficiency.

---

## 2. Conceptual Overview
When code breaks, the terminal prints an error message. This message is your best friend — it tells you exactly what went wrong and where.

1. Common Error Types:
- SyntaxError: You made a typo. Missing bracket, extra comma, misspelled keyword.
- ReferenceError: You used a variable name that does not exist.
- TypeError: You tried to do something impossible (like calling .click() on undefined).

2. Reading a Stack Trace:
- A stack trace is the list of lines printed after an error.
- The first line tells you WHAT went wrong (the error type and message).
- The second line tells you WHERE it happened (file name, line number, column number).
- Always read from the top down.

3. Debugging with console.log:
- When you do not understand why code behaves unexpectedly, add console.log statements to print values at different points.
- This is called "print debugging" and every engineer uses it daily.

4. How to Google an Error:
- Copy the error TYPE and MESSAGE (not the file path).
- Example: Search for "TypeError: Cannot read properties of undefined" not the full trace.
- Add "JavaScript" or "Node.js" to your search.
- Look for Stack Overflow results — they are usually the most helpful.

### Execution Flow Diagram
```
[Error Occurs] ──► Terminal shows error message ──► Read the TYPE ──► Read the LINE NUMBER ──► Fix the code
```

---

## 3. Implementation and Code Examples
```typescript
// ERROR 1: SyntaxError — Missing closing bracket
// if (score > 70 {        // ❌ Broken — missing )
//   console.log("Pass");
// }
// Fix:
if (score > 70) {           // ✅ Fixed — added )
  console.log("Pass");
}

// ERROR 2: ReferenceError — Variable not defined
// console.log(userName);   // ❌ ReferenceError: userName is not defined
// Fix: Declare the variable first
const userName = "Alice";
console.log(userName);       // ✅ Works

// ERROR 3: TypeError — Calling method on undefined
const user = { name: "Alice" };
// console.log(user.email.toUpperCase()); // ❌ TypeError: Cannot read properties of undefined
// Fix: Check if property exists
if (user.email) {
  console.log(user.email.toUpperCase());
} else {
  console.log("No email set"); // ✅ Safe
}

// DEBUGGING: Print values to find bugs
function calculateTotal(items) {
  console.log("DEBUG — items received:", items); // Add this to inspect
  let total = 0;
  for (const item of items) {
    console.log("DEBUG — processing:", item);    // And this
    total += item.price;
  }
  return total;
}
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Read error messages calmly — they are instructions, not punishments.
* Always look at the line number in the stack trace first.
* Use console.log to inspect variable values when debugging.

### Don't
* Do not delete your code and start over when you see an error — read the message first.
* Do not ignore errors — they always have a cause and a fix.

---

## 5. Chapter Summary
* SyntaxError = typo, ReferenceError = missing variable, TypeError = wrong operation.
* Stack traces tell you the exact file and line where the error occurred.
* console.log is your primary debugging tool — use it liberally.

---

## 6. Exercises & Mini-Project

### Exercises
1. Intentionally write a program with a SyntaxError, a ReferenceError, and a TypeError. Run each one and practice reading the error messages.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
// File 1 — syntax-error.js
// if (true {          // Run this — you'll see: SyntaxError: Unexpected token '{'
//   console.log("hi");
// }

// File 2 — reference-error.js
// console.log(myName); // ReferenceError: myName is not defined

// File 3 — type-error.js
// const data = undefined;
// data.toString();     // TypeError: Cannot read properties of undefined

// Practice reading each error's line number and message!
```

</details>

2. Write a function that has a bug (wrong variable name). Add console.log statements to find and fix the bug.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
function greetUser(name) {
  // BUG: using 'username' instead of 'name'
  // console.log("Hello, " + username); // ReferenceError!

  // DEBUG: Add console.log to inspect
  console.log("DEBUG — parameter received:", name);

  // FIX: Use the correct variable name
  console.log("Hello, " + name);
}

greetUser("Alice");
```

</details>

### Mini-Project
Build an error journal: create a file where you document 3 errors you encountered, what the error message said, and how you fixed them. This becomes your personal debugging reference.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution — error-journal.js
console.log("=== My Error Journal ===\n");

console.log("Error 1: SyntaxError");
console.log("Message: Unexpected token '{'");
console.log("Cause: Missing closing parenthesis in if statement");
console.log("Fix: Added ) before {\n");

console.log("Error 2: ReferenceError");
console.log("Message: myName is not defined");
console.log("Cause: Used a variable before declaring it");
console.log("Fix: Added const myName = 'Alice' before the console.log\n");

console.log("Error 3: TypeError");
console.log("Message: Cannot read properties of undefined");
console.log("Cause: Tried to call .toUpperCase() on an undefined object property");
console.log("Fix: Added an if-check before accessing the property");
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Intentionally break your `plan.js` file and practice reading the error:
```javascript
// Change this line to create a bug:
console.log(todoTitle); // ReferenceError — todoTitle is not defined

// Read the error message. Note the line number.
// Fix it by declaring the variable first:
const todoTitle = "Buy groceries";
console.log(todoTitle); // Now it works!
```

---

## 8. Interview Q&A Preparation

**Q1: What is a stack trace and how do you read it?**
* **Expected Answer:** A stack trace is a list of function calls printed when an error occurs. Read from top to bottom — the first line shows the error type and message, the second line shows the exact file, line number, and column where it happened.


---

## 9. Chapter Cheat Sheet
```
SyntaxError  → Typo in code\nReferenceError → Missing variable\nTypeError → Wrong operation\nconsole.log(x) → Print to debug
```