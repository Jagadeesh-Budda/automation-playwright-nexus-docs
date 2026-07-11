# Chapter 32: Test Data Management

## Metadata
* **Part**: Part 5: Enterprise Automation
* **Learning Objectives**:
  - Use data factories
  - Avoid static JSON data hazards
  - Implement database seeding
* **Prerequisites**:
  - Chapter 23: Onboarding & Transition Guides
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Sharing static database records in parallel test runs leads to locks and validation collision. Transactional seeding isolates runs.

---

## 2. Conceptual Overview
Managing test data requires using dynamic data factories to generate unique parameters for each test, ensuring tests can run in parallel without conflicts. For relational data, direct database connections should be checked out from a client connection Pool. By connecting, starting a SQL transaction (BEGIN) before the test runs, and executing rollbacks (ROLLBACK) inside a finally block, tests preserve database state isolation and release connections securely back to the pool, preventing connection leaks, deadlocks, and pool exhaustion.

### Execution Flow Diagram
```
[Start test context] ──► Pool Connect ──► BEGIN Transaction ──► Run UI Test Actions
                                                                    │
[Teardown] ◄── Release Client ◄── ROLLBACK Transaction ◄────────────┘
```

---

## 3. Implementation and Code Examples
```typescript
import { test as base } from '@playwright/test';
import { Pool } from 'pg';

// Setup connection Pool with limits
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/testdb',
  max: 20, // Avoid connection exhaustion
  idleTimeoutMillis: 30000
});

// Setup database connection and transaction isolation fixture
export const dbIsolatedTest = base.extend<{ dbClient: any }>({
  dbClient: async ({}, use) => {
    // Checkout client from connection pool
    const client = await pool.connect();
    
    try {
      // Start transaction isolation layer
      await client.query('BEGIN');
      
      // Pass client reference to the test spec
      await use(client);
    } finally {
      // Guaranteed database transaction rollback on success OR crash
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      } finally {
        // Safely release connection client back to the pool to prevent leaks
        client.release();
      }
    }
  }
});
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use data factories to generate unique payloads dynamically.
* Roll back database seeding operations using transaction blocks.
* Always release database clients inside finally blocks to prevent pool exhaustion.

### Don't
* Do not rely on static JSON user records for tests that mutate data.

---

## 5. Chapter Summary
* Generate unique test parameters with dynamic data factories.
* Seed database records via DB connection scripts inside hooks.
* Rollback database transactions to clean state without teardowns.

---

## 6. Exercises & Mini-Project

### Exercises
1. Build a data factory helper that returns unique product entries.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
export class ProductFactory {
  static create(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 1000),
      name: 'Product-' + Date.now(),
      price: parseFloat((Math.random() * 100).toFixed(2)),
      ...overrides
    };
  }
}
```

</details>

2. Write a setup hook that seeds a user account via an API call.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
test.beforeEach(async ({ request }) => {
  const res = await request.post('/api/users/seed', {
    data: { username: 'testuser', role: 'admin' }
  });
  expect(res.status()).toBe(201);
});
```

</details>

### Mini-Project
Build a dynamic billing data generator for enterprise testing.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
export class BillingFactory {
  static createCardPayload(type: 'visa' | 'mastercard') {
    return {
      number: type === 'visa' ? '4111222233334444' : '5100000000000000',
      cvv: '123',
      name: 'Cardholder Name'
    };
  }
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Build a test data factory that generates random todo titles for your tests:
```typescript
// utils/DataFactory.ts
export class DataFactory {
  static generateTodoTitle(): string {
    return "Todo-" + Math.random().toString(36).substring(2, 7);
  }
}

// Inside your test spec:
// await page.fill(input, DataFactory.generateTodoTitle());
```

---

## 8. Interview Q&A Preparation

**Q1: What is the hazard of static JSON test data in parallel runs?**
* **Expected Answer:** If multiple tests use the same static account details concurrently, actions in one test (like updating a password) will log out or fail other tests using that account.


---

## 9. Chapter Cheat Sheet
```
const user = DataFactory.makeUser();
```