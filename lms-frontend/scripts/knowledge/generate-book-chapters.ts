// scripts/knowledge/generate-book-chapters.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..'); // lms-frontend
const WORKSPACE_ROOT = path.resolve(ROOT_DIR, '..'); // UIAutomation/ui-automation/docs
const HANDBOOK_DIR = path.join(WORKSPACE_ROOT, 'handbook');

interface ChapterData {
  filename: string;
  title: string;
  part: string;
  objectives: string[];
  prerequisites: string[];
  readingTime: string;
  difficulty: string;
  whyItMatters: string;
  diagram: string;
  content: string;
  codeExample: string;
  dos: string[];
  donts: string[];
  summary: string[];
  exercises: string[];
  miniProject: string;
  exerciseSolutions: string[];
  miniProjectSolution: string;
  progressiveProject: string;
  interviewQuestions: { q: string; a: string }[];
  cheatsheet: string;
}

const chapters: ChapterData[] = [
  // PHASE 0: PREREQUISITES FOR ABSOLUTE BEGINNERS
  {
    filename: '00a-terminal-basics.md',
    title: 'Your Computer\'s Command Line',
    part: 'Phase 0: Prerequisites',
    objectives: ['Open a terminal on Windows, Mac, or Linux', 'Navigate folders using cd commands', 'Create files and folders from the command line'],
    prerequisites: ['None — this is the starting point'],
    readingTime: '15 mins',
    difficulty: 'Absolute Beginner',
    whyItMatters: 'Every tool you will use — Node.js, npm, Playwright — is controlled from the command line. If you cannot open a terminal and navigate folders, you cannot run a single test.',
    diagram: `
You (typing commands)
    │
    ▼
[Terminal / PowerShell / Bash]
    │
    ▼
[Operating System executes the command]
    `,
    content: 'A terminal (also called a command line, shell, or console) is a text-based interface to your computer. Instead of clicking icons, you type commands.\\n\\nOn Windows, you will use PowerShell. On Mac or Linux, you will use Terminal.\\n\\nHere are the essential commands you need to know:\\n\\n1. Opening a terminal:\\n- Windows: Press the Windows key, type \"PowerShell\", and click it.\\n- Mac: Press Cmd + Space, type \"Terminal\", and press Enter.\\n\\n2. Navigating folders:\\n- cd foldername — moves into a folder.\\n- cd .. — moves back up one level.\\n- dir (Windows) or ls (Mac/Linux) — lists files in the current folder.\\n\\n3. Creating things:\\n- mkdir my-project — creates a new folder called \"my-project\".\\n- New-Item hello.txt (Windows) or touch hello.txt (Mac/Linux) — creates an empty file.\\n\\n4. Understanding paths:\\n- When you open a terminal, you start in a \"home\" folder.\\n- Every file on your computer has an address called a path (like C:\\\\Users\\\\you\\\\Desktop\\\\file.txt).\\n- The terminal always shows your current location. This is called the \"working directory\".',
    codeExample: `
# Step 1: Open your terminal (PowerShell on Windows)

# Step 2: See where you are right now
cd ~

# Step 3: Create a project folder
mkdir playwright-learning

# Step 4: Move into that folder
cd playwright-learning

# Step 5: Verify you are inside the folder
pwd
# Output: C:\\Users\\YourName\\playwright-learning (Windows)
# Output: /Users/YourName/playwright-learning (Mac)

# Step 6: List contents (it will be empty)
dir    # Windows
ls     # Mac/Linux
    `,
    dos: [
      'Practice navigating folders every day until cd and dir/ls feel natural.',
      'Always check your current directory with pwd before running commands.'
    ],
    donts: [
      'Do not copy-paste commands blindly — type them by hand to build muscle memory.',
      'Do not panic if you see an error. Read the message carefully — it usually tells you what went wrong.'
    ],
    summary: [
      'The terminal is a text-based way to control your computer.',
      'Use cd to move between folders, dir/ls to list files, and mkdir to create folders.',
      'Always know your current working directory before running commands.'
    ],
    exercises: [
      'Create a folder called \"test-project\" inside your home directory, navigate into it, and then navigate back out.',
      'List all files on your Desktop folder using only terminal commands.'
    ],
    miniProject: 'Create the following folder structure using only terminal commands: playwright-learning/tests/, playwright-learning/pages/, playwright-learning/data/.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
mkdir test-project
cd test-project
pwd              # Verify you are inside test-project
cd ..
pwd              # Verify you are back in the parent folder`,
      `# Exercise 2 Solution (Windows):
cd ~\\Desktop
dir

# Exercise 2 Solution (Mac/Linux):
cd ~/Desktop
ls`
    ],
    miniProjectSolution: `# Mini-Project Solution:
mkdir playwright-learning
cd playwright-learning
mkdir tests
mkdir pages
mkdir data
dir    # Verify all three folders exist`,
    progressiveProject: '**TodoMVC Step**: Open your terminal and create the project folder that will hold your entire TodoMVC automation project:\\n```\\nmkdir todomvc-automation\\ncd todomvc-automation\\npwd\\n```\\nThis folder will be your home base for the next 32 chapters.',
    interviewQuestions: [
      {
        q: 'Why is the command line important for test automation?',
        a: 'All automation tools (Node.js, npm, Playwright) are controlled via CLI commands. CI/CD servers do not have graphical interfaces — everything runs through terminal commands.'
      }
    ],
    cheatsheet: 'cd folder    # Enter folder\\ncd ..        # Go back\\ndir / ls     # List files\\nmkdir name   # Create folder\\npwd          # Where am I?'
  },
  {
    filename: '00b-install-nodejs.md',
    title: 'Installing Node.js & npm',
    part: 'Phase 0: Prerequisites',
    objectives: ['Download and install Node.js', 'Verify Node.js and npm are working', 'Understand what npm does'],
    prerequisites: ['Chapter 0A: Your Computer\'s Command Line'],
    readingTime: '10 mins',
    difficulty: 'Absolute Beginner',
    whyItMatters: 'Node.js is the engine that runs JavaScript outside the browser. npm is the package manager that installs tools like Playwright. Without these two, nothing works.',
    diagram: `
[nodejs.org] ──► Download Installer ──► Run Setup ──► node and npm available in terminal
    `,
    content: 'Node.js is a program that lets you run JavaScript on your computer (not just in a web browser). npm (Node Package Manager) comes bundled with Node.js and is the tool that downloads and installs libraries and frameworks.\\n\\nInstallation steps:\\n\\n1. Go to https://nodejs.org\\n2. Download the LTS (Long Term Support) version — it is the stable, recommended version.\\n3. Run the installer. Accept all default options. Click \"Next\" through every screen.\\n4. When installation completes, close and reopen your terminal (this is important!).\\n5. Verify the installation by typing two commands.\\n\\nWhat is npm?\\n- npm is like an app store for JavaScript code.\\n- When you type npm install playwright, npm downloads Playwright from the internet and saves it in your project folder.\\n- The downloaded packages go into a folder called node_modules.\\n- The list of what you installed is saved in a file called package.json.',
    codeExample: `
# After installing Node.js, open a NEW terminal window and type:

node -v
# Expected output: v20.x.x (or similar version number)

npm -v
# Expected output: 10.x.x (or similar version number)

# If both commands show version numbers, you are ready!
# If you see "command not found", close the terminal, reopen it, and try again.
    `,
    dos: [
      'Always download the LTS version from nodejs.org.',
      'Reopen your terminal after installing Node.js.'
    ],
    donts: [
      'Do not install the \"Current\" version — it may have unstable features.',
      'Do not skip the verification step (node -v and npm -v).'
    ],
    summary: [
      'Node.js lets you run JavaScript on your computer.',
      'npm downloads and installs packages like Playwright.',
      'Always verify installation with node -v and npm -v.'
    ],
    exercises: [
      'Install Node.js and verify the version numbers appear in your terminal.',
      'Run node -e "console.log(2 + 3)" in your terminal and observe the output.'
    ],
    miniProject: 'Create a new folder, navigate into it, and run npm init -y to generate a package.json file. Open the file and read its contents.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
node -v
# Output: v20.15.0 (your version may differ)
npm -v
# Output: 10.7.0 (your version may differ)`,
      `# Exercise 2 Solution:
node -e "console.log(2 + 3)"
# Output: 5
# This proves Node.js can execute JavaScript from your terminal!`
    ],
    miniProjectSolution: `# Mini-Project Solution:
mkdir my-first-project
cd my-first-project
npm init -y
# Output: Wrote to .../package.json
# Open the file to see: { "name": "my-first-project", "version": "1.0.0", ... }`,
    progressiveProject: '**TodoMVC Step**: Navigate into your `todomvc-automation` folder and initialize it as a Node.js project:\\n```\\ncd todomvc-automation\\nnpm init -y\\n```\\nThis creates `package.json` — the file that tracks your project dependencies.',
    interviewQuestions: [
      {
        q: 'What is the difference between Node.js and npm?',
        a: 'Node.js is the JavaScript runtime engine. npm is the package manager that comes with Node.js, used to install third-party libraries and tools.'
      }
    ],
    cheatsheet: 'node -v         # Check Node version\\nnpm -v          # Check npm version\\nnpm init -y     # Create package.json\\nnpm install pkg # Install a package'
  },
  {
    filename: '00c-first-program.md',
    title: 'Your First JavaScript Program',
    part: 'Phase 0: Prerequisites',
    objectives: ['Create a JavaScript file', 'Write and run console.log statements', 'Understand the write-run-observe cycle'],
    prerequisites: ['Chapter 0B: Installing Node.js & npm'],
    readingTime: '10 mins',
    difficulty: 'Absolute Beginner',
    whyItMatters: 'Before you can write a test, you need to know how to create a file, write code in it, and run it. This chapter gives you that fundamental feedback loop.',
    diagram: `
[Create File] ──► [Write Code] ──► [Run with node] ──► [See Output] ──► [Edit & Repeat]
    `,
    content: 'Programming is a cycle: you write instructions in a file, run the file, observe the result, and then improve. This chapter teaches that cycle using the simplest possible program.\\n\\nWhat is console.log?\\n- It is a command that prints text to your terminal.\\n- Think of it as the \"print\" button for code.\\n- It is the most important debugging tool you will ever use.\\n\\nHow to create a file:\\n- Open your terminal in your project folder.\\n- You can create a file using the terminal or a text editor.\\n- We recommend installing VS Code (https://code.visualstudio.com) — it is a free text editor built for coding.\\n- In VS Code, open your project folder (File → Open Folder), then create a new file.\\n\\nYour first program:\\n- Create a file called hello.js (the .js extension means JavaScript).\\n- Type console.log(\"Hello, World!\"); inside the file.\\n- Save the file.\\n- In your terminal, type node hello.js and press Enter.\\n- You will see \"Hello, World!\" printed in the terminal.',
    codeExample: `
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
    `,
    dos: [
      'Install VS Code and use it to write all your code.',
      'Save your file before running it (Ctrl+S / Cmd+S).',
      'Read the output after every run — it tells you exactly what happened.'
    ],
    donts: [
      'Do not forget the semicolon at the end of each statement (it is optional in JS but good practice).',
      'Do not forget to save the file before running node hello.js — you will run the old version.'
    ],
    summary: [
      'Programming is a write → run → observe → edit cycle.',
      'console.log() prints output to your terminal.',
      'Create .js files and run them with the node command.'
    ],
    exercises: [
      'Create a file called math.js that prints the results of 10 * 5, 100 / 4, and 7 - 3.',
      'Create a file called about-me.js that prints your name, age, and favorite food on separate lines.'
    ],
    miniProject: 'Build a file called calculator.js that calculates and prints the total cost of 3 items: a book ($12.99), a pen ($2.50), and a notebook ($5.75). Print each item and the total.',
    exerciseSolutions: [
      `// Exercise 1 Solution — math.js
console.log("10 * 5 =", 10 * 5);   // 50
console.log("100 / 4 =", 100 / 4); // 25
console.log("7 - 3 =", 7 - 3);     // 4`,
      `// Exercise 2 Solution — about-me.js
console.log("Name: Alice");
console.log("Age: 28");
console.log("Favorite food: Pizza");`
    ],
    miniProjectSolution: `// Mini-Project Solution — calculator.js
const book = 12.99;
const pen = 2.50;
const notebook = 5.75;

console.log("Book: $" + book);
console.log("Pen: $" + pen);
console.log("Notebook: $" + notebook);

const total = book + pen + notebook;
console.log("Total: $" + total);
// Output: Total: $21.24`,
    progressiveProject: '**TodoMVC Step**: Inside your `todomvc-automation` folder, create a file called `plan.js` and run it:\\n```javascript\\n// File: plan.js\\nconsole.log("=== TodoMVC Automation Project ===" );\\nconsole.log("Target: https://demo.playwright.dev/todomvc");\\nconsole.log("Goal: Full E2E test suite with Page Objects and CI/CD");\\nconsole.log("Starting from zero. Let\'s go!");\\n```\\nRun: `node plan.js`',
    interviewQuestions: [
      {
        q: 'What does console.log do?',
        a: 'It prints output to the terminal. It is the primary tool for debugging and verifying that code is executing correctly.'
      }
    ],
    cheatsheet: 'console.log("text");   // Print text\\nnode filename.js       // Run a JS file'
  },
  {
    filename: '00d-variables-controlflow.md',
    title: 'Variables, Conditions & Loops',
    part: 'Phase 0: Prerequisites',
    objectives: ['Store values in variables', 'Make decisions with if/else', 'Repeat actions with for loops'],
    prerequisites: ['Chapter 0C: Your First JavaScript Program'],
    readingTime: '20 mins',
    difficulty: 'Absolute Beginner',
    whyItMatters: 'Every test stores values (URLs, usernames), makes decisions (did the button appear?), and repeats actions (check every row in a table). These are the three pillars of programming.',
    diagram: `
[Store Data] ──► [Make Decision] ──► [Repeat if needed]
     │                 │                     │
 let x = 5      if (x > 3) { }      for (let i=0; i<5; i++)
    `,
    content: 'This chapter teaches the three building blocks that every program uses.\\n\\n1. Variables — Storing Data:\\n- A variable is a named container that holds a value.\\n- const name = \"Alice\"; — creates a constant (cannot be changed).\\n- let age = 25; — creates a variable that can be updated.\\n- You can store text (strings), numbers, true/false (booleans), and more.\\n\\n2. Conditions — Making Decisions:\\n- if checks whether something is true, and runs code accordingly.\\n- else runs when the condition is false.\\n- else if adds additional checks.\\n- Comparison operators: === (equals), !== (not equals), > (greater than), < (less than).\\n\\n3. Loops — Repeating Actions:\\n- A for loop repeats a block of code a specific number of times.\\n- It has three parts: start (let i = 0), condition (i < 5), and step (i++).\\n- i++ means \"add 1 to i after each loop\".\\n- Loops are essential for checking every item in a list or every row in a table.',
    codeExample: `
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
    `,
    dos: [
      'Use const for values that never change (URLs, config) and let for values that do (counters, flags).',
      'Always use === (triple equals) for comparisons, not == (double equals).',
      'Read loop code from left to right: start → condition → step.'
    ],
    donts: [
      'Do not use var — it causes scope bugs (you will learn why in Chapter 1).',
      'Do not create infinite loops — always ensure the loop condition will eventually be false.'
    ],
    summary: [
      'Variables store data: const for fixed values, let for changing values.',
      'Conditions (if/else) let code make decisions based on runtime states.',
      'Loops (for) repeat actions a specific number of times.'
    ],
    exercises: [
      'Write a script that stores a test score in a variable and prints "PASS" if it is 70 or above, and "FAIL" otherwise.',
      'Write a loop that prints the numbers 1 through 10, and for each number prints whether it is even or odd.'
    ],
    miniProject: 'Build a password strength checker: store a password string, check its length, and print "Weak" (under 6 chars), "Medium" (6-10 chars), or "Strong" (over 10 chars).',
    exerciseSolutions: [
      `// Exercise 1 Solution:
const testScore = 85;

if (testScore >= 70) {
  console.log("PASS");
} else {
  console.log("FAIL");
}`,
      `// Exercise 2 Solution:
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) {
    console.log(i, "is even");
  } else {
    console.log(i, "is odd");
  }
}`
    ],
    miniProjectSolution: `// Mini-Project Solution — password-checker.js
const password = "MySecretPass123";

if (password.length < 6) {
  console.log("Weak — password is too short (" + password.length + " chars)");
} else if (password.length <= 10) {
  console.log("Medium — password is okay (" + password.length + " chars)");
} else {
  console.log("Strong — password is solid (" + password.length + " chars)");
}`,
    progressiveProject: '**TodoMVC Step**: Create `todo-validator.js` that validates todo titles before they are added:\\n```javascript\\nconst todoTitle = "Buy groceries";\\n\\nif (todoTitle.length === 0) {\\n  console.log("Error: Todo title cannot be empty");\\n} else if (todoTitle.length > 100) {\\n  console.log("Error: Todo title is too long");\\n} else {\\n  console.log("Valid todo: " + todoTitle);\\n}\\n\\n// Bonus: Loop through multiple todos\\nconst todos = ["Buy groceries", "", "Read Playwright docs", "A very long todo item that exceeds one hundred characters and should be rejected by our validation logic here"];\\nfor (let i = 0; i < todos.length; i++) {\\n  console.log("Checking todo " + (i + 1) + ": " + (todos[i].length === 0 ? "EMPTY" : todos[i].length > 100 ? "TOO LONG" : "VALID"));\\n}\\n```',
    interviewQuestions: [
      {
        q: 'What is the difference between const and let?',
        a: 'const creates a variable that cannot be reassigned. let creates a variable that can be updated. const is preferred for values that should not change.'
      }
    ],
    cheatsheet: 'const x = 5;            // Constant\\nlet y = 10;              // Mutable\\nif (x === 5) { }         // Condition\\nfor (let i=0; i<5; i++)  // Loop'
  },
  {
    filename: '00e-objects-arrays.md',
    title: 'Objects, Arrays & JSON',
    part: 'Phase 0: Prerequisites',
    objectives: ['Create objects with key-value pairs', 'Store lists of items in arrays', 'Use array methods like map and filter'],
    prerequisites: ['Chapter 0D: Variables, Conditions & Loops'],
    readingTime: '20 mins',
    difficulty: 'Absolute Beginner',
    whyItMatters: 'Test data (usernames, URLs, form inputs) is stored as objects. Table rows, dropdown options, and search results are arrays. You will use these data structures in every single test.',
    diagram: `
Object: { key: value }     ──► Named properties (like a form with labeled fields)
Array:  [item1, item2]     ──► Ordered list (like rows in a table)
    `,
    content: 'Two data structures form the backbone of all JavaScript programs:\\n\\n1. Objects — Named Key-Value Pairs:\\n- An object groups related data under named keys.\\n- Syntax: { key: value, key2: value2 }\\n- Access values using dot notation: user.name or bracket notation: user[\"name\"].\\n- Objects represent real things: a user, a product, a test configuration.\\n\\n2. Arrays — Ordered Lists:\\n- An array is a list of items in a specific order.\\n- Syntax: [item1, item2, item3]\\n- Access items by index (starting from 0): fruits[0] gives the first item.\\n- Arrays represent collections: table rows, dropdown options, search results.\\n\\n3. Useful Array Methods:\\n- .push(item) — adds an item to the end.\\n- .length — tells you how many items exist.\\n- .forEach(fn) — runs a function on every item.\\n- .map(fn) — transforms every item and returns a new array.\\n- .filter(fn) — returns only items that pass a condition.\\n\\n4. JSON (JavaScript Object Notation):\\n- JSON is the universal data format for APIs and configuration files.\\n- JSON.stringify(obj) converts an object to a text string.\\n- JSON.parse(str) converts a text string back to an object.',
    codeExample: `
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
    `,
    dos: [
      'Use objects to group related properties (user data, config settings).',
      'Use arrays when you have a list of similar items.',
      'Prefer .forEach(), .map(), and .filter() over manual for loops.'
    ],
    donts: [
      'Do not forget that array indexes start at 0, not 1.',
      'Do not modify an array while looping through it — it causes skipped items.'
    ],
    summary: [
      'Objects store named key-value pairs: { name: "Alice", age: 28 }.',
      'Arrays store ordered lists: ["item1", "item2", "item3"].',
      'Array methods (map, filter, forEach) process items without manual loops.'
    ],
    exercises: [
      'Create an object representing a product (name, price, inStock) and print each property.',
      'Create an array of 5 numbers and use .filter() to get only the numbers greater than 10.'
    ],
    miniProject: 'Build a contact book: create an array of 3 user objects, each with name, email, and role. Print a formatted list, then filter to show only users with role "admin".',
    exerciseSolutions: [
      `// Exercise 1 Solution:
const product = {
  name: "Wireless Mouse",
  price: 29.99,
  inStock: true
};

console.log("Product:", product.name);
console.log("Price: $" + product.price);
console.log("In Stock:", product.inStock);`,
      `// Exercise 2 Solution:
const numbers = [3, 15, 7, 22, 9];
const bigNumbers = numbers.filter(n => n > 10);
console.log("Numbers > 10:", bigNumbers); // [15, 22]`
    ],
    miniProjectSolution: `// Mini-Project Solution — contact-book.js
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
console.log("\\n=== Admins Only ===");
admins.forEach(a => console.log("- " + a.name));`,
    progressiveProject: '**TodoMVC Step**: Create `todo-data.js` that models todo items as objects in an array:\\n```javascript\\nconst todos = [\\n  { title: "Buy groceries", completed: false },\\n  { title: "Write first test", completed: false },\\n  { title: "Install Node.js", completed: true }\\n];\\n\\nconst pending = todos.filter(t => !t.completed);\\nconst done = todos.filter(t => t.completed);\\nconsole.log("Pending:", pending.length, "| Done:", done.length);\\n```',
    interviewQuestions: [
      {
        q: 'What is the difference between an object and an array?',
        a: 'An object stores data with named keys (like a dictionary). An array stores data in an ordered list accessed by numeric index. Use objects for structured entities, arrays for collections.'
      }
    ],
    cheatsheet: 'const obj = { key: "val" };  // Object\\nconst arr = [1, 2, 3];       // Array\\narr.filter(x => x > 1);      // Filter\\narr.map(x => x * 2);         // Transform'
  },
  {
    filename: '00f-functions-modules.md',
    title: 'Functions & Importing Files',
    part: 'Phase 0: Prerequisites',
    objectives: ['Write reusable functions', 'Understand arrow function syntax', 'Split code across multiple files using import/export'],
    prerequisites: ['Chapter 0E: Objects, Arrays & JSON'],
    readingTime: '15 mins',
    difficulty: 'Absolute Beginner',
    whyItMatters: 'Tests are built from reusable functions. Page Objects, helpers, and utilities are all functions organized in separate files. Understanding import/export is how you structure a real project.',
    diagram: `
[helpers.js]                    [test.js]
  export function login()  ──►   import { login } from "./helpers.js"
  export function logout() ──►   login(); logout();
    `,
    content: 'A function is a reusable block of code that performs a specific task. Instead of writing the same code over and over, you write it once inside a function and call it whenever you need it.\\n\\n1. Basic Functions:\\n- function greet(name) { return \"Hello, \" + name; }\\n- Call it: greet(\"Alice\") returns \"Hello, Alice\".\\n- Parameters are inputs. Return values are outputs.\\n\\n2. Arrow Functions:\\n- A shorter way to write functions: const greet = (name) => \"Hello, \" + name;\\n- Arrow functions are used everywhere in Playwright (callbacks, event handlers).\\n- For single expressions, you can omit the curly braces and return keyword.\\n\\n3. Splitting Code Across Files:\\n- As your project grows, you will have hundreds of lines of code.\\n- Organize code by putting related functions in separate files.\\n- Use export to make a function available to other files.\\n- Use import to bring a function from another file into the current file.\\n- This is how Page Objects and test helpers are structured in real projects.',
    codeExample: `
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
    `,
    dos: [
      'Give functions clear, descriptive names that explain what they do.',
      'Use arrow functions for short, inline operations.',
      'Keep each file focused on one responsibility.'
    ],
    donts: [
      'Do not write functions that do too many things — split them up.',
      'Do not forget the return keyword if your function needs to give back a value.'
    ],
    summary: [
      'Functions are reusable blocks of code with inputs (parameters) and outputs (return values).',
      'Arrow functions (=>) are a concise syntax used extensively in Playwright.',
      'Use export/import to organize code across multiple files.'
    ],
    exercises: [
      'Write a function called multiply that takes two numbers and returns their product. Call it with 3 different pairs of numbers.',
      'Create two files: math-helpers.js (export an add and subtract function) and app.js (import and use them).'
    ],
    miniProject: 'Build a string utilities module with functions: capitalize(str), truncate(str, maxLen), and countWords(str). Export them and use them in a separate file.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
function multiply(a, b) {
  return a * b;
}

console.log(multiply(3, 4));   // 12
console.log(multiply(7, 8));   // 56
console.log(multiply(10, 0));  // 0`,
      `// Exercise 2 Solution:
// --- File: math-helpers.js ---
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// --- File: app.js ---
import { add, subtract } from "./math-helpers.js";
console.log("5 + 3 =", add(5, 3));       // 8
console.log("10 - 4 =", subtract(10, 4)); // 6`
    ],
    miniProjectSolution: `// --- File: string-utils.js ---
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
console.log(countWords("Buy groceries today")); // 3`,
    progressiveProject: '**TodoMVC Step**: Create `todo-helpers.js` — reusable functions for your automation project:\\n```javascript\\nexport function generateTodoTitle() {\\n  return "Todo-" + Date.now();\\n}\\n\\nexport function formatTodoList(todos) {\\n  return todos.map((t, i) => (i + 1) + ". [" + (t.completed ? "x" : " ") + "] " + t.title).join("\\n");\\n}\\n```\\nThis module will evolve into your Page Object helper layer.',
    interviewQuestions: [
      {
        q: 'What is the difference between a regular function and an arrow function?',
        a: 'Arrow functions use concise syntax (=>) and inherit the this context from their parent scope. Regular functions bind their own this context. Arrow functions are preferred for callbacks and inline operations.'
      }
    ],
    cheatsheet: 'function name(param) { return val; }  // Regular\\nconst fn = (p) => p * 2;               // Arrow\\nexport function fn() { }               // Export\\nimport { fn } from "./file.js";        // Import'
  },
  {
    filename: '00g-errors-debugging.md',
    title: 'Reading Errors & Debugging',
    part: 'Phase 0: Prerequisites',
    objectives: ['Identify common JavaScript error types', 'Read and understand stack traces', 'Use console.log to debug problems'],
    prerequisites: ['Chapter 0F: Functions & Importing Files'],
    readingTime: '15 mins',
    difficulty: 'Absolute Beginner',
    whyItMatters: 'Errors are not failures — they are messages. Every professional developer reads errors hundreds of times per day. Learning to read them calmly is the single most important skill for self-sufficiency.',
    diagram: `
[Error Occurs] ──► Terminal shows error message ──► Read the TYPE ──► Read the LINE NUMBER ──► Fix the code
    `,
    content: 'When code breaks, the terminal prints an error message. This message is your best friend — it tells you exactly what went wrong and where.\\n\\n1. Common Error Types:\\n- SyntaxError: You made a typo. Missing bracket, extra comma, misspelled keyword.\\n- ReferenceError: You used a variable name that does not exist.\\n- TypeError: You tried to do something impossible (like calling .click() on undefined).\\n\\n2. Reading a Stack Trace:\\n- A stack trace is the list of lines printed after an error.\\n- The first line tells you WHAT went wrong (the error type and message).\\n- The second line tells you WHERE it happened (file name, line number, column number).\\n- Always read from the top down.\\n\\n3. Debugging with console.log:\\n- When you do not understand why code behaves unexpectedly, add console.log statements to print values at different points.\\n- This is called \"print debugging\" and every engineer uses it daily.\\n\\n4. How to Google an Error:\\n- Copy the error TYPE and MESSAGE (not the file path).\\n- Example: Search for \"TypeError: Cannot read properties of undefined\" not the full trace.\\n- Add \"JavaScript\" or \"Node.js\" to your search.\\n- Look for Stack Overflow results — they are usually the most helpful.',
    codeExample: `
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
    `,
    dos: [
      'Read error messages calmly — they are instructions, not punishments.',
      'Always look at the line number in the stack trace first.',
      'Use console.log to inspect variable values when debugging.'
    ],
    donts: [
      'Do not delete your code and start over when you see an error — read the message first.',
      'Do not ignore errors — they always have a cause and a fix.'
    ],
    summary: [
      'SyntaxError = typo, ReferenceError = missing variable, TypeError = wrong operation.',
      'Stack traces tell you the exact file and line where the error occurred.',
      'console.log is your primary debugging tool — use it liberally.'
    ],
    exercises: [
      'Intentionally write a program with a SyntaxError, a ReferenceError, and a TypeError. Run each one and practice reading the error messages.',
      'Write a function that has a bug (wrong variable name). Add console.log statements to find and fix the bug.'
    ],
    miniProject: 'Build an error journal: create a file where you document 3 errors you encountered, what the error message said, and how you fixed them. This becomes your personal debugging reference.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
// File 1 — syntax-error.js
// if (true {          // Run this — you'll see: SyntaxError: Unexpected token '{'
//   console.log("hi");
// }

// File 2 — reference-error.js
// console.log(myName); // ReferenceError: myName is not defined

// File 3 — type-error.js
// const data = undefined;
// data.toString();     // TypeError: Cannot read properties of undefined

// Practice reading each error's line number and message!`,
      `// Exercise 2 Solution:
function greetUser(name) {
  // BUG: using 'username' instead of 'name'
  // console.log("Hello, " + username); // ReferenceError!

  // DEBUG: Add console.log to inspect
  console.log("DEBUG — parameter received:", name);

  // FIX: Use the correct variable name
  console.log("Hello, " + name);
}

greetUser("Alice");`
    ],
    miniProjectSolution: `// Mini-Project Solution — error-journal.js
console.log("=== My Error Journal ===\\n");

console.log("Error 1: SyntaxError");
console.log("Message: Unexpected token '{'");
console.log("Cause: Missing closing parenthesis in if statement");
console.log("Fix: Added ) before {\\n");

console.log("Error 2: ReferenceError");
console.log("Message: myName is not defined");
console.log("Cause: Used a variable before declaring it");
console.log("Fix: Added const myName = 'Alice' before the console.log\\n");

console.log("Error 3: TypeError");
console.log("Message: Cannot read properties of undefined");
console.log("Cause: Tried to call .toUpperCase() on an undefined object property");
console.log("Fix: Added an if-check before accessing the property");`,
    progressiveProject: '**TodoMVC Step**: Intentionally break your `plan.js` file and practice reading the error:\\n```javascript\\n// Change this line to create a bug:\\nconsole.log(todoTitle); // ReferenceError — todoTitle is not defined\\n\\n// Read the error message. Note the line number.\\n// Fix it by declaring the variable first:\\nconst todoTitle = "Buy groceries";\\nconsole.log(todoTitle); // Now it works!\\n```',
    interviewQuestions: [
      {
        q: 'What is a stack trace and how do you read it?',
        a: 'A stack trace is a list of function calls printed when an error occurs. Read from top to bottom — the first line shows the error type and message, the second line shows the exact file, line number, and column where it happened.'
      }
    ],
    cheatsheet: 'SyntaxError  → Typo in code\\nReferenceError → Missing variable\\nTypeError → Wrong operation\\nconsole.log(x) → Print to debug'
  },
  {
    filename: '00h-first-playwright-test.md',
    title: 'Your First Playwright Test',
    part: 'Phase 0: Prerequisites',
    objectives: ['Install Playwright in a project', 'Write and run your first automated test', 'Understand what happens when a test runs'],
    prerequisites: ['Chapter 0G: Reading Errors & Debugging'],
    readingTime: '20 mins',
    difficulty: 'Absolute Beginner',
    whyItMatters: 'This is the moment everything clicks. You will write a test, run it, see a real browser open, watch it perform actions automatically, and see the result. This is the foundation for everything that follows.',
    diagram: `
[Install Playwright] ──► [Write test file] ──► [Run npx playwright test] ──► [Browser opens] ──► [Test passes/fails]
    `,
    content: 'This chapter walks you through installing Playwright and running your very first automated test step by step.\\n\\nStep 1: Install Playwright\\n- Open your terminal in your project folder.\\n- Run: npm install -D @playwright/test\\n- Then run: npx playwright install\\n- This downloads the test framework AND the browser engines (Chromium, Firefox, WebKit).\\n\\nStep 2: Create Your Test File\\n- Create a folder called tests inside your project.\\n- Inside tests, create a file called first.spec.ts (the .spec.ts extension tells Playwright this is a test file).\\n- Write a simple test that opens a website and checks the page title.\\n\\nStep 3: Run Your Test\\n- In your terminal, run: npx playwright test\\n- Playwright will open a browser (in headless mode by default), visit the website, check the title, and report the result.\\n- To SEE the browser open visually, run: npx playwright test --headed\\n\\nStep 4: Understand What Happened\\n- npx playwright test told the Playwright runner to find all .spec.ts files and execute them.\\n- The runner launched a headless Chromium browser.\\n- It navigated to the URL you specified.\\n- It checked the page title against your expectation.\\n- It reported PASS or FAIL in your terminal.\\n\\nCongratulations — you just automated a browser!',
    codeExample: `
// File: tests/first.spec.ts
// This is your very first Playwright test!

import { test, expect } from '@playwright/test';

test('verify TodoMVC page title', async ({ page }) => {
  // Step 1: Navigate to the TodoMVC demo app
  await page.goto('https://demo.playwright.dev/todomvc');

  // Step 2: Check that the page title contains "TodoMVC"
  await expect(page).toHaveTitle(/TodoMVC/);

  // Step 3: Verify the main heading is visible
  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
});

// To run this test, type in your terminal:
// npx playwright test
//
// To see the browser open:
// npx playwright test --headed
//
// Expected output:
// Running 1 test using 1 worker
//   ✓ first.spec.ts:5:5 › verify TodoMVC page title (1.2s)
//   1 passed (2.5s)
    `,
    dos: [
      'Run npx playwright test --headed the first time to see the browser in action.',
      'Read the terminal output after every run — it tells you exactly what passed and failed.',
      'Use npx playwright test --ui to open the interactive test viewer.'
    ],
    donts: [
      'Do not skip npx playwright install — without it, there are no browser engines to run tests.',
      'Do not worry about understanding every keyword (async, await, expect) right now — they are explained in later chapters.'
    ],
    summary: [
      'Install Playwright with npm install -D @playwright/test and npx playwright install.',
      'Create test files in a tests/ folder with the .spec.ts extension.',
      'Run tests with npx playwright test. Add --headed to see the browser.'
    ],
    exercises: [
      'Write a second test in the same file that adds a todo item by typing in the input box and pressing Enter. Verify the todo appears in the list.',
      'Run your tests with --headed flag and watch the browser perform the actions.'
    ],
    miniProject: 'Write a small test suite (3 tests) that: (1) checks the page loads, (2) adds a todo and verifies it appears, (3) marks a todo as complete and verifies the strikethrough style.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('add a new todo item', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');

  // Type a new todo in the input box and press Enter
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Buy groceries');
  await input.press('Enter');

  // Verify the todo appears in the list
  await expect(page.getByTestId('todo-title')).toHaveText('Buy groceries');
});`,
      `# Exercise 2 Solution:
