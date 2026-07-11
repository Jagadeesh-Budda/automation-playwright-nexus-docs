# Chapter 31: Onboarding & Transition Guides

## Metadata
* **Part**: Part 5: Enterprise Automation
* **Learning Objectives**:
  - Establish coding standards
  - Migrate legacy test suites
  - Configure AST linter rules
* **Prerequisites**:
  - Chapter 22: Flaky Test Troubleshooting
* **Estimated Reading Time**: 20 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Onboarding new developers to a unified codebase prevents style deviations. Automated AST checks enforce these coding rules by inspecting the compiler syntax trees.

---

## 2. Conceptual Overview
When a compiler or linter parses code, it builds an Abstract Syntax Tree (AST). By traversing this tree programmatically, we can detect and block unsafe anti-patterns—such as calling page.waitForTimeout(5000)—without relying on fragile regex search patterns. This chapter details Cypress-to-Playwright migration maps, framework standards, and custom linter setups. To enforce quality gates, the pre-commit checker must execute a process.exit(1) code if any issues are flagged, forcing the git pre-commit hook to abort.

### Execution Flow Diagram
```
[New Code Commit] ──► Pre-commit check (AST linter) ──► Blocks anti-patterns (waitForTimeout) ──► Merge
```

---

## 3. Implementation and Code Examples
```typescript
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
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Maintain clear transition guides for engineers moving from other frameworks.
* Enforce coding standards automatically using custom AST linter checks.

### Don't
* Avoid manually checking for styling rule violations during code reviews.

---

## 5. Chapter Summary
* Use transition maps for Cypress or Selenium developer migration.
* Implement AST checkers to block banned API methods dynamically.
* Lint codebase formatting before commit hooks trigger pipelines.

---

## 6. Exercises & Mini-Project

### Exercises
1. Write an AST script that flags any occurrence of page.waitForTimeout.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
// Exercise 1 Solution:
import * as ts from 'typescript';
// AST parser checking for banned wait statements:
// Search for CallExpression where expression.name.text === 'waitForTimeout'
// Throw compile/AST exit error code: process.exit(1)
```

</details>

2. Translate a Selenium Java test block into a Playwright TypeScript spec.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
// Exercise 2 Solution:
// Cypress: cy.visit('/login'); cy.get('#user').type('admin'); cy.contains('Submit').click();
// Playwright:
await page.goto('/login');
await page.getByLabel('Username').fill('admin');
await page.getByRole('button', { name: 'Submit' }).click();
```

</details>

### Mini-Project
Build a Cypress-to-Playwright code translation helper.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// Simple text replacer Cypress helper:
function translateCypressToPlaywright(cyCode: string): string {
  return cyCode
    .replace(/cy\.visit\(([^)]+)\)/g, 'await page.goto($1)')
    .replace(/cy\.get\(([^)]+)\)\.type\(([^)]+)\)/g, 'await page.locator($1).fill($2)');
}
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Build an AST checker that prevents using `page.waitForTimeout` inside your TodoMVC automation project:
```typescript
// scripts/ast-guard.ts
import * as ts from "typescript";
import * as fs from "fs";
// Set up programmatic AST checks on spec files to block waitForTimeout
// If any violation is found, exit process with process.exit(1) to block git commit
```

---

## 8. Interview Q&A Preparation

**Q1: Why are automated quality gates preferred over manual code reviews for code styles?**
* **Expected Answer:** Automated gates are consistent, run instantly on commit, and prevent style arguments, leaving code reviews focused on architecture and logic.


---

## 9. Chapter Cheat Sheet
```
npm run lint // run coding standards lint
```