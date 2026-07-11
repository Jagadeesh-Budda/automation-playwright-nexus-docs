# Chapter 9: Modern JS/TS Variables & Scoping

## Metadata
* **Part**: Part 1: JavaScript & TypeScript for Automation
* **Learning Objectives**:
  - Understand lexical scoping in JS/TS
  - Differentiate const, let, and var
  - Avoid scope pollution in parallel tests
* **Prerequisites**:
  - Basic programming concepts
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Beginner

---

## 1. Why This Matters
Using the incorrect variable scope in tests can cause shared memory leakage between parallel threads, leading to flaky test runs and unpredictable execution states.

---

## 2. Conceptual Overview
For manual testers transitioning to automated testing, variables are the starting point. In manual testing, you perform actions sequentially. In code, you store usernames, passwords, and URLs in variables.

Let's break down the main concepts step-by-step:

1. Variable Declaration:
- const (Constant): Declares a read-only variable that cannot be reassigned. Use this for values that never change during execution, such as URLs, configuration options, and locator paths.
- let: Declares a variable that can be updated or reassigned. Use this for loops, counters, or flags.
- var: The legacy declaration type. Avoid this completely because it does not respect block boundaries and can leak data into other parts of your test, causing confusing errors when tests run in parallel.

2. Lexical and Block Scoping:
- A block is code enclosed in curly braces {}.
- When you declare a variable with const or let, it exists only inside those braces. Attempting to access it outside of them results in a ReferenceError.

3. Understanding ReferenceErrors and Stack Traces:
- When a variable is accessed outside of its scope, the runtime throws a ReferenceError. A stack trace is a list of method calls that shows exactly where the error occurred (including file name, line number, and column number). Learning to read this trace tells you which scope was breached.

### Execution Flow Diagram
```
[Global Scope]
   └── [Block Scope (const / let)] ── Only accessible within curly braces {}
   └── [Function Scope (var)] ────── Leaks out of loops and conditionals
```

---

## 3. Implementation and Code Examples
```typescript
// ✅ Recommended Scoping
const BASE_URL = 'https://staging.enterprise.com'; // Immutable block-scope
let retryCounter = 0; // Block-scoped mutable variable

if (retryCounter === 0) {
  const tempId = 'SESSION-ID'; // Scoped strictly to this block
  console.log('Logged in with ID:', tempId);
  retryCounter++;
}

// console.log(tempId); // ❌ Throws ReferenceError!
// Stack trace analysis:
// ReferenceError: tempId is not defined
//    at Object.<anonymous> (tests/login.spec.ts:10:13)
// Analysis: Look at line 10, column 13. The compiler cannot find 'tempId' because it was garbage collected when the if-block execution completed.
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Always default to const for variable definitions.
* Declare loop counters using let to enforce block-scoping.
* Read stack traces from the top down to locate the exact file and line of a scoping crash.

### Don't
* Never declare variables using var inside test suites.
* Do not declare mutable variables globally in describe scopes.

---

## 5. Chapter Summary
* Default to const for all variables to prevent accidental mutations.
* Use let only when a variable needs to be reassigned (like loop counters).
* Never use var inside modern test automation suites as it violates block scoping boundaries.

---

## 6. Exercises & Mini-Project

### Exercises
1. Fix an assignment error inside a loop by replacing var with let.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
// Before (broken):
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // Prints 3, 3, 3
}

// After (fixed):
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // Prints 0, 1, 2
}
```

</details>

2. Write a scoped helper function that dynamically returns credentials.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
function getCredentials(env: string) {
  if (env === 'staging') {
    return { user: 'staging_admin', pass: 'stg_pass' };
  }
  return { user: 'prod_admin', pass: 'prod_pass' };
}

const creds = getCredentials('staging');
console.log(creds.user); // staging_admin
```

</details>

### Mini-Project
Build a credential state builder class that isolates environment scopes.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
class CredentialBuilder {
  private env: string;
  constructor(env: string) { this.env = env; }

  getBaseUrl(): string {
    return this.env === 'prod' ? 'https://app.com' : 'https://staging.app.com';
  }

  getUser(): string {
    return this.env === 'prod' ? 'prod_user' : 'staging_user';
  }
}

const staging = new CredentialBuilder('staging');
console.log(staging.getBaseUrl()); // https://staging.app.com
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Declare scoped constants for the TodoMVC test configuration:
```typescript
const BASE_URL = "https://demo.playwright.dev/todomvc";
let todoCount = 0;

// Inside a test block — scoped correctly
if (todoCount === 0) {
  const firstTodo = "Learn scoping";
  console.log("Adding:", firstTodo);
  todoCount++;
}
// firstTodo is not accessible here — proper block scoping!
```

---

## 8. Interview Q&A Preparation

**Q1: What is the main danger of using var inside async test loops?**
* **Expected Answer:** Because var is function-scoped, the loop variable shares the same memory reference. By the time async actions execute, the loop has completed, and all iterations will point to the final value, causing race conditions.


---

## 9. Chapter Cheat Sheet
```
const key = val; // Immutable
let varName = val; // Mutable
```