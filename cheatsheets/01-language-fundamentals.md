# Playwright Academy Cheat Sheet: JS/TS Language Fundamentals

Quick reference for essential JavaScript and TypeScript concepts used in Playwright automation.

---

## 1. Variable Scope
Avoid `var` to prevent scope leakage. Always default to `const`. Use `let` only for variable reassignment.

```typescript
const BASE_URL = 'https://staging.myapp.com'; // Immutable block-scope
let retryCount = 0;                          // Mutable block-scope
```

---

## 2. Asynchronous Execution
All browser operations (actions and assertions) return a Promise and must be awaited inside `async` functions.

```typescript
// ❌ Anti-pattern: Missing await causes the test to exit prematurely
page.goto('/login');

// ✅ Correct: Pauses test thread until navigation resolves
await page.goto('/login');
```

---

## 3. Reference Table

| Concept | Syntax Example | Use Case |
|---|---|---|
| **Arrow Function** | `const calc = (r) => r * 1000;` | Callbacks, page evaluations |
| **Object Destructuring** | `const { email, password } = credentials;` | Clean parameter handling |
| **Spread Operator** | `const fullConfig = { ...baseConfig, retries: 3 };` | Cloning/extending configs |
| **TypeScript Interface** | `interface User { email: string; id: number; }` | Type-safe payloads |
| **Generics** | `async function get<T>(url: string): Promise<T>` | Reusable API calls |

---

## 4. Key Do's and Don'ts

### Do
* Use `===` for strict comparison to prevent dynamic type coercion.
* Mark test hook functions with `async` if they perform browser interactions.
* Use TypeScript interfaces to enforce structure on mock test data.

### Don't
* Don't mix Promise chains (`.then()`) with `async/await` syntax inside test scripts.
* Don't declare variables outside `test` or `test.describe` blocks to prevent parallel test cross-contamination.
