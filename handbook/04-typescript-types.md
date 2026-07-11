# Chapter 12: TypeScript Types, Interfaces, & Generics

## Metadata
* **Part**: Part 1: JavaScript & TypeScript for Automation
* **Learning Objectives**:
  - Define strict TypeScript interfaces
  - Implement type unions
  - Utilize Generics for API utilities
* **Prerequisites**:
  - Chapter 3: Asynchronous JS: Promises & Event Loop
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Intermediate

---

## 1. Why This Matters
Using any types bypasses compiler validations. Type-safe test scripts catch structural bugs, such as missing properties in request payloads, during local compilations.

---

## 2. Conceptual Overview
TypeScript extends JavaScript by adding compiler-level types. Using interfaces, union types, and generic interfaces allows developers to structure page methods, response objects, and payload data factories safely.

However, a common anti-pattern in TypeScript is type casting using the as T operator (e.g., res.json() as User). This forces the compiler to ignore validation, which overrides safety. If the API schema changes at runtime, the compiler will not catch it, causing silent errors and contract drift. To prevent this, generics should be combined with runtime validation functions that inspect and verify the object structure before return.

### Execution Flow Diagram
```
[Raw JSON Data] ──► Runtime Validator ──► Verified Object shape
                          │
                          └── (Validation Fails) ──► Throw Error (Early Fail)
```

---

## 3. Implementation and Code Examples
```typescript
interface APIResponse<T> {
  data: T;
  statusCode: number;
}

interface UserProfile {
  username: string;
  email: string;
}

// Safe validation function to ensure the runtime object has required properties
function isUserProfile(data: any): data is UserProfile {
  return (
    data &&
    typeof data.username === 'string' &&
    typeof data.email === 'string'
  );
}

// Generic API response parser with strict runtime verification
function parseResponseSafely<T>(
  resBody: unknown,
  validator: (data: unknown) => data is T,
  status: number
): APIResponse<T> {
  if (validator(resBody)) {
    return {
      data: resBody, // Compiler narrows type safely from unknown to T
      statusCode: status
    };
  }
  throw new Error('API contract drift detected! Runtime payload does not match expected shape.');
}
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Define interfaces for all API response payloads.
* Combine Generic functions with runtime type-guards to validate payload shapes safely.

### Don't
* Avoid using the any type fallback in production code.
* Never use raw "as T" casting on dynamic network responses without a validation safeguard.

---

## 5. Chapter Summary
* Declare strict TypeScript interfaces to validate test payload configurations.
* Eliminate any from the codebase to enable full compiler-level validation.
* Use Generics to construct reusable, type-safe API helper functions.

---

## 6. Exercises & Mini-Project

### Exercises
1. Create a type-safe checkout credentials interface and use it in a mock login page.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
interface CheckoutCredentials {
  cardNumber: string;
  expiry: string;
  cvv: string;
  billingName: string;
}

const testCard: CheckoutCredentials = {
  cardNumber: '4111222233334444',
  expiry: '12/28',
  cvv: '123',
  billingName: 'Test User'
};
```

</details>

2. Write a generic function that parses database row columns safely.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
function parseDbRow<T>(row: unknown, validator: (data: unknown) => data is T): T {
  if (validator(row)) return row;
  throw new Error('Row does not match expected schema');
}

interface ProductRow { id: number; name: string; price: number; }
function isProductRow(data: unknown): data is ProductRow {
  const d = data as any;
  return typeof d?.id === 'number' && typeof d?.name === 'string' && typeof d?.price === 'number';
}
```

</details>

### Mini-Project
Build a generic API validation middleware using TypeScript models.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
import { z } from 'zod';

const ApiResponseSchema = z.object({
  data: z.object({ id: z.number(), name: z.string() }),
  statusCode: z.number()
});

type ApiResponse = z.infer<typeof ApiResponseSchema>;

function validateResponse(raw: unknown): ApiResponse {
  return ApiResponseSchema.parse(raw);
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Define a TypeScript interface for TodoMVC data models:
```typescript
interface TodoItem {
  title: string;
  completed: boolean;
}

interface TodoAppState {
  todos: TodoItem[];
  filter: "all" | "active" | "completed";
}

const expectedState: TodoAppState = {
  todos: [{ title: "Learn TypeScript", completed: false }],
  filter: "all"
};
```

---

## 8. Interview Q&A Preparation

**Q1: Why are Generics preferred over any in utility methods?**
* **Expected Answer:** Generics preserve the original type throughout execution. The calling code gets full autocompletion and compiler validation based on the specific type passed, which any disables.


---

## 9. Chapter Cheat Sheet
```
interface User { id: number; }
```