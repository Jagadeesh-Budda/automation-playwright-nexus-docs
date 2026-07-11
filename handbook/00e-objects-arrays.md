# Chapter 5: Objects, Arrays & JSON

## Metadata
* **Part**: Phase 0: Prerequisites
* **Learning Objectives**:
  - Create objects with key-value pairs
  - Store lists of items in arrays
  - Use array methods like map and filter
* **Prerequisites**:
  - Chapter 0D: Variables, Conditions & Loops
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Absolute Beginner

---

## 1. Why This Matters
Test data (usernames, URLs, form inputs) is stored as objects. Table rows, dropdown options, and search results are arrays. You will use these data structures in every single test.

---

## 2. Conceptual Overview
Two data structures form the backbone of all JavaScript programs:

1. Objects — Named Key-Value Pairs:
- An object groups related data under named keys.
- Syntax: { key: value, key2: value2 }
- Access values using dot notation: user.name or bracket notation: user["name"].
- Objects represent real things: a user, a product, a test configuration.

2. Arrays — Ordered Lists:
- An array is a list of items in a specific order.
- Syntax: [item1, item2, item3]
- Access items by index (starting from 0): fruits[0] gives the first item.
- Arrays represent collections: table rows, dropdown options, search results.

3. Useful Array Methods:
- .push(item) — adds an item to the end.
- .length — tells you how many items exist.
- .forEach(fn) — runs a function on every item.
- .map(fn) — transforms every item and returns a new array.
- .filter(fn) — returns only items that pass a condition.

4. JSON (JavaScript Object Notation):
- JSON is the universal data format for APIs and configuration files.
- JSON.stringify(obj) converts an object to a text string.
- JSON.parse(str) converts a text string back to an object.

### Execution Flow Diagram
```
Object: { key: value }     ──► Named properties (like a form with labeled fields)
Array:  [item1, item2]     ──► Ordered list (like rows in a table)
```

---

## 3. Implementation and Code Examples
```typescript
// OBJECTS — Storing structured data
const user = {
  name: "Alice",
  email: "alice@test.com",
  age: 28,
  isAdmin: false
};

console.log("User:", user.name);       // Alice
console.log("Email:", user.email);     // alice@test.com

// ARRAYS — Storing lists
const todoItems = ["Buy groceries", "Write tests", "Read docs"];

console.log("First todo:", todoItems[0]);    // Buy groceries
console.log("Total todos:", todoItems.length); // 3

// Loop through an array
todoItems.forEach((item, index) => {
  console.log((index + 1) + ".", item);
});

// Filter: get only items containing "test"
const testItems = todoItems.filter(item => item.toLowerCase().includes("test"));
console.log("Test items:", testItems); // ["Write tests"]

// Map: transform items to uppercase
const upperItems = todoItems.map(item => item.toUpperCase());
console.log("Upper:", upperItems);
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Use objects to group related properties (user data, config settings).
* Use arrays when you have a list of similar items.
* Prefer .forEach(), .map(), and .filter() over manual for loops.

### Don't
* Do not forget that array indexes start at 0, not 1.
* Do not modify an array while looping through it — it causes skipped items.

---

## 5. Chapter Summary
* Objects store named key-value pairs: { name: "Alice", age: 28 }.
* Arrays store ordered lists: ["item1", "item2", "item3"].
* Array methods (map, filter, forEach) process items without manual loops.

---

## 6. Exercises & Mini-Project

### Exercises
1. Create an object representing a product (name, price, inStock) and print each property.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
const product = {
  name: "Wireless Mouse",
  price: 29.99,
  inStock: true
};

console.log("Product:", product.name);
console.log("Price: $" + product.price);
console.log("In Stock:", product.inStock);
```

</details>

2. Create an array of 5 numbers and use .filter() to get only the numbers greater than 10.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
const numbers = [3, 15, 7, 22, 9];
const bigNumbers = numbers.filter(n => n > 10);
console.log("Numbers > 10:", bigNumbers); // [15, 22]
```

</details>

### Mini-Project
Build a contact book: create an array of 3 user objects, each with name, email, and role. Print a formatted list, then filter to show only users with role "admin".

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution — contact-book.js
const contacts = [
  { name: "Alice", email: "alice@test.com", role: "admin" },
  { name: "Bob", email: "bob@test.com", role: "user" },
  { name: "Carol", email: "carol@test.com", role: "admin" }
];

console.log("=== All Contacts ===");
contacts.forEach((c, i) => {
  console.log((i + 1) + ". " + c.name + " (" + c.role + ") — " + c.email);
});

const admins = contacts.filter(c => c.role === "admin");
console.log("\n=== Admins Only ===");
admins.forEach(a => console.log("- " + a.name));
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Create `todo-data.js` that models todo items as objects in an array:
```javascript
const todos = [
  { title: "Buy groceries", completed: false },
  { title: "Write first test", completed: false },
  { title: "Install Node.js", completed: true }
];

const pending = todos.filter(t => !t.completed);
const done = todos.filter(t => t.completed);
console.log("Pending:", pending.length, "| Done:", done.length);
```

---

## 8. Interview Q&A Preparation

**Q1: What is the difference between an object and an array?**
* **Expected Answer:** An object stores data with named keys (like a dictionary). An array stores data in an ordered list accessed by numeric index. Use objects for structured entities, arrays for collections.


---

## 9. Chapter Cheat Sheet
```
const obj = { key: "val" };  // Object\nconst arr = [1, 2, 3];       // Array\narr.filter(x => x > 1);      // Filter\narr.map(x => x * 2);         // Transform
```