# Chapter 3: Your First JavaScript Program

## Metadata
* **Part**: Phase 0: Prerequisites
* **Learning Objectives**:
  - Create a JavaScript file
  - Write and run console.log statements
  - Understand the write-run-observe cycle
* **Prerequisites**:
  - Chapter 0B: Installing Node.js & npm
* **Estimated Reading Time**: 10 mins
* **Difficulty Level**: Absolute Beginner

---

## 1. Why This Matters
Before you can write a test, you need to know how to create a file, write code in it, and run it. This chapter gives you that fundamental feedback loop.

---

## 2. Conceptual Overview
Programming is a cycle: you write instructions in a file, run the file, observe the result, and then improve. This chapter teaches that cycle using the simplest possible program.

What is console.log?
- It is a command that prints text to your terminal.
- Think of it as the "print" button for code.
- It is the most important debugging tool you will ever use.

How to create a file:
- Open your terminal in your project folder.
- You can create a file using the terminal or a text editor.
- We recommend installing VS Code (https://code.visualstudio.com) — it is a free text editor built for coding.
- In VS Code, open your project folder (File → Open Folder), then create a new file.

Your first program:
- Create a file called hello.js (the .js extension means JavaScript).
- Type console.log("Hello, World!"); inside the file.
- Save the file.
- In your terminal, type node hello.js and press Enter.
- You will see "Hello, World!" printed in the terminal.

### Execution Flow Diagram
```
[Create File] ──► [Write Code] ──► [Run with node] ──► [See Output] ──► [Edit & Repeat]
```

---

## 3. Implementation and Code Examples
```typescript
// File: hello.js
// This is your very first program!

console.log("Hello, World!");
console.log("My name is [Your Name]");
console.log("I am learning Playwright!");
console.log("2 + 3 =", 2 + 3);

// To run this file, type in your terminal:
// node hello.js

// Expected output:
// Hello, World!
// My name is [Your Name]
// I am learning Playwright!
// 2 + 3 = 5
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Install VS Code and use it to write all your code.
* Save your file before running it (Ctrl+S / Cmd+S).
* Read the output after every run — it tells you exactly what happened.

### Don't
* Do not forget the semicolon at the end of each statement (it is optional in JS but good practice).
* Do not forget to save the file before running node hello.js — you will run the old version.

---

## 5. Chapter Summary
* Programming is a write → run → observe → edit cycle.
* console.log() prints output to your terminal.
* Create .js files and run them with the node command.

---

## 6. Exercises & Mini-Project

### Exercises
1. Create a file called math.js that prints the results of 10 * 5, 100 / 4, and 7 - 3.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution — math.js
console.log("10 * 5 =", 10 * 5);   // 50
console.log("100 / 4 =", 100 / 4); // 25
console.log("7 - 3 =", 7 - 3);     // 4
```

</details>

2. Create a file called about-me.js that prints your name, age, and favorite food on separate lines.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution — about-me.js
console.log("Name: Alice");
console.log("Age: 28");
console.log("Favorite food: Pizza");
```

</details>

### Mini-Project
Build a file called calculator.js that calculates and prints the total cost of 3 items: a book ($12.99), a pen ($2.50), and a notebook ($5.75). Print each item and the total.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution — calculator.js
const book = 12.99;
const pen = 2.50;
const notebook = 5.75;

console.log("Book: $" + book);
console.log("Pen: $" + pen);
console.log("Notebook: $" + notebook);

const total = book + pen + notebook;
console.log("Total: $" + total);
// Output: Total: $21.24
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Inside your `todomvc-automation` folder, create a file called `plan.js` and run it:
```javascript
// File: plan.js
console.log("=== TodoMVC Automation Project ===" );
console.log("Target: https://demo.playwright.dev/todomvc");
console.log("Goal: Full E2E test suite with Page Objects and CI/CD");
console.log("Starting from zero. Let's go!");
```
Run: `node plan.js`

---

## 8. Interview Q&A Preparation

**Q1: What does console.log do?**
* **Expected Answer:** It prints output to the terminal. It is the primary tool for debugging and verifying that code is executing correctly.


---

## 9. Chapter Cheat Sheet
```
console.log("text");   // Print text\nnode filename.js       // Run a JS file
```