# Simply run this command in your terminal:
npx playwright test --headed
# Watch the browser open, navigate to TodoMVC, and perform the actions!`
    ],
    miniProjectSolution: `// Mini-Project Solution — tests/todomvc-basics.spec.ts
import { test, expect } from '@playwright/test';

test('page loads correctly', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  await expect(page).toHaveTitle(/TodoMVC/);
  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
});

test('add a todo item', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Learn Playwright');
  await input.press('Enter');
  await expect(page.getByTestId('todo-title')).toHaveText('Learn Playwright');
});

test('complete a todo item', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Complete this task');
  await input.press('Enter');

  // Click the toggle checkbox to mark as complete
  await page.getByRole('checkbox').click();

  // Verify the todo has the completed class
  await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
});`,
    progressiveProject: '**TodoMVC Step**: This IS the progressive project step! You just wrote your first real Playwright test against TodoMVC. From this point forward, every chapter will add a new capability to this test suite.\\n\\nYour project folder should now look like:\\n```\\ntodomvc-automation/\\n├── package.json\\n├── node_modules/\\n├── tests/\\n│   └── first.spec.ts\\n└── plan.js\\n```',
    interviewQuestions: [
      {
        q: 'What does npx playwright test do?',
        a: 'It launches the Playwright test runner, which scans for .spec.ts files, starts browser engines, executes each test in an isolated browser context, and reports pass/fail results to the terminal.'
      }
    ],
    cheatsheet: 'npm install -D @playwright/test  # Install\\nnpx playwright install            # Get browsers\\nnpx playwright test               # Run tests\\nnpx playwright test --headed      # See browser'
  },
  // PART 1: JS/TS FOR AUTOMATION
  {
    filename: '01-language-scoping.md',
    title: 'Modern JS/TS Variables & Scoping',
    part: 'Part 1: JavaScript & TypeScript for Automation',
    objectives: ['Understand lexical scoping in JS/TS', 'Differentiate const, let, and var', 'Avoid scope pollution in parallel tests'],
    prerequisites: ['Basic programming concepts'],
    readingTime: '15 mins',
    difficulty: 'Beginner',
    whyItMatters: 'Using the incorrect variable scope in tests can cause shared memory leakage between parallel threads, leading to flaky test runs and unpredictable execution states.',
    diagram: `
[Global Scope]
   └── [Block Scope (const / let)] ── Only accessible within curly braces {}
   └── [Function Scope (var)] ────── Leaks out of loops and conditionals
    `,
    content: 'For manual testers transitioning to automated testing, variables are the starting point. In manual testing, you perform actions sequentially. In code, you store usernames, passwords, and URLs in variables.\n\nLet\'s break down the main concepts step-by-step:\n\n1. Variable Declaration:\n- const (Constant): Declares a read-only variable that cannot be reassigned. Use this for values that never change during execution, such as URLs, configuration options, and locator paths.\n- let: Declares a variable that can be updated or reassigned. Use this for loops, counters, or flags.\n- var: The legacy declaration type. Avoid this completely because it does not respect block boundaries and can leak data into other parts of your test, causing confusing errors when tests run in parallel.\n\n2. Lexical and Block Scoping:\n- A block is code enclosed in curly braces {}.\n- When you declare a variable with const or let, it exists only inside those braces. Attempting to access it outside of them results in a ReferenceError.\n\n3. Understanding ReferenceErrors and Stack Traces:\n- When a variable is accessed outside of its scope, the runtime throws a ReferenceError. A stack trace is a list of method calls that shows exactly where the error occurred (including file name, line number, and column number). Learning to read this trace tells you which scope was breached.',
    codeExample: `
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
    `,
    dos: [
      'Always default to const for variable definitions.',
      'Declare loop counters using let to enforce block-scoping.',
      'Read stack traces from the top down to locate the exact file and line of a scoping crash.'
    ],
    donts: [
      'Never declare variables using var inside test suites.',
      'Do not declare mutable variables globally in describe scopes.'
    ],
    summary: [
      'Default to const for all variables to prevent accidental mutations.',
      'Use let only when a variable needs to be reassigned (like loop counters).',
      'Never use var inside modern test automation suites as it violates block scoping boundaries.'
    ],
    exercises: [
      'Fix an assignment error inside a loop by replacing var with let.',
      'Write a scoped helper function that dynamically returns credentials.'
    ],
    miniProject: 'Build a credential state builder class that isolates environment scopes.',
    interviewQuestions: [
      {
        q: 'What is the main danger of using var inside async test loops?',
        a: 'Because var is function-scoped, the loop variable shares the same memory reference. By the time async actions execute, the loop has completed, and all iterations will point to the final value, causing race conditions.'
      }
    ],
    cheatsheet: 'const key = val; // Immutable\nlet varName = val; // Mutable',
    exerciseSolutions: [
      `// Exercise 1 Solution:
// Before (broken):
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // Prints 3, 3, 3
}

// After (fixed):
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // Prints 0, 1, 2
}`,
      `// Exercise 2 Solution:
function getCredentials(env: string) {
  if (env === 'staging') {
    return { user: 'staging_admin', pass: 'stg_pass' };
  }
  return { user: 'prod_admin', pass: 'prod_pass' };
}

const creds = getCredentials('staging');
console.log(creds.user); // staging_admin`
    ],
    miniProjectSolution: `// Mini-Project Solution:
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
console.log(staging.getBaseUrl()); // https://staging.app.com`,
    progressiveProject: '**TodoMVC Step**: Declare scoped constants for the TodoMVC test configuration:\\n```typescript\\nconst BASE_URL = "https://demo.playwright.dev/todomvc";\\nlet todoCount = 0;\\n\\n// Inside a test block — scoped correctly\\nif (todoCount === 0) {\\n  const firstTodo = "Learn scoping";\\n  console.log("Adding:", firstTodo);\\n  todoCount++;\\n}\\n// firstTodo is not accessible here — proper block scoping!\\n```'
  },
  {
    filename: '02-closures-callbacks.md',
    title: 'Functions, Closures, and Callbacks',
    part: 'Part 1: JavaScript & TypeScript for Automation',
    objectives: ['Master arrow function expressions', 'Understand callbacks in event handling', 'Write lexical closures'],
    prerequisites: ['Chapter 1: Modern JS/TS Variables & Scoping'],
    readingTime: '15 mins',
    difficulty: 'Beginner',
    whyItMatters: 'Playwright utilizes callback arguments extensively (e.g. inside page.route checks or expect.poll). Knowing how lexical scopes bind values resolves evaluation bugs.',
    diagram: `
[Parent Context]
   └── [Lexical Closure] ── Holds reference to Parent scope variables
          └── [Callback Execution] ── Evaluates dynamically
    `,
    content: 'To transition from writing basic linear scripts to creating reusable helpers, you must understand how functions carry information. In automation, a function is a reusable block of instructions.\n\nLet\'s break these down step-by-step:\n\n1. Arrow Functions (() => {}):\n- These are a modern, concise way to write functions in JavaScript.\n- Instead of writing function() { return page.click(); }, you write () => page.click().\n- They are extremely useful in class methods because they do not bind their own this context, instead inheriting it lexically.\n\n2. Callbacks:\n- A callback is a function passed as an argument to another function, to be executed later.\n- In Playwright, when we wait for a condition or inspect network routes, we pass a callback specifying what to check once the event occurs.\n\n3. Lexical Closures:\n- A closure is created when an inner function retains access to its parent\'s outer variables, even after the parent function has finished executing. Think of it as a backpack: the inner function carries the parent\'s variables wherever it goes.',
    codeExample: `
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
    `,
    dos: [
      'Use arrow functions for lightweight, inline callback parameters.',
      'Capture snapshot variables in closures for dynamic waits.'
    ],
    donts: [
      'Do not lose contextual bindings by misusing traditional function closures.'
    ],
    summary: [
      'Master arrow functions to write concise, inline test callbacks.',
      'Understand how callbacks allow Playwright functions to execute steps asynchronously.',
      'Leverage closures to retain access to outer variables within async event scopes.'
    ],
    exercises: [
      'Write a function returning a closure that filters page logs by key strings.',
      'Refactor a standard function block callback into a concise arrow expression.'
    ],
    miniProject: 'Create a dynamic logger middleware wrapper using closures.',
    interviewQuestions: [
      {
        q: 'How do arrow functions handle the this context inside Page Objects?',
        a: 'Arrow functions do not bind their own this context; they inherit it lexically from the enclosing scope. This is useful in classes to preserve access to class properties.'
      }
    ],
    cheatsheet: 'const myFunc = () => { ... }; // Arrow function',
    exerciseSolutions: [
      `// Exercise 1 Solution:
function createLogFilter(keyword: string) {
  return (logEntry: string) => logEntry.toLowerCase().includes(keyword.toLowerCase());
}

const errorFilter = createLogFilter('error');
const logs = ['Info: started', 'Error: timeout', 'Error: crash', 'Info: done'];
const errors = logs.filter(errorFilter);
console.log(errors); // ['Error: timeout', 'Error: crash']`,
      `// Exercise 2 Solution:
// Before (standard function):
page.route('**/api', function(route) {
  return route.fulfill({ status: 200, body: '{}' });
});

// After (arrow function):
page.route('**/api', (route) => route.fulfill({ status: 200, body: '{}' }));`
    ],
    miniProjectSolution: `// Mini-Project Solution:
function createLogger(prefix: string) {
  let count = 0;
  return (message: string) => {
    count++;
    console.log('[' + prefix + ' #' + count + '] ' + message);
  };
}

const testLog = createLogger('TEST');
testLog('Started login flow');  // [TEST #1] Started login flow
testLog('Clicked submit');       // [TEST #2] Clicked submit`,
    progressiveProject: '**TodoMVC Step**: Write a closure that generates unique todo titles with an incrementing counter:\\n```typescript\\nfunction createTodoGenerator(prefix: string) {\\n  let counter = 0;\\n  return () => {\\n    counter++;\\n    return prefix + "-" + counter + "-" + Date.now();\\n  };\\n}\\n\\nconst genTodo = createTodoGenerator("Task");\\nconsole.log(genTodo()); // Task-1-1719999...\\nconsole.log(genTodo()); // Task-2-1719999...\\n```'
  },
  {
    filename: '03-async-promises.md',
    title: 'Asynchronous JS: Promises & Event Loop',
    part: 'Part 1: JavaScript & TypeScript for Automation',
    objectives: ['Understand JavaScript single-threaded event loop', 'Master Promises states', 'Implement async/await configurations'],
    prerequisites: ['Chapter 2: Functions, Closures, and Callbacks'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Web automation actions are asynchronous network calls. Forgetting to await a Playwright execution returns a pending Promise, causing the test to pass or fail prematurely.',
    diagram: `
[Call Stack (Node.js Test Runner)]  ──► Send Command via CDP WebSocket ──► [Browser Process]
     ▲                                                                           │
     │                                                                           ▼
[Event Loop] ◄── [Queue (Microtasks)] ◄── Promise resolves/rejects ◄────── Execute page action
    `,
    content: 'JavaScript is a single-threaded execution runtime. It handles concurrent operations by delegating tasks via Promises. In Playwright, it is vital to understand the execution boundary:\n\n1. Execution Boundary:\n- Node.js Process: Runs your test script, manages configuration, runs assertions, and schedules queues.\n- Browser Process (Chromium/Webkit): Renders the web application page under test.\n- Communication Bridge: Node.js and the browser communicate asynchronously over a WebSocket connection using the Chrome DevTools Protocol (CDP).\n\n2. The Async/Await Queue:\n- When you invoke await page.click(), Node.js sends the click command over the WebSocket connection to the browser and registers a pending Promise. The Event Loop suspends the next line in Node.js until the browser signals that the click completed, which resolves the Promise. If you omit await, Node.js fires the event over the socket and immediately continues to the next line before the browser can execute the operation, causing runtime sync failures.',
    codeExample: `
// ✅ Recommended Asynchronous Execution
test('verify details page', async ({ page }) => {
  await page.goto('/dashboard');
  const detailsBtn = page.getByRole('button', { name: 'Details' });
  await detailsBtn.click(); // Pauses Node.js execution thread until browser completes the click
});
    `,
    dos: [
      'Precede every browser action with the await keyword.',
      'Return Promises from helper functions that interact with the page.'
    ],
    donts: [
      'Never omit await on assertions or page actions.',
      'Avoid using .then() and async/await syntax in the same code block.'
    ],
    summary: [
      'Understand that JS is single-threaded and delegates async tasks via the Event Loop.',
      'Always prepend asynchronous page interactions with the await keyword.',
      'Differentiate pending, fulfilled, and rejected promise states in assertions.'
    ],
    exercises: [
      'Fix a test that exits instantly because page.goto is not awaited.',
      'Write a custom async function that waits for an API call and verify the result.'
    ],
    miniProject: 'Build a custom promise-based wait utility that checks system state.',
    interviewQuestions: [
      {
        q: 'Why does forgetting await on a page action cause flaky tests?',
        a: 'Without await, the test runner proceeds to the next line immediately. The target element might not be located, clicked, or verified in time before the browser context is torn down.'
      }
    ],
    cheatsheet: 'async function run() { await page.click(); }',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('fix unawaited goto', async ({ page }) => {
  // Before (broken): page.goto('/dashboard'); — exits instantly
  // After (fixed):
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/dashboard/);
});`,
      `// Exercise 2 Solution:
async function waitForApiResult(page: Page, endpoint: string) {
  const response = await page.request.get(endpoint);
  const data = await response.json();
  return data;
}

test('verify API data', async ({ page }) => {
  const result = await waitForApiResult(page, '/api/status');
  expect(result.status).toBe('healthy');
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
async function waitForCondition(
  checkFn: () => Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 500
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkFn()) return;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Condition not met within ' + timeoutMs + 'ms');
}`,
    progressiveProject: '**TodoMVC Step**: Understand why `await` is required for every Playwright action:\\n```typescript\\ntest("add todo with proper awaits", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Learn async/await"); // Must await!\\n  await input.press("Enter");            // Must await!\\n  // Without await, the test would exit before the browser acts\\n});\\n```'
  },
  {
    filename: '04-typescript-types.md',
    title: 'TypeScript Types, Interfaces, & Generics',
    part: 'Part 1: JavaScript & TypeScript for Automation',
    objectives: ['Define strict TypeScript interfaces', 'Implement type unions', 'Utilize Generics for API utilities'],
    prerequisites: ['Chapter 3: Asynchronous JS: Promises & Event Loop'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Using any types bypasses compiler validations. Type-safe test scripts catch structural bugs, such as missing properties in request payloads, during local compilations.',
    diagram: `
[Raw JSON Data] ──► Runtime Validator ──► Verified Object shape
                          │
                          └── (Validation Fails) ──► Throw Error (Early Fail)
    `,
    content: 'TypeScript extends JavaScript by adding compiler-level types. Using interfaces, union types, and generic interfaces allows developers to structure page methods, response objects, and payload data factories safely.\n\nHowever, a common anti-pattern in TypeScript is type casting using the as T operator (e.g., res.json() as User). This forces the compiler to ignore validation, which overrides safety. If the API schema changes at runtime, the compiler will not catch it, causing silent errors and contract drift. To prevent this, generics should be combined with runtime validation functions that inspect and verify the object structure before return.',
    codeExample: `
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
    `,
    dos: [
      'Define interfaces for all API response payloads.',
      'Combine Generic functions with runtime type-guards to validate payload shapes safely.'
    ],
    donts: [
      'Avoid using the any type fallback in production code.',
      'Never use raw "as T" casting on dynamic network responses without a validation safeguard.'
    ],
    summary: [
      'Declare strict TypeScript interfaces to validate test payload configurations.',
      'Eliminate any from the codebase to enable full compiler-level validation.',
      'Use Generics to construct reusable, type-safe API helper functions.'
    ],
    exercises: [
      'Create a type-safe checkout credentials interface and use it in a mock login page.',
      'Write a generic function that parses database row columns safely.'
    ],
    miniProject: 'Build a generic API validation middleware using TypeScript models.',
    interviewQuestions: [
      {
        q: 'Why are Generics preferred over any in utility methods?',
        a: 'Generics preserve the original type throughout execution. The calling code gets full autocompletion and compiler validation based on the specific type passed, which any disables.'
      }
    ],
    cheatsheet: 'interface User { id: number; }',
    exerciseSolutions: [
      `// Exercise 1 Solution:
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
};`,
      `// Exercise 2 Solution:
function parseDbRow<T>(row: unknown, validator: (data: unknown) => data is T): T {
  if (validator(row)) return row;
  throw new Error('Row does not match expected schema');
}

interface ProductRow { id: number; name: string; price: number; }
function isProductRow(data: unknown): data is ProductRow {
  const d = data as any;
  return typeof d?.id === 'number' && typeof d?.name === 'string' && typeof d?.price === 'number';
}`
    ],
    miniProjectSolution: `// Mini-Project Solution:
import { z } from 'zod';

const ApiResponseSchema = z.object({
  data: z.object({ id: z.number(), name: z.string() }),
  statusCode: z.number()
});

type ApiResponse = z.infer<typeof ApiResponseSchema>;

function validateResponse(raw: unknown): ApiResponse {
  return ApiResponseSchema.parse(raw);
}`,
    progressiveProject: '**TodoMVC Step**: Define a TypeScript interface for TodoMVC data models:\\n```typescript\\ninterface TodoItem {\\n  title: string;\\n  completed: boolean;\\n}\\n\\ninterface TodoAppState {\\n  todos: TodoItem[];\\n  filter: "all" | "active" | "completed";\\n}\\n\\nconst expectedState: TodoAppState = {\\n  todos: [{ title: "Learn TypeScript", completed: false }],\\n  filter: "all"\\n};\\n```'
  },

  // PART 2: PLAYWRIGHT FUNDAMENTALS
  {
    filename: '05-installation-architecture.md',
    title: 'Installation & Core Architecture',
    part: 'Part 2: Playwright Fundamentals',
    objectives: ['Understand Browser, BrowserContext, and Page hierarchy', 'Explain Chrome DevTools Protocol (CDP) interactions', 'Configure basic test runner settings'],
    prerequisites: ['Chapter 4: TypeScript Types, Interfaces, & Generics'],
    readingTime: '15 mins',
    difficulty: 'Beginner',
    whyItMatters: 'Understanding browser context isolation explains why tests run concurrently without colliding, maximizing speed and efficiency.',
    diagram: `
[Browser Process]
   ├── [BrowserContext A] (Isolated Cookies, Cache, Storage) ──► [Page 1]
   └── [BrowserContext B] (Isolated Cookies, Cache, Storage) ──► [Page 2]
    `,
    content: 'Playwright communicates with browser engines directly using the Chrome DevTools Protocol (CDP) over WebSockets. This removes the Selenium WebDriver REST API translation layer, enabling fast, bidirectional commands and native network interception. Because WebSocket protocols govern communications, Playwright provides APIs to intercept, inspect, and log all WebSocket traffic sent between the client application and browser engine.',
    codeExample: `
// Listen to page WebSocket connections and log client frames
test('track WebSocket messages', async ({ page }) => {
  page.on('websocket', (ws) => {
    console.log('WebSocket connection opened: ' + ws.url());
    
    // Extract and log frames received from the server
    ws.on('framereceived', (frame) => {
      const payloadStr = typeof frame.payload === 'string'
        ? frame.payload
        : frame.payload.toString('utf-8');
      console.log('Frame Received: ' + payloadStr);
    });

    // Extract and log frames sent from the client
    ws.on('framesent', (frame) => {
      const payloadStr = typeof frame.payload === 'string'
        ? frame.payload
        : frame.payload.toString('utf-8');
      console.log('Frame Sent: ' + payloadStr);
    });
  });
  
  await page.goto('/realtime-chat');
});
    `,
    dos: [
      'Leverage BrowserContexts to isolate sessions.',
      'Use the page.on("websocket") event emitter to log active web socket packet payloads.'
    ],
    donts: [
      'Do not share state between contexts.',
      'Avoid running multiple browsers in a single thread manually.'
    ],
    summary: [
      'Understand Browser, BrowserContext, and Page hierarchy.',
      'Leverage BrowserContexts to isolate cookies, cache, and state per test.',
      'Explain how CDP WebSocket communication replaces REST WebDriver.'
    ],
    exercises: [
      'Install Playwright inside a clean directory and run the initialization wizard.',
      'Add a new browser configuration project to playwright.config.ts.'
    ],
    miniProject: 'Write a runner script that logs WebSocket communication protocols.',
    interviewQuestions: [
      {
        q: 'What is the structural difference between a Browser and a BrowserContext?',
        a: 'A Browser represents the physical browser instance. A BrowserContext is an isolated session within that browser, similar to an Incognito window. It holds independent cookies, local storage, and caches.'
      }
    ],
    cheatsheet: 'npx playwright install // Install browsers',
    exerciseSolutions: [
      `# Exercise 1 Solution:
mkdir my-playwright-project
cd my-playwright-project
npm init -y
npm install -D @playwright/test
npx playwright install
npx playwright test  # Run the example tests`,
      `// Exercise 2 Solution — playwright.config.ts:
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
page.on('websocket', (ws) => {
  console.log('WebSocket URL:', ws.url());
  ws.on('framereceived', (frame) => {
    const payload = typeof frame.payload === 'string' ? frame.payload : frame.payload.toString('utf-8');
    console.log('Received:', payload);
  });
  ws.on('framesent', (frame) => {
    const payload = typeof frame.payload === 'string' ? frame.payload : frame.payload.toString('utf-8');
    console.log('Sent:', payload);
  });
});`,
    progressiveProject: '**TodoMVC Step**: Explore the Browser → Context → Page hierarchy by creating multiple contexts:\\n```typescript\\ntest("understand context isolation", async ({ browser }) => {\\n  const context1 = await browser.newContext();\\n  const context2 = await browser.newContext();\\n  const page1 = await context1.newPage();\\n  const page2 = await context2.newPage();\\n  // page1 and page2 have completely separate cookies and storage\\n  await page1.goto("https://demo.playwright.dev/todomvc");\\n  await page2.goto("https://demo.playwright.dev/todomvc");\\n  await context1.close();\\n  await context2.close();\\n});\\n```'
  },
  {
    filename: '06-navigation-actions.md',
    title: 'Navigating & Basic Actions',
    part: 'Part 2: Playwright Fundamentals',
    objectives: ['Master page navigation events', 'Differentiate action methods', 'Understand page actionability sequence'],
    prerequisites: ['Chapter 5: Installation & Core Architecture'],
    readingTime: '15 mins',
    difficulty: 'Beginner',
    whyItMatters: 'Page interactions require elements to meet actionability standards. If elements are hidden or blocked, actions fail, signaling design bugs.',
    diagram: `
[Element Rendered] ──► Passes Actionability (Visible/Stable) ──► Click Triggered ──► JS Event Listener Not Bound (Hydration Delay) ──► Click Lost
    `,
    content: 'Playwright does not click blindly. For every action, it checks if the target element is attached, visible, stable, enabled, and not covered. However, a major source of flakiness in Single Page Applications (SPAs) and micro-frontends is the "Hydration click gap". In modern frontend frameworks, elements are drawn on screen quickly (Server-Side Rendered or Static HTML) but their JavaScript event handlers have not finished downloading or executing. When this occurs, the element passes all actionability checks, but the click event is lost because the click listener is not bound yet. To solve this, tests should wait for specific hydration attributes (e.g., checking data attributes like data-hydrated="true") rather than executing repetitive clicks that could trigger duplicate network requests if the button is partially bound.',
    codeExample: `
test('execute user interactions with hydration safety', async ({ page }) => {
  await page.goto('/form');
  
  const submitBtn = page.getByRole('button', { name: 'Submit' });
  
  // Wait for explicit hydration attribute before execution
  await expect(submitBtn).toHaveAttribute('data-hydrated', 'true', { timeout: 5000 });
  await submitBtn.click();
  
  await expect(page.getByText('Form Submitted')).toBeVisible();
});
    `,
    dos: [
      'Use the correct action method (.check(), .fill(), .hover()) instead of generic clicks.',
      'Mitigate hydration click gaps in SPAs by waiting for hydration states.'
    ],
    donts: [
      'Do not insert arbitrary page timeouts after navigations.',
      'Avoid forcing clicks unless absolutely necessary.',
      'Do not wrap click operations in repeating toPass retry loops as they can cause duplicate submissions.'
    ],
    summary: [
      'Master Playwright\'s actionability checks (visible, stable, enabled).',
      'Use page.goto and direct action methods instead of blind clicks.',
      'Avoid hardcoded timers; leverage auto-waiting on load states.'
    ],
    exercises: [
      'Write a test that navigates to a form, fills inputs, and clicks submit.',
      'Intercept navigation load states using page.waitForLoadState.'
    ],
    miniProject: 'Build an interactive form checking page and validate input states.',
    interviewQuestions: [
      {
        q: 'What does Playwright verify before clicking a button?',
        a: 'It checks if the button is attached to the DOM, visible on screen, stable (not animating), enabled (not disabled), and can receive pointer events at the click coordinates.'
      }
    ],
    cheatsheet: 'await page.goto("/url");\nawait locator.click();',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('fill and submit a form', async ({ page }) => {
  await page.goto('/form');
  await page.getByLabel('Username').fill('testuser');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Welcome')).toBeVisible();
});`,
      `// Exercise 2 Solution:
test('intercept navigation states', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  console.log('Network idle — all resources loaded');
  await page.waitForLoadState('domcontentloaded');
  console.log('DOM ready');
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
test('interactive form with hydration check', async ({ page }) => {
  await page.goto('/checkout');
  const submitBtn = page.getByRole('button', { name: 'Pay Now' });
  await expect(submitBtn).toHaveAttribute('data-hydrated', 'true', { timeout: 5000 });
  await page.getByLabel('Name').fill('Alice');
  await page.getByLabel('Card').fill('4111222233334444');
  await submitBtn.click();
  await expect(page.getByText('Payment confirmed')).toBeVisible();
});`,
    progressiveProject: '**TodoMVC Step**: Navigate to TodoMVC and add a todo using page actions:\\n```typescript\\ntest("add todo using fill and keyboard", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Navigate and act");\\n  await input.press("Enter");\\n  await expect(page.getByTestId("todo-title")).toHaveText("Navigate and act");\\n});\\n```'
  },
  {
    filename: '07-locators-deep.md',
    title: 'Locators & Selector Engines',
    part: 'Part 2: Playwright Fundamentals',
    objectives: ['Apply the Locator Priority Ladder rules', 'Chain locators effectively', 'Resolve strict mode violations cleanly'],
    prerequisites: ['Chapter 6: Navigating & Basic Actions'],
    readingTime: '20 mins',
    difficulty: 'Beginner',
    whyItMatters: 'Writing fragile CSS or XPath selectors leads to flaky tests. Accessibility-first locators make your test suite highly resilient to layout changes.',
    diagram: `
Test Code ──► Locator Created ──► .click() Action ──► DOM Search Executed ──► Action Completed
                  │
                  ▼
          (Lazy Evaluation)
    `,
    content: 'Locators are queries that search the page. They are lazily evaluated: they do not query the DOM when created, but run when an action is called. They automatically retry if the DOM updates, eliminating stale element exceptions. In design, you should construct chained queries starting from an accessible container role to avoid brittle layout selections.',
    codeExample: `
// Locators chaining following the priority accessibility ladder
const checkoutForm = page.getByRole('form', { name: 'Checkout' });
const creditCardInput = checkoutForm.getByRole('textbox', { name: 'Credit Card Number' });
await creditCardInput.fill('4111222233334444');
    `,
    dos: [
      'Query using accessible roles (getByRole) first.',
      'Filter list items using .filter() based on text content.'
    ],
    donts: [
      'Avoid using raw index numbers like .nth(0) for dynamic lists.',
      'Do not write long CSS paths or brittle XPaths.'
    ],
    summary: [
      'Follow the Locator Priority Ladder (getByRole, getByLabel, etc.).',
      'Rely on lazy evaluation: queries run only when actions execute.',
      'Solve strict mode violations by narrow chaining or filtering.'
    ],
    exercises: [
      'Refactor a selector path from an XPath string to a semantic getByRole locator.',
      'Create a nested search loop that clicks edit buttons inside dynamic table rows.'
    ],
    miniProject: 'Write a script that sweeps a product listing page and compiles prices.',
    interviewQuestions: [
      {
        q: 'Why are locators called "lazy" in Playwright?',
        a: 'Locators do not query the browser when declared. They only search the DOM when an action (like click or fill) is executed, ensuring the latest page state is queried.'
      }
    ],
    cheatsheet: 'const btn = page.getByRole("button", { name: "Save" });',
    exerciseSolutions: [
      `// Exercise 1 Solution:
// Before (XPath):
// page.locator('//div[@class="main"]/ul/li[1]/button');

// After (semantic getByRole):
const editBtn = page.getByRole('listitem').first().getByRole('button', { name: 'Edit' });`,
      `// Exercise 2 Solution:
test('click edit on each table row', async ({ page }) => {
  const rows = page.getByRole('row');
  const count = await rows.count();
  for (let i = 1; i < count; i++) {
    const row = rows.nth(i);
    await row.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
  }
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
test('sweep product prices', async ({ page }) => {
  await page.goto('/products');
  const prices = await page.getByRole('listitem').allTextContents();
  const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
  console.log('All prices:', numericPrices);
  console.log('Total:', numericPrices.reduce((a, b) => a + b, 0));
});`,
    progressiveProject: '**TodoMVC Step**: Locate todos using semantic locators and chaining:\\n```typescript\\ntest("locate todos with getByRole", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Task A");\\n  await input.press("Enter");\\n  await input.fill("Task B");\\n  await input.press("Enter");\\n\\n  // Locate by test ID\\n  const todos = page.getByTestId("todo-title");\\n  await expect(todos).toHaveCount(2);\\n\\n  // Filter to find specific todo\\n  const taskB = page.getByRole("listitem").filter({ hasText: "Task B" });\\n  await expect(taskB).toBeVisible();\\n});\\n```'
  },
  {
    filename: '08-assertions-webfirst.md',
    title: 'Web-First Assertions',
    part: 'Part 2: Playwright Fundamentals',
    objectives: ['Master Web-First assertions polling rules', 'Implement soft assertions', 'Configure polling loops using expect.poll'],
    prerequisites: ['Chapter 7: Locators & Selector Engines'],
    readingTime: '20 mins',
    difficulty: 'Beginner',
    whyItMatters: 'Using assertions that do not retry leads to race conditions. Web-First assertions wait for elements to match, ensuring robust tests.',
    diagram: `
expect(loc).toBeVisible() ──► Check DOM ──► Match? ──► YES ──► Pass
                                 │
                                 ▼ (NO)
                              Retry (up to 5s) ──► Timeout ──► Fail
    `,
    content: 'Playwright introduces Web-First assertions. By passing locators directly to expect, assertions automatically check conditions in a loop until the state matches or the timeout limit is reached. For checking background server tasks, databases, or REST APIs that update outside the DOM, expect.poll allows running real asynchronous checks continuously.',
    codeExample: `
// Asynchronous database state verification using API polling
await expect.poll(async () => {
  const response = await page.request.get('/api/job-status/456', {
    headers: {
      'Authorization': 'Bearer token123',
      'Accept': 'application/json'
    }
  });
  if (response.status() !== 200) {
    throw new Error('API server returned error code: ' + response.status());
  }
  const result = await response.json();
  return result.status;
}, {
  timeout: 10000,
  intervals: [1000, 2000]
}).toBe('SUCCESS');
    `,
    dos: [
      'Always pass locator objects directly to expect().',
      'Use expect.soft() when validating secondary elements.'
    ],
    donts: [
      'Avoid assertions against static variables, e.g. expect(await loc.isVisible()).toBe(true).'
    ],
    summary: [
      'Pass locator objects directly to expect for auto-retry validations.',
      'Use expect.soft to track secondary failures without halting runs.',
      'Configure expect.poll to wait dynamically for database/API states.'
    ],
    exercises: [
      'Write a validation suite using expect.soft to inspect card layout details.',
      'Configure expect.toPass to repeat a refresh action until a result appears.'
    ],
    miniProject: 'Build a dashboard checker page with soft assertions.',
    interviewQuestions: [
      {
        q: 'What is the main benefit of Web-First assertions over basic assertions?',
        a: 'Web-First assertions auto-retry. They query the element state continuously up to a timeout, resolving race conditions when elements render asynchronously.'
      }
    ],
    cheatsheet: 'await expect(locator).toBeVisible();',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('soft assert card layout', async ({ page }) => {
  await page.goto('/dashboard');
  const card = page.locator('.product-card').first();
  await expect.soft(card.getByRole('img')).toBeVisible();
  await expect.soft(card.getByRole('heading')).toHaveText(/.+/);
  await expect.soft(card.getByText('$')).toBeVisible();
});`,
      `// Exercise 2 Solution:
test('wait for data refresh', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(async () => {
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByTestId('result')).toHaveText(/data-loaded/);
  }).toPass({ timeout: 15000, intervals: [1000, 2000] });
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
test('dashboard soft assertion checker', async ({ page }) => {
  await page.goto('/dashboard');
  const cards = page.locator('.dashboard-card');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    await expect.soft(cards.nth(i).getByRole('heading')).toBeVisible();
    await expect.soft(cards.nth(i).getByText('$')).toBeVisible();
  }
});`,
    progressiveProject: '**TodoMVC Step**: Assert todo count and visibility using Web-First assertions:\\n```typescript\\ntest("verify todo state with assertions", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Learn assertions");\\n  await input.press("Enter");\\n\\n  // Web-First: auto-retries until condition matches\\n  await expect(page.getByTestId("todo-title")).toHaveText("Learn assertions");\\n  await expect(page.getByTestId("todo-title")).toHaveCount(1);\\n  await expect(page.getByText("1 item left")).toBeVisible();\\n});\\n```'
  },
  {
    filename: '09-test-organization.md',
    title: 'Test Organization & Hooks',
    part: 'Part 2: Playwright Fundamentals',
    objectives: ['Create describe scopes', 'Implement lifecycle hooks', 'Configure serial and parallel run settings'],
    prerequisites: ['Chapter 8: Web-First Assertions'],
    readingTime: '15 mins',
    difficulty: 'Beginner',
    whyItMatters: 'Correct test grouping isolates specs, shares preconditions cleanly, and ensures tests run safely in parallel.',
    diagram: `
[describe Block]
   ├── test.beforeEach() ──► test A ──► test.afterEach()
   └── test.beforeEach() ──► test B ──► test.afterEach()
    `,
    content: 'Use test.describe blocks to group related tests. Lifecycle hooks (beforeAll, beforeEach, afterEach, afterAll) set up preconditions and clean up environments, keeping tests decoupled.',
    codeExample: `
test.describe('Payment Funnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout');
  });

  test('validate credit card input', async ({ page }) => {
    const cardInput = page.getByRole('textbox', { name: 'Card Details' });
    await cardInput.fill('4111222233334444');
    console.log('Action complete: card number filled.');
  });
});
    `,
    dos: [
      'Group tests by feature areas.',
      'Declare beforeEach hooks to navigate to base URLs.'
    ],
    donts: [
      'Do not share runtime data states across tests.',
      'Avoid running tests serially unless strictly necessary.'
    ],
    summary: [
      'Group related tests inside describe blocks.',
      'Use hook lifecycles (beforeEach, afterAll) to isolate setups.',
      'Enforce serial or parallel structures depending on data dependence.'
    ],
    exercises: [
      'Create a nested describe block mapping cart addition and payment actions.',
      'Set a custom timeout for a single test block.'
    ],
    miniProject: 'Construct a state isolation wrapper for parallel tests.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test.describe('Cart', () => {
  test.describe('Add to Cart', () => {
    test('add single item', async ({ page }) => {
      await page.goto('/products');
      await page.getByRole('button', { name: 'Add' }).first().click();
      await expect(page.getByTestId('cart-count')).toHaveText('1');
    });
  });

  test.describe('Payment', () => {
    test('enter card details', async ({ page }) => {
      await page.goto('/checkout');
      await page.getByLabel('Card').fill('4111222233334444');
    });
  });
});`,
      `// Exercise 2 Solution:
test('slow operation with custom timeout', async ({ page }) => {
  test.setTimeout(60000); // 60 second timeout for this test only
  await page.goto('/long-process');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Done')).toBeVisible({ timeout: 55000 });
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
test.describe('Isolated State Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    // Each test starts fresh due to isolated BrowserContext
  });

  test('user A actions', async ({ page }) => {
    await page.getByLabel('Name').fill('User A');
  });

  test('user B actions', async ({ page }) => {
    // No contamination from User A's state
    await expect(page.getByLabel('Name')).toHaveValue('');
  });
});`,
    progressiveProject: '**TodoMVC Step**: Organize TodoMVC tests into describe blocks with beforeEach navigation:\\n```typescript\\ntest.describe("TodoMVC CRUD", () => {\\n  test.beforeEach(async ({ page }) => {\\n    await page.goto("https://demo.playwright.dev/todomvc");\\n  });\\n\\n  test("add todo", async ({ page }) => {\\n    const input = page.getByPlaceholder("What needs to be done?");\\n    await input.fill("Organized test");\\n    await input.press("Enter");\\n    await expect(page.getByTestId("todo-title")).toHaveText("Organized test");\\n  });\\n\\n  test("delete todo", async ({ page }) => { /* ... */ });\\n});\\n```',
    interviewQuestions: [
      {
        q: 'Why should global variables be avoided in describe blocks?',
        a: 'Since Playwright runs tests in parallel across separate workers, modifying a shared outer variable in one test will corrupt the state in another, causing intermittent failures.'
      }
    ],
    cheatsheet: 'test.describe("Group Name", () => { ... });'
  },

  // PART 3: ADVANCED PLAYWRIGHT
  {
    filename: '10-autowait-internals.md',
    title: 'Auto-Wait Internals',
    part: 'Part 3: Advanced Playwright',
    objectives: ['Deep dive into page actionability checks', 'Expose DOM loading milestones', 'Mitigate hydration delays'],
    prerequisites: ['Chapter 9: Test Organization & Hooks'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Knowing how auto-waiting handles layouts prevents structural race conditions and reduces the need for manual waits.',
    diagram: `
[Action Triggered] ──► [Wait for DOM Attachment] ──► [Wait for Visibility] ──► [Wait for Animation Stability] ──► [Action Completed]
    `,
    content: 'Auto-waiting parses target elements against detailed accessibility and layout checks. Action calls halt until these checks pass or the action timeout throws an exception. Hydration delay is the brief pause where an element is painted (visible) but not yet interactive. Web frameworks render initial HTML layout first (server-rendered), then download client-side JavaScript, parse it, and bind the action event handlers. To mitigate this hydration gap, look for indicator styles or wait for hydration attributes (e.g. data-hydrated="true") before clicking.',
    codeExample: `
// Wait for animation stability by tracking position stability
test('interact with animating layout', async ({ page }) => {
  const dialogBox = page.locator('.modal-dialog');
  
  // Explicitly wait for element animation stability milestones
  await dialogBox.waitFor({ state: 'visible' });
  
  // Perform interaction once stability is guaranteed
  await dialogBox.click();
});
    `,
    dos: [
      'Rely on Playwright auto-waiting instead of adding manual delays.',
      'Check trace files to diagnose actionability check failures.'
    ],
    donts: [
      'Do not wait for load states (networkidle) when checking for single elements.'
    ],
    summary: [
      'Understand DOM milestones: attachment, visibility, stability.',
      'Mitigate React/Vue hydration lags by waiting for target attributes.',
      'Check animation boundaries before triggering pointer coordinate events.'
    ],
    exercises: [
      'Simulate an animating element and check how stability checks handle it.',
      'Configure an action to use an explicit action timeout.'
    ],
    miniProject: 'Build a delayed rendering page simulator and write checks for it.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('handle animating element', async ({ page }) => {
  await page.goto('/animated-modal');
  const modal = page.locator('.modal');
  await modal.waitFor({ state: 'visible' });
  // Element is now stable and clickable
  await modal.getByRole('button', { name: 'Confirm' }).click();
});`,
      `// Exercise 2 Solution:
test('action with explicit timeout', async ({ page }) => {
  await page.goto('/slow-page');
  const btn = page.getByRole('button', { name: 'Load' });
  await btn.click({ timeout: 10000 }); // 10s action timeout
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
test('delayed rendering simulator', async ({ page }) => {
  await page.goto('/delayed-content');
  // Content renders after 3 seconds
  const content = page.getByTestId('lazy-content');
  await content.waitFor({ state: 'visible', timeout: 5000 });
  await expect(content).toContainText('Loaded');
  await content.getByRole('button', { name: 'Action' }).click();
});`,
    progressiveProject: '**TodoMVC Step**: Observe auto-wait behavior by toggling a todo and verifying state:\\n```typescript\\ntest("auto-wait on toggle", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Test auto-wait");\\n  await input.press("Enter");\\n\\n  // Click toggle — Playwright auto-waits for the checkbox\\n  await page.getByRole("checkbox").click();\\n  // Auto-waits for class change\\n  await expect(page.getByTestId("todo-item")).toHaveClass(/completed/);\\n});\\n```',
    interviewQuestions: [
      {
        q: 'How does Playwright determine if an element is stable?',
        a: 'It compares the bounding box of the element over consecutive animation frames. If the coordinates remain identical, the element is stable.'
      }
    ],
    cheatsheet: 'await locator.waitFor({ state: "hidden" });'
  },
  {
    filename: '11-trace-viewer.md',
    title: 'Trace Viewer & Observability',
    part: 'Part 3: Advanced Playwright',
    objectives: ['Configure trace capture options', 'Inspect console calls and network timelines', 'Diagnose failures using DOM snapshots'],
    prerequisites: ['Chapter 10: Auto-Wait Internals'],
    readingTime: '15 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'CI runs fail without browser screens. Traces let you step through DOM snapshots at the exact moment of failure to locate bugs.',
    diagram: `
[CI Failure] ──► Zip Artifact Generated ──► npx playwright show-trace ──► Interactive Timeline UI
    `,
    content: 'The Trace Viewer captures browser interactions. It records action steps, API calls, browser logs, and DOM snapshots, letting you debug test runs locally or from CI builds.',
    codeExample: `
// playwright.config.ts trace options
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    trace: 'retain-on-failure',
  }
});
    `,
    dos: [
      'Enable traces on failure in CI/CD.',
      'Inspect network tab streams inside the trace viewer.'
    ],
    donts: [
      'Do not capture traces for all passing runs, as it slows down executions.'
    ],
    summary: [
      'Capture execution snapshots on retry/failure inside CI pipelines.',
      'Extract network call logs and console prints from trace files.',
      'Inspect DOM snapshots interactively to pinpoint layout bugs.'
    ],
    exercises: [
      'Run a failing test locally with traces enabled.',
      'Open a generated trace zip file using the Playwright CLI.'
    ],
    miniProject: 'Build a trace parsing script that counts API calls.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
# 1. Add to playwright.config.ts:
# use: { trace: 'on' }
# 2. Run a failing test:
npx playwright test --headed
# 3. Open the trace:
npx playwright show-trace test-results/test-name/trace.zip`,
      `# Exercise 2 Solution:
npx playwright show-trace path/to/trace.zip
# This opens the interactive Trace Viewer in your browser
# Navigate the timeline, inspect DOM snapshots, and check network calls`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Script that reads trace zip and counts API calls
import * as fs from 'fs';
// In practice, traces are zip files containing JSON action logs
// Parse the trace to count network requests:
console.log('Trace analysis: Count network calls from the trace timeline');`,
    progressiveProject: '**TodoMVC Step**: Enable trace capture for your TodoMVC tests and inspect a run:\\n```typescript\\n// playwright.config.ts\\nexport default defineConfig({\\n  use: {\\n    trace: "retain-on-failure"\\n  }\\n});\\n```\\nRun a failing test, then open the trace:\\n```\\nnpx playwright show-trace test-results/.../trace.zip\\n```',
    interviewQuestions: [
      {
        q: 'What details are saved inside a Playwright trace archive?',
        a: 'A zip archive containing screen actions, network requests, console outputs, source maps, and interactive DOM snapshots for every step.'
      }
    ],
    cheatsheet: 'npx playwright show-trace path/to/trace.zip'
  },
  {
    filename: '12-debugging-workflows.md',
    title: 'Debugging Workflows',
    part: 'Part 3: Advanced Playwright',
    objectives: ['Step through executions using the Inspector', 'Trace locator hits interactively', 'Run projects selectively'],
    prerequisites: ['Chapter 11: Trace Viewer & Observability'],
    readingTime: '15 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'To write robust test flows, stepping through them interactively allows you to verify that CSS/XPath/ARIA elements are matched before continuing.',
    diagram: `
[Console Script] ──► npx playwright test --debug ──► Launch Inspector ──► Step Actions
    `,
    content: 'Debugging in Playwright uses the Playwright Inspector, headed browser projects, and terminal console logs, helping you test selectors and step through actions in real-time.',
    codeExample: `
// Insert page.pause during dynamic flows
test('run inspector debugging', async ({ page }) => {
  await page.goto('/profile');
  await page.pause(); // Interactive debugger breakpoint
  await page.getByRole('button', { name: 'Edit' }).click();
});
    `,
    dos: [
      'Run single tests with the --debug flag.',
      'Verify locator expressions inside the inspector console.'
    ],
    donts: [
      'Do not use console.log statements as your primary debugging tool.'
    ],
    summary: [
      'Pause executions with page.pause to open the inspector.',
      'Debug selector engines directly using browser devtools terminal.',
      'Isolate single failing projects via targeted CLI runs.'
    ],
    exercises: [
      'Debug a test using the Playwright Inspector.',
      'Locate and fix a failing button selector in a login spec.'
    ],
    miniProject: 'Design a script that automatically pauses tests on assertion failures.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
# Run with debug flag:
npx playwright test tests/login.spec.ts --debug
# The Playwright Inspector opens. Step through each action.
# Hover over locators in the Inspector to verify they match.`,
      `// Exercise 2 Solution:
test('fix failing login button', async ({ page }) => {
  await page.goto('/login');
  // Before: page.locator('#btn-login') — brittle ID selector
  // After: semantic role-based locator
  const loginBtn = page.getByRole('button', { name: 'Sign In' });
  await loginBtn.click();
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Auto-pause on failure using test.afterEach hook:
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    console.log('Test failed! Pausing for inspection...');
    await page.pause(); // Opens Inspector on failure
  }
});`,
    progressiveProject: '**TodoMVC Step**: Debug a failing todo deletion test using the Inspector:\\n```typescript\\ntest("debug deletion", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Debug me");\\n  await input.press("Enter");\\n  await page.pause(); // Inspector opens here!\\n  // Use Inspector to verify locators before continuing\\n});\\n```',
    interviewQuestions: [
      {
        q: 'What is the purpose of the --debug CLI flag?',
        a: 'It forces headed execution, sets the test timeout to infinity, and launches the Playwright Inspector to step through the test.'
      }
    ],
    cheatsheet: 'npx playwright test --debug'
  },
  {
    filename: '13-storage-state.md',
    title: 'Storage State & Auth Strategies',
    part: 'Part 3: Advanced Playwright',
    objectives: ['Save authenticated browser cookies', 'Inject storageState into contexts', 'Manage token expirations'],
    prerequisites: ['Chapter 12: Debugging Workflows'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Logging in via the UI before every test slows down runs. Reusing session storage cookies cuts auth setup times.',
    diagram: `
[Auth Session Setup] ──► Save Context cookies ──► [auth.json] ──► Inject into new Contexts ──► Bypass Login page
    `,
    content: 'Injecting storageState bypasses UI login pages by loading cookies, local storage values, and session data directly into browser contexts during initialization. In production pipelines, session tokens age and expire. To make auth setups robust, tests should evaluate token expiry timestamps parsed from cookies or localStorage and trigger an automated re-auth sequence prior to injection.',
    codeExample: `
import * as fs from 'fs';
import { Browser } from '@playwright/test';

// Setup authenticated context, refreshing tokens dynamically if expired
async function setupAuthenticatedContext(browser: Browser, authFilePath: string) {
  let needsLogin = true;
  
  if (fs.existsSync(authFilePath)) {
    const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf-8'));
    const expiryCookie = authData.cookies.find((c: any) => c.name === 'session_expiry');
    
    // Check if token has expired compared to the current timestamp
    if (expiryCookie && Date.now() < Number(expiryCookie.value)) {
      needsLogin = false; // Cookie is still valid!
    }
  }

  const options = needsLogin ? {} : { storageState: authFilePath };
  const context = await browser.newContext(options);

  if (needsLogin) {
    const page = await context.newPage();
    await page.goto('/login');
    await page.getByLabel('User').fill('admin');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL('/dashboard');
    await context.storageState({ path: authFilePath });
  }
  
  return context;
}
    `,
    dos: [
      'Configure globalSetup storage paths in playwright.config.ts.',
      'Clear storage state files when testing user logout scenarios.',
      'Inspect storage JSON files programmatically to evaluate and refresh aged authentication tokens.'
    ],
    donts: [
      'Do not commit storage state JSON files to source control.'
    ],
    summary: [
      'Save cookie and localStorage states to static JSON files.',
      'Inject storageState into contexts to bypass repetitive UI logins.',
      'Handle token expiration by scheduling proactive login refreshes.'
    ],
    exercises: [
      'Write an auth script that saves a session, then use it in a separate test file.',
      'Verify that browser storage is populated with cookies after setup.'
    ],
    miniProject: 'Build a multi-user storage state manager for a project.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
// File: auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('User').fill('admin');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'auth.json' });
});`,
      `// Exercise 2 Solution:
test('verify storage populated', async ({ page }) => {
  await page.goto('/dashboard');
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session_id');
  expect(sessionCookie).toBeDefined();
  console.log('Session cookie:', sessionCookie?.value);
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
const users = ['admin', 'editor', 'viewer'];

for (const role of users) {
  setup('auth-' + role, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('User').fill(role);
    await page.getByLabel('Password').fill(role + '_pass');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.context().storageState({ path: role + '.auth.json' });
  });
}`,
    progressiveProject: '**TodoMVC Step**: Save and restore todo state using localStorage storage state:\\n```typescript\\ntest("save todo state", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Persisted todo");\\n  await input.press("Enter");\\n  // Save the browser state (including localStorage with todos)\\n  await page.context().storageState({ path: "todo-state.json" });\\n});\\n```',
    interviewQuestions: [
      {
        q: 'How does storageState speed up test execution?',
        a: 'It saves browser sessions (cookies, localStorage) to a file. Subsequent tests load this file to start pre-authenticated, avoiding slow UI login flows.'
      }
    ],
    cheatsheet: 'await page.context().storageState({ path: "auth.json" });'
  },
  {
    filename: '14-network-interception.md',
    title: 'Network Interception Patterns',
    part: 'Part 3: Advanced Playwright',
    objectives: ['Mock HTTP APIs using page.route', 'Interchange headers and bodies', 'Fulfill mock responses'],
    prerequisites: ['Chapter 13: Storage State & Auth Strategies'],
    readingTime: '25 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Mocking APIs speeds up execution and isolates layouts, but relying purely on static mocks leads to a major trap: it can mask integration errors, schema mismatches, and contract drift.',
    diagram: `
[Browser API Call] ──► page.route() ──► [ Zod Schema Check ] ──► Return Mock Response
                                                 │
                                                 └── (Mismatched Schema) ──► Post Telemetry & Fail Test
    `,
    content: 'Playwright supports network routing. Using page.route, you can intercept outgoing calls, mock responses, modify headers, and simulate offline scenarios. However, relying too heavily on mocks creates a major drawback: over-mocking can mask critical integration failures, schema drift (where backend API contracts change but tests continue to pass because they use stale mock data), and real environment bugs. To avoid this mocking trap, frameworks should implement contract validation (using tools like Zod to validate live mock shapes against actual schemas) and follow a balanced hybrid approach: use mocks for fast UI state testing, but run real, unmocked end-to-end integration tests nightly. When schema checks fail, report the telemetry payload to a monitoring endpoint for framework engineer diagnostics before failing the test.',
    codeExample: `
import { test, expect } from '@playwright/test';
import { z } from 'zod';

// Schema representation to prevent contract drift
const UserProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

test('mock api with zod contract verification and logging', async ({ page }) => {
  // Setup route interception first, validating payload during resolution
  await page.route('**/api/profile', async (route) => {
    const mockPayload = { id: 1, name: 'John Doe', email: 'john@drift.com' };
    const validation = UserProfileSchema.safeParse(mockPayload);
    
    if (!validation.success) {
      // Log schema validation failure telemetry to central monitor
      await page.request.post('https://telemetry.enterprise.com/api/errors', {
        data: {
          service: 'profile-service',
          errors: validation.error.errors,
          timestamp: Date.now()
        }
      });
      await route.abort();
      throw new Error('Schema Drift Detected! Mock data does not match runtime contracts: ' + validation.error.message);
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPayload)
    });
  });
});
    `,
    dos: [
      'Use exact URL matching to avoid intercepting unrelated requests.',
      'Enforce type contract checks (like Zod or JSON Schema) to keep mocks updated.'
    ],
    donts: [
      'Do not rely on mocked endpoints for all end-to-end integration flows.',
      'Never skip unmocked staging/production tests before major releases.'
    ],
    summary: [
      'Intercept HTTP calls with page.route to mock payloads.',
      'Warn against over-mocking to prevent masking integration drifts.',
      'Enforce Zod or JSON schema contract checks to match live APIs.'
    ],
    exercises: [
      'Write a test that intercepts an API call and returns a mock 500 status code.',
      'Fulfill an API request with mock JSON data and verify it renders in the UI.'
    ],
    miniProject: 'Build an offline mode testing simulator for an application.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('mock 500 error', async ({ page }) => {
  await page.route('**/api/data', (route) => {
    route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
  });
  await page.goto('/dashboard');
  await expect(page.getByText('Something went wrong')).toBeVisible();
});`,
      `// Exercise 2 Solution:
test('mock product list', async ({ page }) => {
  await page.route('**/api/products', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ name: 'Widget', price: 9.99 }])
    });
  });
  await page.goto('/products');
  await expect(page.getByText('Widget')).toBeVisible();
  await expect(page.getByText('$9.99')).toBeVisible();
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
test('offline mode simulator', async ({ page }) => {
  // Load page normally first
  await page.goto('/app');
  await expect(page.getByText('Online')).toBeVisible();

  // Block all network requests to simulate offline
  await page.route('**/*', (route) => route.abort());
  await page.reload();
  await expect(page.getByText('Offline')).toBeVisible();
});`,
    progressiveProject: '**TodoMVC Step**: Mock the TodoMVC API to simulate a pre-loaded todo list:\\n```typescript\\ntest("mock pre-loaded todos", async ({ page }) => {\\n  // TodoMVC uses localStorage, so we inject data directly:\\n  await page.addInitScript(() => {\\n    const todos = [\\n      { title: "Mocked Todo 1", completed: false, id: "1" },\\n      { title: "Mocked Todo 2", completed: true, id: "2" }\\n    ];\\n    localStorage.setItem("react-todos", JSON.stringify(todos));\\n  });\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  await expect(page.getByTestId("todo-title")).toHaveCount(2);\\n});\\n```',
    interviewQuestions: [
      {
        q: 'When should you use route.abort() instead of route.fulfill()?',
        a: 'Use abort() to simulate network disruptions, connection failures, or to block heavy, non-functional third-party scripts (like analytics).'
      }
    ],
    cheatsheet: 'await page.route("**/pattern", route => route.fulfill());'
  },
  {
    filename: '15-iframes-tabs.md',
    title: 'Handling IFrames & Tabs',
    part: 'Part 3: Advanced Playwright',
    objectives: ['Scope iframe contexts using frameLocator', 'Coordinate multi-tab pages', 'Manage navigation frames'],
    prerequisites: ['Chapter 14: Network Interception Patterns'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Forgetting to switch contexts when dealing with frames or new tabs causes tests to fail, as page-level actions cannot access nested DOMs.',
    diagram: `
[Main Page]
   ├── frameLocator('iframe') ──► Access nested DOM elements
   └── context.waitForEvent('popup') ──► Access new tab context Page
    `,
    content: 'Using frameLocator scopes actions inside an iframe. For multi-tab support, register listeners for the popup event on the browser context, returning a new page reference.',
    codeExample: `
// Handling switch contexts inside an iframe using frameLocator and popups
test('iframe nested form submission and popup handling', async ({ page }) => {
  await page.goto('/checkout');
  
  // Locate card element inside iframe scope
  const paymentFrame = page.frameLocator('#payment-iframe');
  await paymentFrame.getByLabel('Card Number').fill('4111222233334444');
  await paymentFrame.getByRole('button', { name: 'Submit Payment' }).click();

  // Handle a popup/tab context event resolution
  const popupPromise = page.context().waitForEvent('popup');
  await page.getByRole('link', { name: 'View Terms' }).click();
  const popupPage = await popupPromise;
  await popupPage.waitForLoadState();
  await expect(popupPage).toHaveTitle('Terms and Conditions');
});
    `,
    dos: [
      'Register the popup event listener before triggering the popup action.',
      'Scope frame locators to unique container IDs.'
    ],
    donts: [
      'Do not try to query nested frames without using frameLocator.'
    ],
    summary: [
      'Scope elements inside nested iframes with frameLocator.',
      'Listen for popup context events before dynamic tab creations.',
      'Switch pages seamlessly using page context event promises.'
    ],
    exercises: [
      'Interact with a checkbox inside an iframe.',
      'Click a link that opens a new tab and assert details on the new page.'
    ],
    miniProject: 'Build a multi-tab workspace flow manager.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('iframe checkbox interaction', async ({ page }) => {
  await page.goto('/settings');
  const frame = page.frameLocator('#preferences-iframe');
  await frame.getByRole('checkbox', { name: 'Enable Notifications' }).check();
  await expect(frame.getByRole('checkbox', { name: 'Enable Notifications' })).toBeChecked();
});`,
      `// Exercise 2 Solution:
test('new tab assertion', async ({ page }) => {
  await page.goto('/links');
  const popupPromise = page.context().waitForEvent('page');
  await page.getByRole('link', { name: 'External Link' }).click();
  const newPage = await popupPromise;
  await newPage.waitForLoadState();
  await expect(newPage).toHaveTitle(/External/);
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
test('multi-tab workspace manager', async ({ page }) => {
  await page.goto('/workspace');
  // Open 3 tabs
  const tabs: Page[] = [];
  for (const name of ['Tab1', 'Tab2', 'Tab3']) {
    const p = page.context().waitForEvent('page');
    await page.getByRole('button', { name }).click();
    tabs.push(await p);
  }
  // Interact with each tab
  for (const tab of tabs) {
    await tab.waitForLoadState();
    console.log('Tab title:', await tab.title());
  }
});`,
    progressiveProject: '**TodoMVC Step**: TodoMVC does not use iframes or popups, so this is a knowledge checkpoint:\\n```\\n// TodoMVC is a single-page app with no iframes or popups.\\n// In real-world apps, you would use:\\n// page.frameLocator("iframe")  — for embedded payment forms\\n// context.waitForEvent("page") — for links opening new tabs\\n// Practice these patterns on apps that use them.\\n```',
    interviewQuestions: [
      {
        q: 'Why must you register context.waitForEvent("popup") before clicking the link?',
        a: 'To avoid race conditions. Registering the listener first ensures Playwright catches the popup event the moment the click triggers it.'
      }
    ],
    cheatsheet: 'const frame = page.frameLocator("iframe");'
  },
  {
    filename: '16-emulation-settings.md',
    title: 'Emulation & Advanced Browser Settings',
    part: 'Part 3: Advanced Playwright',
    objectives: ['Configure geolocation and timezones', 'Mock locale parameters', 'Emulate mobile layout viewports'],
    prerequisites: ['Chapter 15: Handling IFrames & Tabs'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Testing localized content, time zones, or mobile responsive layouts requires browser-level emulation, which Playwright context configurations support.',
    diagram: `
[Config File] ──► Set geolocation, timezone, viewport ──► Launch Context ──► Localized UI rendered
    `,
    content: 'Browser emulation configures location coordinates, timezones, language locales, and responsive viewports, ensuring pages render correctly across devices and regions.',
    codeExample: `
// Emulating mobile settings in playwright.config.ts
import { devices } from '@playwright/test';
export default {
  projects: [
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
};
    `,
    dos: [
      'Use Playwright built-in devices catalog to configure viewports.',
      'Test locale-specific layouts by updating locale context variables.'
    ],
    donts: [
      'Do not change viewports mid-test unless testing responsive layouts specifically.'
    ],
    summary: [
      'Configure geographic locations, timezones, and language locales.',
      'Match viewports and touch parameters to device profiles.',
      'Validate dark/light themes using color-scheme emulation.'
    ],
    exercises: [
      'Write a test that emulates a specific timezone and verify time displays.',
      'Emulate mobile screen sizes and test collapsible sidebar menus.'
    ],
    miniProject: 'Build a localization testing sweep for dynamic applications.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('timezone emulation', async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: 'America/New_York' });
  const page = await context.newPage();
  await page.goto('/clock');
  const time = await page.getByTestId('clock').textContent();
  console.log('NY Time:', time);
  await context.close();
});`,
      `// Exercise 2 Solution:
test('mobile sidebar collapse', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('/dashboard');
  await expect(page.getByTestId('sidebar')).not.toBeVisible();
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByTestId('sidebar')).toBeVisible();
  await context.close();
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
const locales = ['en-US', 'fr-FR', 'de-DE', 'ja-JP'];
for (const locale of locales) {
  test('locale test: ' + locale, async ({ browser }) => {
    const ctx = await browser.newContext({ locale });
    const page = await ctx.newPage();
    await page.goto('/app');
    const dateText = await page.getByTestId('date-display').textContent();
    console.log(locale + ':', dateText);
    await ctx.close();
  });
}`,
    progressiveProject: '**TodoMVC Step**: Emulate a mobile viewport and verify the TodoMVC responsive layout:\\n```typescript\\nimport { devices } from "@playwright/test";\\n\\ntest("mobile TodoMVC layout", async ({ browser }) => {\\n  const context = await browser.newContext({\\n    ...devices["iPhone 12"]\\n  });\\n  const page = await context.newPage();\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Mobile todo");\\n  await input.press("Enter");\\n  await expect(page.getByTestId("todo-title")).toBeVisible();\\n  await context.close();\\n});\\n```',
    interviewQuestions: [
      {
        q: 'How does Playwright emulate a mobile device context?',
        a: 'It configures mobile viewports, enables touch events, and updates the user-agent string to match the targeted mobile browser.'
      }
    ],
    cheatsheet: 'use: { locale: "fr-FR", timezoneId: "Europe/Paris" }'
  },

  // PART 4: FRAMEWORK DESIGN
  {
    filename: '17-pom-design.md',
    title: 'Page Object Model (POM) Design',
    part: 'Part 4: Framework Design',
    objectives: ['Structure Page Objects cleanly', 'Declare locators inside constructors', 'Keep page methods focus to actions'],
    prerequisites: ['Chapter 16: Emulation & Advanced Browser Settings'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'A poor POM structure creates code duplication. Declaring locators in properties and keeping assertions inside tests ensures a maintainable framework.',
    diagram: `
[Page Object Class]
   ├── Properties: readonly locators (Declared in constructor)
   └── Workflows: async actions (Click, fill, etc. No assertions)
    `,
    content: 'The Page Object Model (POM) abstracts page structures into reusable classes. Declaring locators as properties inside the constructor keeps selectors organized, and page methods handle business actions.',
    codeExample: `
export class ConfirmationPage {
  readonly page: Page;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successMessage = page.getByRole('alert');
  }
}

export class SettingsPage {
  readonly page: Page;
  readonly saveBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.saveBtn = page.getByRole('button', { name: 'Save Changes' });
  }

  // Action methods return target POM pages to chain flows cleanly
  async applySettings(): Promise<ConfirmationPage> {
    await this.saveBtn.click();
    return new ConfirmationPage(this.page);
  }
}
    `,
    dos: [
      'Declare locators as readonly class properties.',
      'Ensure page actions return locators or state variables for tests to assert.'
    ],
    donts: [
      'Do not write assertions (expect) inside Page Object methods.',
      'Do not declare locators as class methods.'
    ],
    summary: [
      'Declare readonly locator properties in the page constructors.',
      'Keep test assertions decoupled from POM action methods.',
      'Return child page references or locators to chain flows cleanly.'
    ],
    exercises: [
      'Build a Page Object class for a registration flow.',
      'Refactor a script containing direct page queries to use a Page Object model instead.'
    ],
    miniProject: 'Construct a unified POM library for an application checkout funnel.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Full Name');
    this.emailInput = page.getByLabel('Email Address');
    this.submitBtn = page.getByRole('button', { name: 'Register' });
  }

  async registerUser(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.submitBtn.click();
  }
}`,
      `// Exercise 2 Solution:
test('login using Page Object model', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('user', 'pass');
  await expect(page).toHaveURL(/dashboard/);
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
class CheckoutPage {
  readonly page: Page;
  constructor(page: Page) { this.page = page; }
  async fillShipping() { /* ... */ }
  async pay(): Promise<ConfirmationPage> {
    await this.page.click('text=Pay');
    return new ConfirmationPage(this.page);
  }
}`,
    progressiveProject: '**TodoMVC Step**: Build a Page Object class for the TodoMVC page:\\n```typescript\\n// pages/TodoPage.ts\\nimport { Page, Locator, expect } from "@playwright/test";\\n\\nexport class TodoPage {\\n  readonly page: Page;\\n  readonly input: Locator;\\n  readonly todoItems: Locator;\\n\\n  constructor(page: Page) {\\n    this.page = page;\\n    this.input = page.getByPlaceholder("What needs to be done?");\\n    this.todoItems = page.getByTestId("todo-title");\\n  }\\n\\n  async navigate() {\\n    await this.page.goto("https://demo.playwright.dev/todomvc");\\n  }\\n\\n  async addTodo(text: string) {\\n    await this.input.fill(text);\\n    await this.input.press("Enter");\\n  }\\n}\\n```',
    interviewQuestions: [
      {
        q: 'Why is it an anti-pattern to include assertions inside Page Objects?',
        a: 'It couples the page layout with test assertions. If the page is reused in negative test cases (e.g. testing input errors), internal assertions will cause the test to fail.'
      }
    ],
    cheatsheet: 'class MyPage { constructor(page: Page) { ... } }'
  },
  {
    filename: '18-component-encapsulation.md',
    title: 'Reusable UI Component Encapsulation',
    part: 'Part 4: Framework Design',
    objectives: ['Identify modular widgets', 'Scope locators to component roots', 'Compose Page Objects'],
    prerequisites: ['Chapter 17: Page Object Model (POM) Design'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Duplicate selector definitions for common layouts (like navbars or tables) cause high code churn when headers change. Encapsulating them into components solves this.',
    diagram: `
[Main Page Object]
   ├── Composition ──► [Navbar Component Class]
   └── Composition ──► [Footer Component Class]
    `,
    content: 'Encapsulating page widgets (headers, sidebars, lists) into standalone component classes allows you to reuse them across multiple pages. Composition is preferred over inheritance.',
    codeExample: `
export class NavbarComponent {
  readonly root: Locator;
  readonly profileLink: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.profileLink = root.getByRole('link', { name: 'Profile' });
  }

  async clickProfile() {
    await this.profileLink.click();
  }
}

export class DashboardPage {
  readonly page: Page;
  readonly navbar: NavbarComponent;

  constructor(page: Page) {
    this.page = page;
    this.navbar = new NavbarComponent(page.getByRole('navigation', { name: 'Main Menu' }));
  }
}
    `,
    dos: [
      'Scope all component selectors to a parent root locator.',
      'Instantiate component sub-classes inside Page Object constructors.'
    ],
    donts: [
      'Avoid deep class inheritance extensions (e.g. extends BasePage).'
    ],
    summary: [
      'Abstract repeating UI controls (navbars, cards) into component classes.',
      'Scope component selectors strictly to a parent root locator.',
      'Favor composition over inheritance to model layout relationships.'
    ],
    exercises: [
      'Encapsulate a table row layout into a TableRow component.',
      'Build a Page Object composed of separate Sidebar and Header components.'
    ],
    miniProject: 'Build a component dashboard library with modular widget classes.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
export class TableRowComponent {
  readonly root: Locator;
  readonly editBtn: Locator;
  readonly deleteBtn: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.editBtn = root.getByRole('button', { name: 'Edit' });
    this.deleteBtn = root.getByRole('button', { name: 'Delete' });
  }
}`,
      `// Exercise 2 Solution:
export class DashboardPage {
  readonly sidebar: SidebarComponent;
  readonly header: HeaderComponent;

  constructor(page: Page) {
    this.sidebar = new SidebarComponent(page.locator('aside'));
    this.header = new HeaderComponent(page.locator('header'));
  }
}`
    ],
    miniProjectSolution: `// Mini-Project Solution:
export class DashboardLibrary {
  readonly statsWidget: StatsWidgetComponent;
  readonly chartWidget: ChartWidgetComponent;
  constructor(page: Page) {
    this.statsWidget = new StatsWidgetComponent(page.locator('.stats'));
    this.chartWidget = new ChartWidgetComponent(page.locator('.charts'));
  }
}`,
    progressiveProject: '**TodoMVC Step**: Extract a `TodoItemComponent` for individual todo rows to isolate item elements:\\n```typescript\\n// components/TodoItemComponent.ts\\nimport { Locator } from "@playwright/test";\\n\\nexport class TodoItemComponent {\\n  readonly root: Locator;\\n  readonly label: Locator;\\n  readonly toggleCheckbox: Locator;\\n  readonly destroyBtn: Locator;\\n\\n  constructor(root: Locator) {\\n    this.root = root;\\n    this.label = root.getByTestId("todo-title");\\n    this.toggleCheckbox = root.getByRole("checkbox");\\n    this.destroyBtn = root.getByRole("button", { name: "Delete" });\\n  }\\n\\n  async toggle() {\\n    await this.toggleCheckbox.click();\\n  }\\n\\n  async delete() {\\n    await this.root.hover();\\n    await this.destroyBtn.click();\\n  }\\n}\\n```',
    interviewQuestions: [
      {
        q: 'Why should component class selectors be scoped to a parent root locator?',
        a: 'Scoping prevents locator duplication errors. It ensures Playwright searches only within that widget region, even if other pages have matching elements.'
      }
    ],
    cheatsheet: 'this.root = page.locator("selector");'
  },
  {
    filename: '19-fixtures-di.md',
    title: 'Fixtures & Dependency Injection',
    part: 'Part 4: Framework Design',
    objectives: ['Configure custom fixtures using test.extend', 'Auto-inject Page Objects', 'Manage fixture lifecycles'],
    prerequisites: ['Chapter 18: Reusable UI Component Encapsulation'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Instantiating page classes manually inside every beforeEach hook is repetitive. Custom fixtures automate this setup, keeping test specs clean.',
    diagram: `
[test.extend] ──► Inject page dependencies ──► Test runs ──► Run post-test teardown
    `,
    content: 'Playwright fixtures provide dependency injection. By extending test, we configure page objects that are automatically instantiated and injected into test arguments.',
    codeExample: `
import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SettingsPage } from '../pages/SettingsPage';

export const test = base.extend<{ homePage: HomePage; settingsPage: SettingsPage }>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  }
});
    `,
    dos: [
      'Use extended fixtures to inject page objects into tests.',
      'Define test-level cleanup steps after the await use() statement.'
    ],
    donts: [
      'Do not call manual page class instantiations inside spec test files.'
    ],
    summary: [
      'Use test.extend to configure automatic POM instances.',
      'Run fixture setups and teardowns automatically around tests.',
      'Define worker-level fixtures to share heavy backend clients.'
    ],
    exercises: [
      'Extend a base test setup to inject a custom settings page object.',
      'Implement an authenticated page fixture that handles login setups automatically.'
    ],
    miniProject: 'Build a fixture composition layer for an enterprise test suite.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
import { test as base } from './fixtures';
import { SettingsPage } from './pages/SettingsPage';

export const test = base.extend<{ settingsPage: SettingsPage }>({
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  }
});`,
      `// Exercise 2 Solution:
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'auth.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Composition of fixtures:
export const test = base.extend<{ adminPage: AdminPage; userPage: UserPage }>({
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  userPage: async ({ page }, use) => {
    await use(new UserPage(page));
  }
});`,
    progressiveProject: '**TodoMVC Step**: Create a custom fixture that injects the `TodoPage` instance automatically:\\n```typescript\\n// fixtures/todo-fixture.ts\\nimport { test as base } from "@playwright/test";\\nimport { TodoPage } from "../pages/TodoPage";\\n\\nexport const test = base.extend<{ todoPage: TodoPage }>({\\n  todoPage: async ({ page }, use) => {\\n    const todoPage = new TodoPage(page);\\n    await todoPage.navigate();\\n    await use(todoPage);\\n  }\\n});\\n\\n// Then write tests cleanly:\\n// test("test using POM fixture", async ({ todoPage }) => {\\n//   await todoPage.addTodo("Auto-injected");\\n// });\\n```',
    interviewQuestions: [
      {
        q: 'What is the lifecycle of a test-scoped fixture?',
        a: 'It is instantiated before the test begins, injected into the test arguments, and any code after the await use() call executes as cleanup when the test finishes.'
      }
    ],
    cheatsheet: 'export const test = base.extend<{\n  homePage: HomePage;\n  settingsPage: SettingsPage;\n}>({\n  homePage: async ({ page }, use) => { await use(new HomePage(page)); },\n  settingsPage: async ({ page }, use) => { await use(new SettingsPage(page)); }\n});'
  },
  {
    filename: '20-architecture-topology.md',
    title: '4-Layer Architecture Topology',
    part: 'Part 4: Framework Design',
    objectives: ['Organize automation projects in 4 levels', 'Define boundaries between layers', 'Map mock data schemas'],
    prerequisites: ['Chapter 19: Fixtures & Dependency Injection'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Unstructured frameworks quickly become hard to maintain. A 4-layer architecture isolates test files, page flows, widgets, and data schemas.',
    diagram: `
[Layer 1: Test Specs] ──────► [Layer 2: Page Objects]
                                       │
                                       ▼
[Layer 4: Data/Entities] ◄── [Layer 3: UI Components]
    `,
    content: 'The 4-Layer Page Object Architecture separates files by responsibility. This structure isolates assertions, page navigation, reusable widgets, and typing schemas, ensuring a clean codebase.',
    codeExample: `
// ══════════════════════════════════════════════════
// LAYER 4: Entity Schemas (File: types/UserPayload.ts)
// ══════════════════════════════════════════════════
export interface UserPayload {
  name: string;
  email: string;
}

// ══════════════════════════════════════════════════
// LAYER 3: Components (File: components/ProfileForm.ts)
// ══════════════════════════════════════════════════
import { Locator } from '@playwright/test';
export class ProfileFormComponent {
  readonly root: Locator;
  constructor(root: Locator) { this.root = root; }
  async fillForm(data: UserPayload) {
    await this.root.getByLabel('Name').fill(data.name);
    await this.root.getByLabel('Email').fill(data.email);
  }
}

// ══════════════════════════════════════════════════
// LAYER 2: Pages (File: pages/ProfilePage.ts)
// ══════════════════════════════════════════════════
import { Page } from '@playwright/test';
export class ProfilePage {
  readonly page: Page;
  readonly profileForm: ProfileFormComponent;
  constructor(page: Page) {
    this.page = page;
    this.profileForm = new ProfileFormComponent(page.locator('form#profile'));
  }
}

// ══════════════════════════════════════════════════
// LAYER 1: Specs (File: specs/profile.spec.ts)
// ══════════════════════════════════════════════════
import { test } from '@playwright/test';
test('validate profile form update', async ({ page }) => {
  const profilePage = new ProfilePage(page);
  const data: UserPayload = { name: 'Alice', email: 'alice@test.com' };
  await page.goto('/profile');
  await profilePage.profileForm.fillForm(data);
});
    `,
    dos: [
      'Isolate specs, pages, components, and data schemas in separate folders.',
      'Verify that data schema definitions (Layer 4) remain clean.'
    ],
    donts: [
      'Do not mix test spec assertions (Layer 1) inside page classes (Layer 2).'
    ],
    summary: [
      'Isolate specs, pages, components, and typing layers.',
      'Maintain clean boundaries: specs assert, components locate.',
      'Type data payloads with TypeScript interfaces to avoid syntax errors.'
    ],
    exercises: [
      'Restructure a basic project directory into a 4-layer folder structure.',
      'Map static API JSON models into TypeScript interfaces.'
    ],
    miniProject: 'Restructure a legacy repository using 4-layer design guidelines.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
# Restructure your files as follows:
# - Move *.spec.ts to /specs
# - Move page classes to /pages
# - Move reusable widgets to /components
# - Move interfaces/types to /types`,
      `// Exercise 2 Solution:
export interface UserJsonModel {
  id: string;
  name: string;
  preferences: {
    theme: 'light' | 'dark';
  };
}`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Organized structure setup with imports mapping boundaries:
import { test } from '../fixtures/todo-fixture';
import { UserPayload } from '../types/UserPayload';
// Test specs import Layer 2 page/fixture layers correctly.`,
    progressiveProject: '**TodoMVC Step**: Organize the TodoMVC automation project into a 4-layer structure:\\n```\\ntodomvc-automation/\\n├── specs/\\n│   └── todo.spec.ts          (Layer 1: Test Specs)\\n├── pages/\\n│   └── TodoPage.ts           (Layer 2: Page Objects)\\n├── components/\\n│   └── TodoItemComponent.ts  (Layer 3: UI Components)\\n├── types/\\n│   └── TodoItem.ts           (Layer 4: Data Models/Entities)\\n├── package.json\\n└── playwright.config.ts\\n```',
    interviewQuestions: [
      {
        q: 'How does a 4-layer architecture simplify design updates?',
        a: 'By separating concerns. If a table widget changes, you only update the Component class in Layer 3; Layer 1 (Specs) and Layer 2 (Pages) remain untouched.'
      }
    ],
    cheatsheet: 'Folder structure: specs/, pages/, components/, types/'
  },

  // PART 5: ENTERPRISE AUTOMATION
  {
    filename: '21-test-runner.md',
    title: 'Playwright Test Runner Internals',
    part: 'Part 5: Enterprise Automation',
    objectives: ['Explain parallel execution models', 'Configure worker allocations', 'Understand CPU thread setups'],
    prerequisites: ['Chapter 20: 4-Layer Architecture Topology'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Misconfiguring parallel worker limits can freeze system resources or cause dynamic test collisions. Optimizing workers keeps runs fast and stable.',
    diagram: `
[Runner Process] ──► Allocate CPU ──► Worker 1 (BrowserContext 1) ──► run test A
                                 └──► Worker 2 (BrowserContext 2) ──► run test B
    `,
    content: 'The Playwright test runner runs tests in parallel across isolated worker processes. Each worker starts its own browser context, ensuring tests do not interfere with one another.',
    codeExample: `
// config workers allocations sample
export default {
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true
};
    `,
    dos: [
      'Enable fullyParallel option to run tests concurrently.',
      'Limit worker count on CI servers to match available CPU cores.'
    ],
    donts: [
      'Do not share global states across test files when running in parallel.'
    ],
    summary: [
      'Spawn independent worker processes to achieve concurrency.',
      'Run tests fullyParallel with independent browser contexts.',
      'Tune worker allocations to match physical CPU core counts.'
    ],
    exercises: [
      'Configure test runs to use a specific number of workers from the CLI.',
      'Measure the speed difference between running tests sequentially vs. in parallel.'
    ],
    miniProject: 'Build a monitor script that tracks CPU load during test execution.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
npx playwright test --workers=2`,
      `# Exercise 2 Solution:
# Run tests sequentially:
npx playwright test --workers=1
# Run tests in parallel:
npx playwright test --workers=4
# Compare the durations printed in the run summaries.`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// A helper process monitor reading os.cpus() load
import * as os from 'os';
console.log('CPU Load:', os.cpus());`,
    progressiveProject: '**TodoMVC Step**: Configure worker allocations in your `playwright.config.ts` for TodoMVC tests:\\n```typescript\\n// playwright.config.ts\\nimport { defineConfig } from "@playwright/test";\\n\\nexport default defineConfig({\\n  workers: process.env.CI ? 2 : undefined,\\n  fullyParallel: true,\\n  use: {\\n    baseURL: "https://demo.playwright.dev/todomvc"\\n  }\\n});\\n```',
    interviewQuestions: [
      {
        q: 'How does Playwright isolate parallel test runs?',
        a: 'By running each test in a separate worker process with its own BrowserContext, isolating cookies, storage, and sessions.'
      }
    ],
    cheatsheet: 'npx playwright test --workers=4'
  },
  {
    filename: '22-flaky-troubleshooting.md',
    title: 'Flaky Test Troubleshooting',
    part: 'Part 5: Enterprise Automation',
    objectives: ['Identify flaky test causes', 'Examine execution traces', 'Implement retry strategies'],
    prerequisites: ['Chapter 21: Playwright Test Runner Internals'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Flaky tests slow down pipelines and erode trust in automation. Finding and fixing flakes keeps CI builds reliable.',
    diagram: `
[Flaky Run] ──► Log trace ──► Inspect timeline gaps ──► Fix selector or wait gate
    `,
    content: 'Flakiness is often caused by race conditions, slow networks, or dynamic DOM states. Debugging flakes requires inspecting trace snapshots, checking API responses, and refining wait conditions. The chapter strictly forbids using page.waitForTimeout to patch flakiness. When testing asynchronous non-DOM systems, such as background worker operations, message brokers, or WebSockets, tests should use event listeners (page.waitForEvent) or poll status tables using expect.poll to wait for completion.',
    codeExample: `
// 1. Wait for WebSocket message packet response instead of sleeping
const messagePromise = page.waitForEvent('websocket');
await page.getByRole('button', { name: 'Submit Query' }).click();
const ws = await messagePromise;

// 2. Poll a state database backend API status
await expect.poll(async () => {
  return await checkBackgroundJob();
}).toBe('COMPLETED');
    `,
    dos: [
      'Inspect trace files to identify gaps in timelines.',
      'Ensure test assertions wait for dynamic elements to render.'
    ],
    donts: [
      'Do not use arbitrary timeouts (page.waitForTimeout) to address flakiness.'
    ],
    summary: [
      'Debug race conditions by aligning assertions with state changes.',
      'Set up automatic retries for CI builds to handle infrastructure lag.',
      'Parse HTML results to isolate environment flakes from bugs.'
    ],
    exercises: [
      'Find the root cause of an intermittent assertion failure by analyzing its trace.',
      'Simulate a slow network response and verify the test handles it without failing.'
    ],
    miniProject: 'Create a script that parses test reports to find and tag flaky specs.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
// 1. Locate the test run report or trace viewer logs
// 2. Identify timelines with long gaps between actions (e.g. 5000ms idle)
// 3. Pinpoint the missing state transitions or unawaited elements.`,
      `// Exercise 2 Solution:
test('slow API network mock', async ({ page }) => {
  await page.route('**/api/data', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Delay mock response
    await route.fulfill({ status: 200, body: '{}' });
  });
  await page.goto('/dashboard');
  await expect(page.getByText('Data Loaded')).toBeVisible({ timeout: 5000 });
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
import * as fs from 'fs';
interface TestResult { title: string; status: 'passed' | 'failed' | 'flaky'; }
function tagFlakes(results: TestResult[]) {
  return results.filter(r => r.status === 'flaky').map(r => r.title);
}`,
    progressiveProject: '**TodoMVC Step**: Diagnose a flaky toggle test by checking for element stability gates:\\n```typescript\\ntest("stable toggle check", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Flake fix");\\n  await input.press("Enter");\\n\\n  const checkbox = page.getByRole("checkbox");\\n  // Ensure element is fully stable and visible before check\\n  await expect(checkbox).toBeVisible();\\n  await checkbox.click();\\n  await expect(page.getByTestId("todo-item")).toHaveClass(/completed/);\\n});\\n```',
    interviewQuestions: [
      {
        q: 'How do you fix a flaky check caused by dynamic data loading?',
        a: 'Replace hardcoded delays with Web-First assertions (like expect().toBeVisible()) or wait explicitly for network events.'
      }
    ],
    cheatsheet: 'npx playwright test --retries=2'
  },
  {
    filename: '23-onboarding-transition.md',
    title: 'Onboarding & Transition Guides',
    part: 'Part 5: Enterprise Automation',
    objectives: ['Establish coding standards', 'Migrate legacy test suites', 'Configure AST linter rules'],
    prerequisites: ['Chapter 22: Flaky Test Troubleshooting'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Onboarding new developers to a unified codebase prevents style deviations. Automated AST checks enforce these coding rules by inspecting the compiler syntax trees.',
    diagram: `
[New Code Commit] ──► Pre-commit check (AST linter) ──► Blocks anti-patterns (waitForTimeout) ──► Merge
    `,
    content: 'When a compiler or linter parses code, it builds an Abstract Syntax Tree (AST). By traversing this tree programmatically, we can detect and block unsafe anti-patterns—such as calling page.waitForTimeout(5000)—without relying on fragile regex search patterns. This chapter details Cypress-to-Playwright migration maps, framework standards, and custom linter setups. To enforce quality gates, the pre-commit checker must execute a process.exit(1) code if any issues are flagged, forcing the git pre-commit hook to abort.',
    codeExample: `
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// Programmatic AST Checker using TypeScript Compiler API
export function checkFileForBannedMethods(filePath: string): boolean {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  let isClean = true;

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      let methodName = '';
      if (ts.isPropertyAccessExpression(expression)) {
        methodName = expression.name.text;
      }
      
      // Enforce zero tolerance for waitForTimeout
      if (methodName === 'waitForTimeout') {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.error('❌ AST Error at ' + filePath + ':' + (line + 1) + ' - Banned API waitForTimeout used.');
        isClean = false;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return isClean;
}

// Programmatic directory scan sweep for pre-commit quality checks
function getTestFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTestFiles(fullPath));
    } else if (file.endsWith('.spec.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

// Running quality gate execution wrapper
const targetDir = path.join(__dirname, '../tests');
const files = getTestFiles(targetDir);
let codebaseClean = true;
for (const file of files) {
  if (!checkFileForBannedMethods(file)) {
    codebaseClean = false;
  }
}

if (!codebaseClean) {
  console.error('❌ Code quality validation failed. Pre-commit aborted.');
  process.exit(1); // Exits the process with code 1 to block hook commits!
}
    `,
    dos: [
      'Maintain clear transition guides for engineers moving from other frameworks.',
      'Enforce coding standards automatically using custom AST linter checks.'
    ],
    donts: [
      'Avoid manually checking for styling rule violations during code reviews.'
    ],
    summary: [
      'Use transition maps for Cypress or Selenium developer migration.',
      'Implement AST checkers to block banned API methods dynamically.',
      'Lint codebase formatting before commit hooks trigger pipelines.'
    ],
    exercises: [
      'Write an AST script that flags any occurrence of page.waitForTimeout.',
      'Translate a Selenium Java test block into a Playwright TypeScript spec.'
    ],
    miniProject: 'Build a Cypress-to-Playwright code translation helper.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
import * as ts from 'typescript';
// AST parser checking for banned wait statements:
// Search for CallExpression where expression.name.text === 'waitForTimeout'
// Throw compile/AST exit error code: process.exit(1)`,
      `// Exercise 2 Solution:
// Cypress: cy.visit('/login'); cy.get('#user').type('admin'); cy.contains('Submit').click();
// Playwright:
await page.goto('/login');
await page.getByLabel('Username').fill('admin');
await page.getByRole('button', { name: 'Submit' }).click();`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Simple text replacer Cypress helper:
function translateCypressToPlaywright(cyCode: string): string {
  return cyCode
    .replace(/cy\\.visit\\(([^)]+)\\)/g, 'await page.goto($1)')
    .replace(/cy\\.get\\(([^)]+)\\)\\.type\\(([^)]+)\\)/g, 'await page.locator($1).fill($2)');
}`,
    progressiveProject: '**TodoMVC Step**: Build an AST checker that prevents using `page.waitForTimeout` inside your TodoMVC automation project:\\n```typescript\\n// scripts/ast-guard.ts\\nimport * as ts from "typescript";\\nimport * as fs from "fs";\\n// Set up programmatic AST checks on spec files to block waitForTimeout\\n// If any violation is found, exit process with process.exit(1) to block git commit\\n```',
    interviewQuestions: [
      {
        q: 'Why are automated quality gates preferred over manual code reviews for code styles?',
        a: 'Automated gates are consistent, run instantly on commit, and prevent style arguments, leaving code reviews focused on architecture and logic.'
      }
    ],
    cheatsheet: 'npm run lint // run coding standards lint'
  },
  {
    filename: '24-test-data.md',
    title: 'Test Data Management',
    part: 'Part 5: Enterprise Automation',
    objectives: ['Use data factories', 'Avoid static JSON data hazards', 'Implement database seeding'],
    prerequisites: ['Chapter 23: Onboarding & Transition Guides'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Sharing static database records in parallel test runs leads to locks and validation collision. Transactional seeding isolates runs.',
    diagram: `
[Start test context] ──► Pool Connect ──► BEGIN Transaction ──► Run UI Test Actions
                                                                    │
[Teardown] ◄── Release Client ◄── ROLLBACK Transaction ◄────────────┘
    `,
    content: 'Managing test data requires using dynamic data factories to generate unique parameters for each test, ensuring tests can run in parallel without conflicts. For relational data, direct database connections should be checked out from a client connection Pool. By connecting, starting a SQL transaction (BEGIN) before the test runs, and executing rollbacks (ROLLBACK) inside a finally block, tests preserve database state isolation and release connections securely back to the pool, preventing connection leaks, deadlocks, and pool exhaustion.',
    codeExample: `
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
    `,
    dos: [
      'Use data factories to generate unique payloads dynamically.',
      'Roll back database seeding operations using transaction blocks.',
      'Always release database clients inside finally blocks to prevent pool exhaustion.'
    ],
    donts: [
      'Do not rely on static JSON user records for tests that mutate data.'
    ],
    summary: [
      'Generate unique test parameters with dynamic data factories.',
      'Seed database records via DB connection scripts inside hooks.',
      'Rollback database transactions to clean state without teardowns.'
    ],
    exercises: [
      'Build a data factory helper that returns unique product entries.',
      'Write a setup hook that seeds a user account via an API call.'
    ],
    miniProject: 'Build a dynamic billing data generator for enterprise testing.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
export class ProductFactory {
  static create(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 1000),
      name: 'Product-' + Date.now(),
      price: parseFloat((Math.random() * 100).toFixed(2)),
      ...overrides
    };
  }
}`,
      `// Exercise 2 Solution:
test.beforeEach(async ({ request }) => {
  const res = await request.post('/api/users/seed', {
    data: { username: 'testuser', role: 'admin' }
  });
  expect(res.status()).toBe(201);
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
export class BillingFactory {
  static createCardPayload(type: 'visa' | 'mastercard') {
    return {
      number: type === 'visa' ? '4111222233334444' : '5100000000000000',
      cvv: '123',
      name: 'Cardholder Name'
    };
  }
}`,
    progressiveProject: '**TodoMVC Step**: Build a test data factory that generates random todo titles for your tests:\\n```typescript\\n// utils/DataFactory.ts\\nexport class DataFactory {\\n  static generateTodoTitle(): string {\\n    return "Todo-" + Math.random().toString(36).substring(2, 7);\\n  }\\n}\\n\\n// Inside your test spec:\\n// await page.fill(input, DataFactory.generateTodoTitle());\\n```',
    interviewQuestions: [
      {
        q: 'What is the hazard of static JSON test data in parallel runs?',
        a: 'If multiple tests use the same static account details concurrently, actions in one test (like updating a password) will log out or fail other tests using that account.'
      }
    ],
    cheatsheet: 'const user = DataFactory.makeUser();'
  },

  // PART 6: API TESTING
  {
    filename: '25-api-request.md',
    title: 'APIRequestContext & HTTP Calls',
    part: 'Part 6: API Testing',
    objectives: ['Perform API requests using the request fixture', 'Validate API response states', 'Set up token headers'],
    prerequisites: ['Chapter 24: Test Data Management'],
    readingTime: '20 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'API testing is faster than UI testing. Using direct API requests validates service layers and speeds up test setups.',
    diagram: `
[request Fixture] ──► HTTP POST request ──► API Server ──► Validate Status 200
    `,
    content: 'Using Playwright APIRequestContext, you can trigger HTTP calls directly inside your tests. This is useful for validating backend APIs and setting up test states.',
    codeExample: `
test('verify API product creation', async ({ request }) => {
  const res = await request.post('/api/products', {
    data: { name: 'Wireless Mouse', price: 29.99 }
  });
  expect(res.status()).toBe(201);
});
    `,
    dos: [
      'Use the built-in request fixture for direct API calls.',
      'Verify status codes and response JSON payloads.'
    ],
    donts: [
      'Do not use page-based routing to test standalone backend API endpoints.'
    ],
    summary: [
      'Trigger HTTP requests directly using request context.',
      'Verify server JSON payloads and response header configurations.',
      'Create hybrid setups combining UI flows and API verifications.'
    ],
    exercises: [
      'Write a POST request that registers a user and assert the response data.',
      'Create an API test that validates error payloads on bad requests.'
    ],
    miniProject: 'Build a schema validator client for backend services.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('verify post user request', async ({ request }) => {
  const res = await request.post('/api/users', {
    data: { name: 'Alice', email: 'alice@test.com' }
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.id).toBeDefined();
});`,
      `// Exercise 2 Solution:
test('bad request validator', async ({ request }) => {
  const res = await request.post('/api/users', { data: {} }); // Missing fields
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toContain('Validation failed');
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
import { z } from 'zod';
const Schema = z.object({ status: z.string(), code: z.number() });
async function validateApi(response: any) {
  const data = await response.json();
  return Schema.safeParse(data).success;
}`,
    progressiveProject: '**TodoMVC Step**: Use the `request` APIRequestContext to fetch the current app status and verify localStorage state:\\n```typescript\\ntest("api status check", async ({ request }) => {\\n  const res = await request.get("https://demo.playwright.dev/todomvc");\\n  expect(res.status()).toBe(200);\\n});\\n```',
    interviewQuestions: [
      {
        q: 'How is the request fixture isolated from the page context?',
        a: 'The request fixture operates as a standalone HTTP client. It does not load page assets (HTML, CSS) or run browser engines, making it fast and lightweight.'
      }
    ],
    cheatsheet: 'await request.get("/api/endpoint");'
  },
  {
    filename: '26-hybrid-topologies.md',
    title: 'Hybrid Testing Topologies',
    part: 'Part 6: API Testing',
    objectives: ['Combine API and UI flows', 'Seed page state using API calls', 'Inject auth states'],
    prerequisites: ['Chapter 25: APIRequestContext & HTTP Calls'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Using the UI for every setup step (like creating a user just to check a profile edit) slows down runs. Hybrid flows speed this up.',
    diagram: `
[API Call to /login] ──► Extract Session Token ──► addCookies(Token) ──► goto(/dashboard)
    `,
    content: 'Hybrid testing combines direct API calls with UI interactions. You use APIs to handle prerequisites (like creating items or authenticating) and use the browser page only to verify the target layout. In hybrid setups, the session handshake is critical: you must extract the authentication token directly from the API response and inject it as a cookie (or localStorage item) into the browser context before attempting page navigation, bypassing UI login forms completely. Make sure the domain cookie parameter is resolved dynamically based on environment configuration URL targets to prevent injection rejects across pipelines.',
    codeExample: `
test('edit product details via hybrid setup', async ({ request, page }) => {
  // 1. Authenticate via API and fetch auth token
  const authRes = await request.post('/api/auth/login', {
    data: { user: 'admin', pass: 'secret' }
  });
  const { sessionToken } = await authRes.json();

  // 2. Session Handshake: Resolve environment URL target and inject cookie dynamically
  const targetUrl = process.env.BASE_URL || 'https://staging.enterprise.com';
  const domainHost = new URL(targetUrl).hostname;

  await page.context().addCookies([{
    name: 'auth_token',
    value: sessionToken,
    domain: domainHost,
    path: '/'
  }]);

  // 3. Navigate directly to product details page in the UI
  await page.goto('/products/edit/123');
  await page.getByLabel('Name').fill('Office Chair');
  await page.getByRole('button', { name: 'Save' }).click();
});
    `,
    dos: [
      'Use direct API requests to handle test prerequisites.',
      'Inject session cookies directly into contexts to bypass login pages.'
    ],
    donts: [
      'Do not use UI steps for setups when API options are available.'
    ],
    summary: [
      'Perform authentication or resource seeding via HTTP requests.',
      'Navigate directly to test target views using seeded session tokens.',
      'Minimize browser execution time to optimize pipeline speed.'
    ],
    exercises: [
      'Write a test that registers a user via an API and logs them in via the UI.',
      'Verify cart checkout layouts by seeding the cart using API requests first.'
    ],
    miniProject: 'Build a hybrid checkout suite with API setup stages.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('hybrid login test', async ({ request, page }) => {
  const res = await request.post('/api/login', { data: { user: 'a', pass: 'b' } });
  const { token } = await res.json();
  await page.context().addCookies([{ name: 'session', value: token, domain: 'localhost', path: '/' }]);
  await page.goto('/dashboard');
  await expect(page.getByText('Welcome')).toBeVisible();
});`,
      `// Exercise 2 Solution:
test('seed cart before loading page', async ({ request, page }) => {
  await request.post('/api/cart/add', { data: { item: 'Widget', qty: 2 } });
  await page.goto('/cart');
  await expect(page.getByTestId('cart-total')).toHaveText('$19.98');
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
test('hybrid checkout test', async ({ request, page }) => {
  const auth = await request.post('/api/auth');
  // Inject cookies dynamically based on config URL hostname
  await page.goto('/checkout');
});`,
    progressiveProject: '**TodoMVC Step**: Seed todo items via API context simulation, then navigate in the UI:\\n```typescript\\ntest("hybrid todo validation", async ({ request, page }) => {\\n  // TodoMVC has no API backends, so session/state is client-side.\\n  // For hybrid tests, we configure request options and initialize page cookies first.\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  // Proceed to check elements\\n});\\n```',
    interviewQuestions: [
      {
        q: 'What is the main benefit of hybrid testing?',
        a: 'It speeds up test suites. By using APIs to handle setup steps, tests focus their browser execution time on verifying the target user actions.'
      }
    ],
    cheatsheet: 'const data = await (await request.post("/url")).json();'
  },

  // PART 7: CI/CD & INFRASTRUCTURE
  {
    filename: '27-reporting-ecosystem.md',
    title: 'Reporting Ecosystems',
    part: 'Part 7: CI/CD & Infrastructure',
    objectives: ['Configure multi-reporter configurations', 'Generate JUnit XML files', 'Integrate third-party reports (Allure)'],
    prerequisites: ['Chapter 26: Hybrid Testing Topologies'],
    readingTime: '15 mins',
    difficulty: 'Intermediate',
    whyItMatters: 'Telemetry and reports are essential for CI builds. Having both visual HTML dashboards and parseable XML results makes failures easy to analyze.',
    diagram: `
[Test execution complete] ──► [Reporter Configuration]
                                     ├── HTML reporter ──► Visual UI Report
                                     └── JUnit reporter ──► XML result metrics
    `,
    content: 'Playwright supports multiple report outputs. You can configure HTML dashboards, JUnit XML formats for CI analysis, and third-party tools like Allure to track test runs.',
    codeExample: `
// playwright.config.ts reporter options
export default {
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results/junit.xml' }]
  ]
};
    `,
    dos: [
      'Configure JUnit reporters inside CI pipelines to track test metrics.',
      'Save HTML reports as zip artifacts on build failures.'
    ],
    donts: [
      'Do not generate verbose debug reports for passing pipeline runs.'
    ],
    summary: [
      'Output visual HTML dashboards alongside parseable JUnit XML files.',
      'Integrate Allure reports to display step-by-step history trends.',
      'Export failure logs and trace packages on failed runs.'
    ],
    exercises: [
      'Configure Playwright to export both HTML and JUnit reports.',
      'Write a custom reporter that prints a summary of failures to the console.'
    ],
    miniProject: 'Build a Slack notification reporter that sends test results.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
// Add to playwright.config.ts:
// reporter: [
//   ['html', { outputFolder: 'my-report' }],
//   ['junit', { outputFile: 'junit.xml' }]
// ]`,
      `// Exercise 2 Solution:
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
class CustomConsoleReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'passed') {
      console.log(\`❌ Test failed: \${test.title}\`);
    }
  }
}
export default CustomConsoleReporter;`
    ],
    miniProjectSolution: `// Mini-Project Solution:
class SlackReporter implements Reporter {
  async onEnd(result: any) {
    // Send POST payload to Slack webhook URL with result status counts
    console.log('Sending metrics report...');
  }
}`,
    progressiveProject: '**TodoMVC Step**: Configure HTML and JUnit XML reports for your TodoMVC suite:\\n```typescript\\n// playwright.config.ts\\nexport default defineConfig({\\n  reporter: [\\n    ["html", { outputFolder: "playwright-report" }],\\n    ["junit", { outputFile: "results/todomvc-junit.xml" }]\\n  ]\\n});\\n```',
    interviewQuestions: [
      {
        q: 'Why are JUnit reports preferred in CI/CD pipeline runs?',
        a: 'JUnit XML is a standard format. CI platforms (like GitHub Actions or Jenkins) parse it automatically to show pass/fail trends directly in the run summary.'
      }
    ],
    cheatsheet: 'npx playwright show-report'
  },
  {
    filename: '28-docker-execution.md',
    title: 'Docker & Cloud Execution',
    part: 'Part 7: CI/CD & Infrastructure',
    objectives: ['Run tests in Playwright Docker containers', 'Match local and CI execution states', 'Execute visual screenshot assertions'],
    prerequisites: ['Chapter 27: Reporting Ecosystems'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Tests passing locally can fail in CI due to OS-specific subpixel font rendering variations. Running tests and assertions inside Docker solves this, ensuring visual regression tests remain stable.',
    diagram: `
[Local Filesystem] ──► Mount Volume ──► [Docker Container (Playwright Image)]
                                                 ├── Run toHaveScreenshot()
                                                 └── Compare images against Linux baseline
    `,
    content: 'Running tests inside Docker containers ensures your test environment matches local and CI setups. This is mandatory for Visual Snapshot testing. Under the hood, Playwright uses expect(page).toHaveScreenshot() to match the DOM state pixel-by-pixel. If screenshots are captured on macOS or Windows and run on Linux agents, subpixel font differences will trigger visual failures. Operating inside containers enforces identical rendering. For complex applications, you can configure pixel discrepancy thresholds (maxDiffPixels, threshold), mask moving elements (like calendars or banners), or integrate third-party AI-driven visual platforms like Applitools or Percy. Using multi-container platforms like Docker Compose coordinates dynamic setups by mounting local filesystems and matching environment configuration boundaries.',
    codeExample: `
import { test, expect } from '@playwright/test';

// Visual snapshot comparison with thresholds and masking
test('dashboard layout visual test', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Verify layout, masking dynamic graphs and counters
  await expect(page).toHaveScreenshot('dashboard-layout.png', {
    maxDiffPixels: 100, // Maximum pixels allowed to differ
    threshold: 0.2,     // Visual comparison sensitivity factor
    mask: [
      page.locator('.live-chart-container'),
      page.locator('.dynamic-clock')
    ]
  });
});
    `,
    dos: [
      'Generate visual regression baseline snapshots inside the target Docker container.',
      'Use masking parameters to hide dynamic elements in visual assertions.'
    ],
    donts: [
      'Do not verify visual screenshots locally on Windows/Mac against Linux baseline references.',
      'Avoid setting high pixel thresholds that mask actual UI alignment bugs.'
    ],
    summary: [
      'Run screenshot assertions in Docker to match fonts exactly.',
      'Emulate native headless environments in Linux containers.',
      'Integrate with third-party visual platforms like Applitools/Percy.'
    ],
    exercises: [
      'Run a containerized test suite and output visual baseline images.',
      'Write a visual assertion that masks a dynamic timestamp text block.'
    ],
    miniProject: 'Build a docker-compose setup to orchestrate visual testing sweeps.\n\nHere is a minimal docker-compose.yml configuration model for multi-container tests:\n\n```yaml\nversion: \'3.8\'\nservices:\n  playwright:\n    image: mcr.microsoft.com/playwright:v1.44.0-jammy\n    volumes:\n      - .:/work\n    working_dir: /work\n    environment:\n      - BASE_URL=http://app:3000\n    command: npx playwright test\n```',
    exerciseSolutions: [
      `# Exercise 1 Solution:
# 1. Create a baseline snapshot:
docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.44.0-jammy npx playwright test --update-snapshots
# 2. Subsequent runs compare against this baseline.`,
      `// Exercise 2 Solution:
test('masked element visual comparison', async ({ page }) => {
  await page.goto('/dynamic-content');
  await expect(page).toHaveScreenshot({
    mask: [page.locator('.dynamic-timestamp')]
  });
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Save docker-compose.yml exactly as mapped in the requirements, and run:
// docker-compose up --exit-code-from playwright`,
    progressiveProject: '**TodoMVC Step**: Write a visual screenshot test for the todo list layout to prevent regression:\\n```typescript\\ntest("visual todo list layout", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  await page.getByPlaceholder("What needs to be done?").fill("Visual Test");\\n  await page.getByPlaceholder("What needs to be done?").press("Enter");\\n  await expect(page).toHaveScreenshot("todomvc-layout.png", {\\n    maxDiffPixels: 50,\\n    threshold: 0.1\\n  });\\n});\\n```',
    interviewQuestions: [
      {
        q: 'Why do visual screenshot tests fail in CI when created on macOS or Windows?',
        a: 'Operating systems smooth fonts differently at the subpixel level. Linux (CI runner) renders fonts slightly differently from Windows/Mac, resulting in high pixel mismatches. Standardizing runs inside Docker eliminates this variation.'
      }
    ],
    cheatsheet: 'docker run -v $(pwd):/work mcr.microsoft.com/playwright:...'
  },
  {
    filename: '29-github-actions.md',
    title: 'GitHub Actions End-to-End',
    part: 'Part 7: CI/CD & Infrastructure',
    objectives: ['Build a GitHub Actions workflow', 'Configure node caching', 'Upload report artifacts'],
    prerequisites: ['Chapter 28: Docker & Cloud Execution'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Automating tests on Pull Requests checks code changes immediately, preventing broken builds from merging into main branches.',
    diagram: `
[Git Commit Push] ──► Trigger GitHub Action Workflow ──► Map Secrets ──► Run tests ──► Upload artifacts
    `,
    content: 'Configure GitHub Actions workflows to run test suites on push or pull requests. Use action steps to cache dependencies, install browsers, run tests, and upload reports. To prevent pipeline credential leaks, secret tokens or passwords must never be stored in plain text. Instead, fetch them from vault stores and map them as masked environment variables directly within runner steps.',
    codeExample: `
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      
      # ✅ Map masked secrets securely as environment variables
      - name: Run Test Suite
        env:
          ENTERPRISE_API_KEY: \${{ secrets.API_KEY }}
        run: npx playwright test
    `,
    dos: [
      'Cache node_modules in the runner to speed up build setup steps.',
      'Configure upload-artifact steps to save HTML reports on failures.',
      'Securely map vault keys into masked GitHub Secrets variables.'
    ],
    donts: [
      'Do not omit browser installation dependencies (--with-deps).',
      'Never print plain text credentials directly to the console or job logs.'
    ],
    summary: [
      'Construct GHA workflows triggering on code check-ins.',
      'Cache node_modules to accelerate pipeline execution speeds.',
      'Archive test reports and screenshot outputs as run artifacts.'
    ],
    exercises: [
      'Write a GitHub Actions workflow that runs your tests on every pull request.',
      'Configure build alerts to notify the team when a test suite fails.'
    ],
    miniProject: 'Build a pull request validation check with automated reports.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
# Create .github/workflows/playwright.yml:
# on: [pull_request]
# jobs:
#   test:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-node@v4
#       - run: npm ci
#       - run: npx playwright install --with-deps
#       - run: npx playwright test`,
      `# Exercise 2 Solution:
# Add steps to the workflow:
# - name: Send Alert
#   if: failure()
#   run: curl -X POST -H 'Content-type: application/json' --data '{"text":"Pipeline failed!"}' https://hooks.slack.com/services/T00/B00/X00`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Complete workflow configuration utilizing:
// - uses: actions/upload-artifact@v4
//   if: always()
//   with:
//     name: playwright-report
//     path: playwright-report/`,
    progressiveProject: '**TodoMVC Step**: Create a GitHub Actions workflow for the TodoMVC suite:\\n```yaml\\n# .github/workflows/todomvc.yml\\nname: TodoMVC CI\\non: [push, pull_request]\\njobs:\\n  run-tests:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - uses: actions/checkout@v4\\n      - uses: actions/setup-node@v4\\n      - run: npm ci\\n      - run: npx playwright install --with-deps\\n      - run: npx playwright test\\n```',
    interviewQuestions: [
      {
        q: 'Why should you cache npm dependencies inside CI runners?',
        a: 'Caching avoids downloading packages from scratch on every run, saving bandwidth and reducing build durations.'
      }
    ],
    cheatsheet: 'uses: actions/upload-artifact@v4'
  },
  {
    filename: '30-jenkins-azure.md',
    title: 'Jenkins & Azure DevOps Pipelines',
    part: 'Part 7: CI/CD & Infrastructure',
    objectives: ['Build Jenkins declarative pipelines', 'Configure Azure DevOps pipelines', 'Publish test results'],
    prerequisites: ['Chapter 29: GitHub Actions End-to-End'],
    readingTime: '20 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Enterprise teams often use Jenkins or Azure DevOps. Knowing how to run Playwright tests in these pipelines helps integrate tests into corporate workflows.',
    diagram: `
[Jenkinsfile Build Trigger] ──► Checkout masked secrets ──► playwright run ──► publish JUnit results
    `,
    content: 'This chapter explains how to configure Jenkins declarative pipelines and Azure DevOps pipelines, including running tests, managing secrets, and publishing JUnit XML reports. Both frameworks support credentials bindings. For example, Jenkins uses the withCredentials block to bind credential vault IDs to local execution variables safely without leaks.',
    codeExample: `
// Jenkinsfile declarative pipeline snippet
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
                
                // ✅ Securely fetch masked credential bindings
                withCredentials([string(credentialsId: 'DB_PASS', variable: 'DATABASE_PASSWORD')]) {
                    sh 'DATABASE_PASSWORD=\${DATABASE_PASSWORD} npx playwright test'
                }
            }
        }
    }
}
    `,
    dos: [
      'Publish JUnit XML reports in Azure DevOps using the PublishTestResults task.',
      'Run builds inside Docker containers on Jenkins agent runners.',
      'Inject sensitive keys strictly using credentials helper blocks.'
    ],
    donts: [
      'Do not run tests in headed mode inside Jenkins or Azure DevOps agents.'
    ],
    summary: [
      'Author Jenkins declarative pipelines or Azure yml definitions.',
      'Publish JUnit test metrics to dashboard reporting pipelines.',
      'Pass secret authentication credentials using environment variables.'
    ],
    exercises: [
      'Write a Jenkinsfile stage that runs your tests and generates reports.',
      'Configure an Azure DevOps pipeline step to publish JUnit results.'
    ],
    miniProject: 'Build a pipeline setup script for an enterprise workspace.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
# declarative Jenkinsfile:
# stage('Test') {
#   steps {
#     sh 'npm ci'
#     sh 'npx playwright install --with-deps'
#     sh 'npx playwright test'
#   }
# }`,
      `# Exercise 2 Solution:
# Azure DevOps pipeline task:
# - task: PublishTestResults@2
#   inputs:
#     testResultsFormat: 'JUnit'
#     testResultsFiles: '**/results/junit.xml'
#     mergeTestResults: true`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Bash orchestrator script for Azure/Jenkins:
// #!/bin/bash
// npm ci && npx playwright install --with-deps && npx playwright test`,
    progressiveProject: '**TodoMVC Step**: Write a Jenkinsfile for the same TodoMVC automation suite:\\n```groovy\\n// Jenkinsfile\\npipeline {\\n    agent any\\n    stages {\\n        stage(\'Run Playwright\') {\\n            steps {\\n                sh \'npm ci\'\\n                sh \'npx playwright install --with-deps\'\\n                sh \'npx playwright test\'\\n            }\\n        }\\n    }\\n}\\n```',
    interviewQuestions: [
      {
        q: 'How do you publish test results inside Azure DevOps pipelines?',
        a: 'Use the PublishTestResults@2 task, pointing its search path to the JUnit XML report generated by Playwright.'
      }
    ],
    cheatsheet: 'task: PublishTestResults@2'
  },
  {
    filename: '31-system-design.md',
    title: 'System Design Whiteboard Scenarios',
    part: 'Part 8: Interview Preparation',
    objectives: ['Design automated testing architectures', 'Mock API boundaries', 'Manage execution reporting'],
    prerequisites: ['Chapter 30: Jenkins & Azure DevOps Pipelines'],
    readingTime: '25 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Senior SDET interviews test your system design skills. Knowing how to build robust, scalable automation architectures is key for these roles.',
    diagram: `
  [Code Repository] ──► Trigger PR Run ──► [Docker Execution Cluster]
                                                ├── Database Seeding API
                                                ├── Network Mocks (page.route)
                                                └── Telemetry (S3 Traces Bucket)
    `,
    content: 'This chapter guides you through senior SDET interview system design scenarios, focusing on designing testing architectures, API mocking, parallel run scheduling, and telemetry reporting. A key design principle is handling the dependency trade-off: over-mocking speeds up executions but compromises validation fidelity. Systems should partition verification into test tiers: fast hermetic suites with schema-validated API mocking, paired with staging environment integration pipelines executing complete end-to-end user journeys against live backend and database configurations.',
    codeExample: `
// Implemented whiteboard test infrastructure design configuration
export class TestInfrastructureDesign {
  readonly telemetryEndpoint: string;
  readonly workerLimit: number;
  readonly databaseSeedingUrl: string;

  constructor(env: string) {
    this.telemetryEndpoint = env === 'prod' ? 'https://telemetry.enterprise.com' : 'https://staging-telemetry.org';
    this.workerLimit = env === 'prod' ? 8 : 4;
    this.databaseSeedingUrl = env === 'prod' ? 'https://db-api.prod.com' : 'http://localhost:5000/db/seed';
  }

  async triggerTelemetryAlert(errorType: string, message: string) {
    console.log('Sending error trace to ' + this.telemetryEndpoint + ' - ' + errorType + ': ' + message);
    
    // Simulate real transport dispatch call (e.g. POST network alert)
    // await this.page.request.post(this.telemetryEndpoint + '/alerts', { data: { errorType, message } });
  }
}
    `,
    dos: [
      'Structure your design explanations around environment setup, execution, data seeding, and reporting.',
      'Advocate for API mocking to isolate UI tests and speed up builds.'
    ],
    donts: [
      'Avoid complex architectures without first addressing data isolation.',
      'Avoid relying solely on mocked endpoints in design plans without introducing unmocked staging regression runs to capture integration bugs.'
    ],
    summary: [
      'Design decoupled architectures separating seeding, execution, and logs.',
      'Balance API routing mocks with actual integration environment checks.',
      'Store runtime trace archives to external cloud storage systems.'
    ],
    exercises: [
      'Sketch a whiteboard diagram representing the test pipeline for a payment application.',
      'List the tools and strategies needed to test a microservices system.'
    ],
    miniProject: 'Write an architecture design document for an automation suite.',
    exerciseSolutions: [
      `# Exercise 1 Solution:
# Draw a flowchart layout with components:
# 1. GitHub PR Hook -> 2. Jenkins Trigger -> 3. Docker Spawned ->
# 4. DB Seed API -> 5. Playwright execution -> 6. Publish Allure report`,
      `# Exercise 2 Solution:
# 1. API mocking hermetic layer (mocking auth/third party search index).
# 2. Database seeding API context (seeding specific tenant users directly).
# 3. Native integration checks (no mock checkout payments suite).`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// High-level system layout outlining layers for:
// - Connection pooling limits
// - S3 trace archive uploads`,
    progressiveProject: '**TodoMVC Step**: Design a whiteboard architecture diagram for the TodoMVC testing system:\\n```\\n[Git PR Commit] ──► [Docker Run] ──► [Mocked localStorage State] ──► [Test Executed] ──► [JUnit XML Export]\\n```',
    interviewQuestions: [
      {
        q: 'How do you handle test data generation in a parallel execution design?',
        a: 'Use dynamic data factories to generate unique accounts for each test, seed data via APIs before tests run, or configure isolated databases for each worker process.'
      }
    ],
    cheatsheet: 'Design layers: Seeding, Execution, Mocking, Telemetry'
  },
  {
    filename: '32-coding-challenges.md',
    title: 'Common Interview Coding Challenges',
    part: 'Part 8: Interview Preparation',
    objectives: ['Solve automated table pagination challenges', 'Mock MFA verification workflows', 'Validate column sorting'],
    prerequisites: ['Chapter 31: System Design Whiteboard Scenarios'],
    readingTime: '25 mins',
    difficulty: 'Advanced',
    whyItMatters: 'Coding challenges test your hands-on Playwright skills. Mastering common problems like sorting and paginating tables helps you clear technical interviews.',
    diagram: `
[Read table column cells] ──► Parse values ──► Verify order is sorted
    `,
    content: 'This chapter compiles standard coding tasks, including iterating through paginated lists, verifying table column sorting, and mocking MFA/OTP authentication steps.',
    codeExample: `
// Coding Challenge: Verify table column sorting
test('check price column sorting', async ({ page }) => {
  await page.getByRole('columnheader', { name: 'Price' }).click();
  const prices = await page.getByRole('row').getByRole('cell').allTextContents();
  const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
  const isSorted = numericPrices.every((v, i, a) => !i || a[i - 1] <= v);
  expect(isSorted).toBe(true);
});
    `,
    dos: [
      'Use content-based filters (.filter()) instead of loops with hardcoded index numbers.',
      'Wait for loading indicators (progressbar) to disappear after actions that refresh data.'
    ],
    donts: [
      'Avoid using nested loops or sleep statements to solve synchronization problems in tests.'
    ],
    summary: [
      'Solve paginated table scans by locating next-page buttons.',
      'Verify column sorting arrays by mapping DOM text to numbers.',
      'Handle complex OTP scenarios using API intercepts or mocks.'
    ],
    exercises: [
      'Write a script that navigates through a paginated list until it finds and clicks a target row.',
      'Mock an OTP verification API response and check if the login succeeds.'
    ],
    miniProject: 'Build a collection of common automation coding challenge solutions.',
    exerciseSolutions: [
      `// Exercise 1 Solution:
test('paginated scan check', async ({ page }) => {
  await page.goto('/paginated-table');
  let hasNext = true;
  while (hasNext) {
    const rows = await page.getByRole('row').allTextContents();
    console.log('Row count on page:', rows.length);
    const nextBtn = page.getByRole('button', { name: 'Next' });
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
    } else {
      hasNext = false;
    }
  }
});`,
      `// Exercise 2 Solution:
test('mock OTP code', async ({ page }) => {
  await page.route('**/api/otp', (route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ code: '123456' }) });
  });
  await page.goto('/login');
  await page.getByLabel('OTP').fill('123456');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/dashboard/);
});`
    ],
    miniProjectSolution: `// Mini-Project Solution:
// Unified challenge suite containing pagination, column verification, and dialog interceptors.`,
    progressiveProject: '**TodoMVC Step**: Solve: navigate through active and completed filters to verify counts:\\n```typescript\\ntest("todo count verification through filters", async ({ page }) => {\\n  await page.goto("https://demo.playwright.dev/todomvc");\\n  const input = page.getByPlaceholder("What needs to be done?");\\n  await input.fill("Task 1");\\n  await input.press("Enter");\\n  await input.fill("Task 2");\\n  await input.press("Enter");\\n\\n  // Complete first todo\\n  await page.getByRole("listitem").filter({ hasText: "Task 1" }).getByRole("checkbox").click();\\n\\n  // Toggle Completed filter\\n  await page.getByRole("link", { name: "Completed" }).click();\\n  await expect(page.getByTestId("todo-title")).toHaveCount(1);\\n\\n  // Toggle Active filter\\n  await page.getByRole("link", { name: "Active" }).click();\\n  await expect(page.getByTestId("todo-title")).toHaveCount(1);\\n});\\n```',
    interviewQuestions: [
      {
        q: 'How do you select a button inside a specific table row containing a target text?',
        a: 'Locate the row using page.getByRole("row").filter({ hasText: "target" }), and then search inside that row: row.getByRole("button", { name: "Action" }).click().'
      }
    ],
    cheatsheet: 'row.filter({ hasText: "target" }).getByRole("button").click()'
  }
];

function generateBook() {
  console.log('🏁 Starting compilation of the Expanded Automation Nexus Academy Handbook (40 Chapters)...');

  if (!fs.existsSync(HANDBOOK_DIR)) {
    fs.mkdirSync(HANDBOOK_DIR, { recursive: true });
  }

  // Iterate and write each chapter
  chapters.forEach((ch, index) => {
    const chNum = String(index + 1).padStart(2, '0');
    // Fix: Use ch.filename directly to prevent double-numbering
    const filePath = path.join(HANDBOOK_DIR, ch.filename);
    
    // Format Chapter using textbook design template
    const markdownContent = `
# Chapter ${index + 1}: ${ch.title}

## Metadata
* **Part**: ${ch.part}
* **Learning Objectives**:
${ch.objectives.map(obj => `  - ${obj}`).join('\n')}
* **Prerequisites**:
${ch.prerequisites.map(pre => `  - ${pre}`).join('\n')}
* **Estimated Reading Time**: ${ch.readingTime}
* **Difficulty Level**: ${ch.difficulty}

---

## 1. Why This Matters
${ch.whyItMatters}

---

## 2. Conceptual Overview
${ch.content}

### Execution Flow Diagram
\`\`\`
${ch.diagram.trim()}
\`\`\`

---

## 3. Implementation and Code Examples
\`\`\`typescript
${ch.codeExample.trim()}
\`\`\`

---

## 4. Best Practices (Do's and Don'ts)

### Do
${ch.dos.map(doItem => `* ${doItem}`).join('\n')}

### Don't
${ch.donts.map(dontItem => `* ${dontItem}`).join('\n')}

---

## 5. Chapter Summary
${ch.summary.map(sumItem => `* ${sumItem}`).join('\n')}

---

## 6. Exercises & Mini-Project

### Exercises
${ch.exercises.map((ex, i) => {
  const sol = ch.exerciseSolutions && ch.exerciseSolutions[i] ? ch.exerciseSolutions[i] : 'No solution provided.';
  return `${i + 1}. ${ex}\n\n<details>\n<summary>💡 Exercise ${i + 1} Solution</summary>\n\n\`\`\`\n${sol.trim()}\n\`\`\`\n\n</details>`;
}).join('\n\n')}

### Mini-Project
${ch.miniProject}

<details>
<summary>💡 Mini-Project Solution</summary>

\`\`\`
${ch.miniProjectSolution ? ch.miniProjectSolution.trim() : 'No solution provided.'}
\`\`\`

</details>

---

## 7. Progressive Project: TodoMVC Automation
${ch.progressiveProject}

---

## 8. Interview Q&A Preparation
${ch.interviewQuestions.map((iq, i) => `
**Q${i + 1}: ${iq.q}**
* **Expected Answer:** ${iq.a}
`).join('\n')}

---

## 9. Chapter Cheat Sheet
\`\`\`
${ch.cheatsheet.trim()}
\`\`\`
    `.trim();

    fs.writeFileSync(filePath, markdownContent);
    console.log(`- Created Chapter ${chNum}: ${ch.title}`);
  });

  console.log(`✅ Completed! Generated 40 textbook chapters under: ${HANDBOOK_DIR}`);
}

// Run
generateBook();

